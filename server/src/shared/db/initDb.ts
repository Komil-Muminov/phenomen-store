import { Client, Pool } from 'pg';
import { createAdminPool, pool, closePool } from '@/shared/db';
import { Env } from '@/shared/config';
import { CORE_SCHEMA_SQL } from '@/shared/db/schema.core';
import { CATALOG_SCHEMA_SQL } from '@/shared/db/schema.catalog';
import { SALES_SCHEMA_SQL } from '@/shared/db/schema.sales';
import { PLATFORM_SCHEMA_SQL } from '@/shared/db/schema.platform';

const TENANT_TABLES = [
  'tenant_configs',
  'users',
  'otp_codes',
  'addresses',
  'storefront_sections',
  'banners',
  'categories',
  'products',
  'product_variants',
  'product_media',
  'attributes',
  'favorites',
  'reviews',
  'carts',
  'cart_items',
  'orders',
  'order_items',
  'order_status_history',
  'payments',
  'delivery_zones',
  'promotions',
];

const DEMO_THEME = {
  colors: {
    primary: '#111827',
    onPrimary: '#ffffff',
    accent: '#e11d48',
    background: '#ffffff',
    surface: '#f6f6f7',
    text: '#0f172a',
    muted: '#6b7280',
    border: '#e5e7eb',
    danger: '#dc2626',
    success: '#16a34a',
  },
  radius: { sm: 8, md: 14, lg: 22 },
  density: 'comfortable',
  cardStyle: 'elevated',
};

const DEMO_SECTIONS = [
  { type: 'banner_carousel', title: null, position: 10, params: { autoplay: true, interval: 5000 } },
  { type: 'category_grid', title: 'Категории', position: 20, params: { columns: 3, limit: 6 } },
  { type: 'product_rail', title: 'Новинки', position: 30, params: { sort: 'created_at', limit: 10 } },
  { type: 'promo_block', title: 'Скидки до 50%', position: 40, params: { collection: 'sale' } },
];

const DEMO_BANNERS = [
  {
    imageUrl: 'https://placehold.co/800x400/111827/ffffff?text=NEW+SEASON',
    title: 'Новая коллекция',
    subtitle: 'Осень-зима уже в продаже',
    position: 10,
  },
  {
    imageUrl: 'https://placehold.co/800x400/e11d48/ffffff?text=SALE+-50',
    title: 'Распродажа',
    subtitle: 'Скидки до 50% на базовые модели',
    position: 20,
  },
];

const DEMO_CATEGORIES = [
  { slug: 'women', name: 'Женщинам', position: 10 },
  { slug: 'men', name: 'Мужчинам', position: 20 },
  { slug: 'accessories', name: 'Аксессуары', position: 30 },
];

const SERVICE_DATABASE = 'postgres';

const ensureDatabase = async (): Promise<void> => {
  const client = new Client({
    host: Env.db.host,
    port: Env.db.port,
    user: Env.db.user,
    password: Env.db.password,
    database: SERVICE_DATABASE,
  });

  await client.connect();

  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [Env.db.database]);

    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${Env.db.database}"`);
    }
  } finally {
    await client.end();
  }
};

const IDENTIFIER_PATTERN = /^[a-z_][a-z0-9_]*$/;

const runFormatted = async (
  admin: Pool,
  template: string,
  params: string[],
): Promise<void> => {
  const placeholders = params.map((_value, index) => `$${index + 2}::text`).join(', ');
  const built = await admin.query<{ sql: string }>(
    `SELECT format($1::text, ${placeholders}) AS sql`,
    [template, ...params],
  );

  await admin.query(built.rows[0].sql);
};

const applyRowLevelSecurity = async (admin: Pool): Promise<void> => {
  for (const table of TENANT_TABLES) {
    await admin.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    await admin.query(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`);
    await admin.query(`DROP POLICY IF EXISTS ${table}_tenant_isolation ON ${table}`);
    await admin.query(`
      CREATE POLICY ${table}_tenant_isolation ON ${table}
      USING (tenant_id::text = current_setting('app.tenant_id', true))
      WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true))
    `);
  }
};

const ensureAppRole = async (admin: Pool): Promise<void> => {
  const role = Env.db.appUser;

  if (!IDENTIFIER_PATTERN.test(role)) {
    throw new Error(`Недопустимое имя роли БД: ${role}`);
  }

  const existing = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role]);

  if (existing.rowCount === 0) {
    await runFormatted(admin, 'CREATE ROLE %I LOGIN PASSWORD %L', [role, Env.db.appPassword]);
  } else {
    await runFormatted(admin, 'ALTER ROLE %I LOGIN PASSWORD %L', [role, Env.db.appPassword]);
  }

  await runFormatted(admin, 'ALTER ROLE %I NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE', [role]);
};

const grantAppPrivileges = async (admin: Pool): Promise<void> => {
  const role = Env.db.appUser;

  await runFormatted(admin, 'GRANT CONNECT ON DATABASE %I TO %I', [Env.db.database, role]);
  await runFormatted(admin, 'GRANT USAGE ON SCHEMA public TO %I', [role]);
  await runFormatted(
    admin,
    'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I',
    [role],
  );
  await runFormatted(admin, 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', [role]);
  await runFormatted(
    admin,
    'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I',
    [role],
  );
  await runFormatted(
    admin,
    'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I',
    [role],
  );
};

const seedDemoTenant = async (): Promise<void> => {
  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO tenants (key, name, vertical, plan, bundle_id)
     VALUES ($1, $2, 'fashion', 'pro', $3)
     ON CONFLICT (key) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [Env.defaultTenantKey, 'PHENOMEN Fashion', 'store.phenomen.fashion'],
  );

  const tenantId = inserted.rows[0].id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    await client.query(
      `INSERT INTO tenant_configs (tenant_id, brand, theme, locale, order_rules, payment, delivery, features, contacts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (tenant_id) DO NOTHING`,
      [
        tenantId,
        JSON.stringify({ title: 'PHENOMEN Fashion', logoUrl: null, slogan: 'Одежда, которая работает на вас' }),
        JSON.stringify(DEMO_THEME),
        JSON.stringify({ language: 'ru', currency: 'RUB', currencySymbol: '₽', timezone: 'Europe/Moscow' }),
        JSON.stringify({ minOrderTotal: 1500, maxItemsPerOrder: 50, guestCheckout: true }),
        JSON.stringify({ methods: ['card_online', 'cash_on_delivery'], provider: 'manual' }),
        JSON.stringify({ methods: ['courier', 'pickup'], freeFrom: 5000, basePrice: 390 }),
        JSON.stringify({ favorites: true, reviews: true, promoCodes: true, sizeGuide: true }),
        JSON.stringify({ phone: '+7 900 000-00-00', email: 'support@phenomen.store' }),
      ],
    );

    for (const section of DEMO_SECTIONS) {
      await client.query(
        `INSERT INTO storefront_sections (tenant_id, type, title, position, params)
         SELECT $1, $2, $3, $4, $5
         WHERE NOT EXISTS (
           SELECT 1 FROM storefront_sections WHERE tenant_id = $1 AND type = $2 AND position = $4
         )`,
        [tenantId, section.type, section.title, section.position, JSON.stringify(section.params)],
      );
    }

    for (const banner of DEMO_BANNERS) {
      await client.query(
        `INSERT INTO banners (tenant_id, image_url, title, subtitle, position)
         SELECT $1, $2, $3, $4, $5
         WHERE NOT EXISTS (
           SELECT 1 FROM banners WHERE tenant_id = $1 AND image_url = $2
         )`,
        [tenantId, banner.imageUrl, banner.title, banner.subtitle, banner.position],
      );
    }

    for (const category of DEMO_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (tenant_id, slug, name, position)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tenant_id, slug) DO NOTHING`,
        [tenantId, category.slug, category.name, category.position],
      );
    }

    await client.query(
      `INSERT INTO promotions (tenant_id, code, name, kind, conditions, actions)
       SELECT $1, $2, $3, $4, $5::jsonb, $6::jsonb
       WHERE NOT EXISTS (SELECT 1 FROM promotions WHERE tenant_id = $1 AND code = $2)`,
      [
        tenantId,
        'PHENOMEN10',
        'Скидка 10% от 3000',
        'cart_percent',
        JSON.stringify({ minTotal: 3000 }),
        JSON.stringify({ percent: 10 }),
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const initDb = async (): Promise<void> => {
  await ensureDatabase();

  const admin = createAdminPool();

  try {
    await admin.query(CORE_SCHEMA_SQL);
    await admin.query(CATALOG_SCHEMA_SQL);
    await admin.query(SALES_SCHEMA_SQL);
    await admin.query(PLATFORM_SCHEMA_SQL);
    await applyRowLevelSecurity(admin);
    await ensureAppRole(admin);
    await grantAppPrivileges(admin);
  } finally {
    await admin.end();
  }

  await seedDemoTenant();
};

if (require.main === module) {
  initDb()
    .then(closePool)
    .catch(async (error) => {
      console.error(error);
      await closePool();
      process.exit(1);
    });
}

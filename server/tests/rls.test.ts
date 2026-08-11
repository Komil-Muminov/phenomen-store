import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { Pool } from 'pg';
import { closePool, createAdminPool, tenantQuery } from '@/shared/db';

interface ITenantFixture {
  id: string;
  key: string;
  productName: string;
}

const SKIP_REASON = 'PostgreSQL недоступен — тест изоляции пропущен';

let admin: Pool | null = null;
let alpha: ITenantFixture | null = null;
let beta: ITenantFixture | null = null;

const buildFixture = (suffix: string): ITenantFixture => ({
  id: '',
  key: `rls-test-${suffix}-${Date.now()}`,
  productName: `Товар ${suffix}`,
});

const seedTenant = async (pool: Pool, fixture: ITenantFixture): Promise<ITenantFixture> => {
  const tenant = await pool.query<{ id: string }>(
    `INSERT INTO tenants (key, name, status) VALUES ($1, $2, 'active') RETURNING id`,
    [fixture.key, fixture.key],
  );
  const id = tenant.rows[0].id;

  await pool.query(
    `INSERT INTO products (tenant_id, slug, name, base_price) VALUES ($1, $2, $3, 100)`,
    [id, `slug-${fixture.key}`, fixture.productName],
  );

  return { ...fixture, id };
};

before(async () => {
  const pool = createAdminPool();

  try {
    await pool.query('SELECT 1');
  } catch {
    await pool.end().catch(() => undefined);

    return;
  }

  admin = pool;
  alpha = await seedTenant(pool, buildFixture('alpha'));
  beta = await seedTenant(pool, buildFixture('beta'));
});

after(async () => {
  if (admin && alpha && beta) {
    await admin.query('DELETE FROM tenants WHERE id = ANY($1::uuid[])', [[alpha.id, beta.id]]);
  }

  await admin?.end().catch(() => undefined);
  await closePool().catch(() => undefined);
});

describe('изоляция арендаторов (RLS)', () => {
  it('магазин видит только свои товары', async (t: TestContext) => {
    if (!alpha || !beta) {
      t.skip(SKIP_REASON);

      return;
    }

    const rows = await tenantQuery<{ name: string }>(alpha.id, 'SELECT name FROM products');
    const names = rows.map((row) => row.name);

    assert.ok(names.includes(alpha.productName));
    assert.ok(!names.includes(beta.productName));
  });

  it('чужой товар не находится по идентификатору', async (t: TestContext) => {
    if (!alpha || !beta) {
      t.skip(SKIP_REASON);

      return;
    }

    const rows = await tenantQuery(
      beta.id,
      'SELECT id FROM products WHERE name = $1',
      [alpha.productName],
    );

    assert.equal(rows.length, 0);
  });

  it('запись под чужим tenant_id отклоняется политикой', async (t: TestContext) => {
    if (!alpha || !beta) {
      t.skip(SKIP_REASON);

      return;
    }

    const owner = alpha.id;
    const intruder = beta.id;

    await assert.rejects(() => tenantQuery(
      intruder,
      `INSERT INTO products (tenant_id, slug, name, base_price) VALUES ($1, $2, $3, 1)`,
      [owner, `slug-cross-${Date.now()}`, 'Подделка'],
    ));
  });

  it('без установленного арендатора не видно ничего', async (t: TestContext) => {
    if (!alpha) {
      t.skip(SKIP_REASON);

      return;
    }

    const rows = await tenantQuery(
      '00000000-0000-0000-0000-000000000000',
      'SELECT id FROM products',
    );

    assert.equal(rows.length, 0);
  });
});

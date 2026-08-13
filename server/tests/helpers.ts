import { AddressInfo } from 'node:net';
import { Server } from 'node:http';
import { Pool } from 'pg';
import { app } from '@/app';
import { EntityStatus, TenantHeader, UserRoles } from '@/shared/config';
import { createAdminPool } from '@/shared/db';
import { issueToken } from '@/modules/auth';
import { invalidateTenantCache } from '@/modules/tenant';

export const SKIP_REASON = 'PostgreSQL недоступен — интеграционный тест пропущен';

export interface ITestTenant {
  id: string;
  key: string;
}

export interface ITestContext {
  admin: Pool;
  server: Server;
  baseUrl: string;
  tenant: ITestTenant;
  other: ITestTenant;
}

export interface IJsonResponse {
  status: number;
  body: { success?: boolean; message?: string; data?: unknown };
}

const uniqueKey = (prefix: string): string => (
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
);

const insertTenant = async (admin: Pool, prefix: string): Promise<ITestTenant> => {
  const key = uniqueKey(prefix);
  const rows = await admin.query<{ id: string }>(
    `INSERT INTO tenants (key, name, status) VALUES ($1, $2, $3) RETURNING id`,
    [key, key, EntityStatus.active],
  );

  return { id: rows.rows[0].id, key };
};

export const startContext = async (): Promise<ITestContext | null> => {
  const admin = createAdminPool();

  try {
    await admin.query('SELECT 1');
  } catch {
    await admin.end().catch(() => undefined);

    return null;
  }

  const tenant = await insertTenant(admin, 'test-shop');
  const other = await insertTenant(admin, 'test-other');
  const server = app.listen(0);

  await new Promise<void>((resolve) => server.once('listening', () => resolve()));

  const { port } = server.address() as AddressInfo;

  return { admin, server, baseUrl: `http://127.0.0.1:${port}`, tenant, other };
};

export const stopContext = async (context: ITestContext | null): Promise<void> => {
  if (!context) {
    return;
  }

  await context.admin.query('DELETE FROM tenants WHERE id = ANY($1::uuid[])', [
    [context.tenant.id, context.other.id],
  ]);
  await context.admin.end().catch(() => undefined);
  await new Promise<void>((resolve) => context.server.close(() => resolve()));
};

export const createStaffToken = async (
  context: ITestContext,
  role: string = UserRoles.owner,
  tenantId?: string,
): Promise<string> => {
  const owner = tenantId ?? context.tenant.id;
  const rows = await context.admin.query<{ id: string }>(
    `INSERT INTO users (tenant_id, email, name, role, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [owner, `${uniqueKey('staff')}@test.local`, 'Тестовый сотрудник', role, EntityStatus.active],
  );

  return issueToken({
    id: rows.rows[0].id,
    tenant_id: owner,
    phone: null,
    email: null,
    name: null,
    last_name: null,
    role,
    status: EntityStatus.active,
    created_at: new Date().toISOString(),
  });
};

export const setTenantPlan = async (
  context: ITestContext,
  plan: string,
  tenant: ITestTenant = context.tenant,
): Promise<void> => {
  await context.admin.query('UPDATE tenants SET plan = $2 WHERE id = $1', [tenant.id, plan]);
  invalidateTenantCache(tenant.key);
};

export const callApi = async (
  context: ITestContext,
  path: string,
  options: {
    method?: string;
    token?: string;
    tenantKey?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<IJsonResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [TenantHeader]: options.tenantKey ?? context.tenant.key,
    ...(options.headers ?? {}),
  };

  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }

  const method = options.method ?? 'GET';
  const hasBody = options.body !== undefined && method !== 'GET' && method !== 'HEAD';

  const response = await fetch(`${context.baseUrl}${path}`, {
    method,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : {},
  };
};

export interface ITestProduct {
  productId: string;
  variantId: string;
  price: number;
}

export const seedProduct = async (
  context: ITestContext,
  tenantId: string,
  price = 1000,
): Promise<ITestProduct> => {
  const slug = `test-product-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const product = await context.admin.query<{ id: string }>(
    `INSERT INTO products (tenant_id, slug, name, base_price, is_active)
     VALUES ($1, $2, $3, $4, true) RETURNING id`,
    [tenantId, slug, 'Тестовый товар', price],
  );
  const productId = product.rows[0].id;
  const variant = await context.admin.query<{ id: string }>(
    `INSERT INTO product_variants (tenant_id, product_id, sku, options, price, stock, is_active)
     VALUES ($1, $2, $3, '{}'::jsonb, $4, 50, true) RETURNING id`,
    [tenantId, productId, slug.toUpperCase(), price],
  );

  return { productId, variantId: variant.rows[0].id, price };
};

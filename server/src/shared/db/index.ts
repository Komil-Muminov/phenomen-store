import { Pool, PoolClient } from 'pg';
import { Env } from '@/shared/config';

const TENANT_SETTING = 'app.tenant_id';
const SET_TENANT_SQL = 'SELECT set_config($1, $2, true)';

export const pool = new Pool({
  host: Env.db.host,
  port: Env.db.port,
  user: Env.db.appUser,
  password: Env.db.appPassword,
  database: Env.db.database,
  max: Env.db.max,
});

export const createAdminPool = (): Pool => new Pool({
  host: Env.db.host,
  port: Env.db.port,
  user: Env.db.user,
  password: Env.db.password,
  database: Env.db.database,
  max: 2,
});

export const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
  const result = await pool.query(sql, params);

  return result.rows as T[];
};

export const withTenant = async <T>(
  tenantId: string,
  handler: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(SET_TENANT_SQL, [TENANT_SETTING, tenantId]);
    const result = await handler(client);
    await client.query('COMMIT');

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const tenantQuery = async <T>(
  tenantId: string,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> => withTenant(tenantId, async (client) => {
  const result = await client.query(sql, params);

  return result.rows as T[];
});

export const closePool = async (): Promise<void> => {
  await pool.end();
};

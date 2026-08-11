import { IAuditEntry, writeAuditEntry } from '@/shared/audit';
import { query, tenantQuery, withTenant } from '@/shared/db';
import { EntityStatus, UserRoles } from '@/shared/config';
import type { IUserRow } from '@/modules/auth';
import {
  IPlatformUserRow,
  ITenantStaffRow,
  ITenantSummary,
} from '@/modules/platform/types';

interface ITenantRawRow {
  id: string;
  key: string;
  name: string;
  vertical: string;
  plan: string;
  status: string;
  bundle_id: string | null;
  created_at: string;
}

const mapTenant = (row: ITenantRawRow): ITenantSummary => ({
  id: row.id,
  key: row.key,
  name: row.name,
  vertical: row.vertical,
  plan: row.plan,
  status: row.status,
  bundleId: row.bundle_id,
  createdAt: row.created_at,
});

export const selectPlatformUserByLogin = async (login: string): Promise<IPlatformUserRow | null> => {
  const rows = await query<IPlatformUserRow>(
    `SELECT id, login, password_hash, name, role, status
     FROM platform_users WHERE login = $1`,
    [login],
  );

  return rows[0] ?? null;
};

export const insertPlatformUser = async (
  login: string,
  passwordHash: string,
  name: string,
  role: string,
): Promise<IPlatformUserRow> => {
  const rows = await query<IPlatformUserRow>(
    `INSERT INTO platform_users (login, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (login) DO UPDATE SET updated_at = now()
     RETURNING id, login, password_hash, name, role, status`,
    [login, passwordHash, name, role],
  );

  return rows[0];
};

export const selectPlatformUserById = async (id: string): Promise<IPlatformUserRow | null> => {
  const rows = await query<IPlatformUserRow>(
    `SELECT id, login, password_hash, name, role, status
     FROM platform_users WHERE id = $1`,
    [id],
  );

  return rows[0] ?? null;
};

export const updatePlatformPassword = async (id: string, passwordHash: string): Promise<void> => {
  await query(
    'UPDATE platform_users SET password_hash = $2, updated_at = now() WHERE id = $1',
    [id, passwordHash],
  );
};

export const touchPlatformLogin = async (id: string): Promise<void> => {
  await query('UPDATE platform_users SET last_login_at = now() WHERE id = $1', [id]);
};

export const selectTenants = async (limit: number, offset: number): Promise<ITenantSummary[]> => {
  const rows = await query<ITenantRawRow>(
    `SELECT id, key, name, vertical, plan, status, bundle_id, created_at::text AS created_at
     FROM tenants ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return rows.map(mapTenant);
};

export const countTenants = async (): Promise<number> => {
  const rows = await query<{ total: string }>('SELECT count(*)::text AS total FROM tenants');

  return Number(rows[0]?.total ?? 0);
};

export const selectTenantById = async (id: string): Promise<ITenantSummary | null> => {
  const rows = await query<ITenantRawRow>(
    `SELECT id, key, name, vertical, plan, status, bundle_id, created_at::text AS created_at
     FROM tenants WHERE id = $1`,
    [id],
  );

  return rows[0] ? mapTenant(rows[0]) : null;
};

export const existsTenantKey = async (key: string): Promise<boolean> => {
  const rows = await query<{ id: string }>('SELECT id FROM tenants WHERE key = $1', [key]);

  return rows.length > 0;
};

export const insertTenant = async (
  key: string,
  name: string,
  vertical: string,
  plan: string,
  bundleId: string | null,
): Promise<ITenantSummary> => {
  const rows = await query<ITenantRawRow>(
    `INSERT INTO tenants (key, name, vertical, plan, bundle_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, key, name, vertical, plan, status, bundle_id, created_at::text AS created_at`,
    [key, name, vertical, plan, bundleId],
  );

  return mapTenant(rows[0]);
};

export const updateTenantFields = async (
  id: string,
  patch: Record<string, unknown>,
): Promise<void> => {
  const columns: Record<string, string> = {
    name: 'name',
    vertical: 'vertical',
    plan: 'plan',
    bundleId: 'bundle_id',
  };
  const entries = Object.entries(patch).filter(([field]) => columns[field]);

  if (entries.length === 0) {
    return;
  }

  const assignments = entries.map(([field], index) => `${columns[field]} = $${index + 2}`);
  const values = entries.map(([, value]) => value);

  await query(
    `UPDATE tenants SET ${assignments.join(', ')}, updated_at = now() WHERE id = $1`,
    [id, ...values],
  );
};

export const setTenantStatus = async (id: string, status: string): Promise<void> => {
  await query('UPDATE tenants SET status = $2, updated_at = now() WHERE id = $1', [id, status]);
};

export const insertDefaultConfig = async (tenantId: string): Promise<void> => {
  await withTenant(tenantId, async (client) => {
    await client.query(
      `INSERT INTO tenant_configs (tenant_id) VALUES ($1)
       ON CONFLICT (tenant_id) DO NOTHING`,
      [tenantId],
    );
  });
};

export const insertTenantOwner = async (
  tenantId: string,
  passwordHash: string,
  name: string,
  role: string,
  phone: string | null,
  email: string | null,
): Promise<string> => withTenant(tenantId, async (client) => {
  const result = await client.query<{ id: string }>(
    `INSERT INTO users (tenant_id, phone, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [tenantId, phone, email, passwordHash, name, role],
  );

  return result.rows[0].id;
});

export const selectTenantOwnerUser = async (tenantId: string): Promise<IUserRow | null> => {
  const rows = await tenantQuery<IUserRow>(
    tenantId,
    `SELECT id, tenant_id, phone, email, name, role, status, created_at::text AS created_at
     FROM users
     WHERE tenant_id = $1 AND role = ANY($2) AND status = $3
     ORDER BY (role = $4) DESC, created_at
     LIMIT 1`,
    [tenantId, [UserRoles.owner, UserRoles.admin], EntityStatus.active, UserRoles.owner],
  );

  return rows[0] ?? null;
};

const STAFF_COLUMNS = 'id, name, email, phone, role, status, created_at';

export const selectTenantStaff = async (tenantId: string): Promise<ITenantStaffRow[]> => (
  tenantQuery<ITenantStaffRow>(
    tenantId,
    `SELECT ${STAFF_COLUMNS} FROM users
     WHERE tenant_id = $1 AND role <> $2
     ORDER BY created_at`,
    [tenantId, UserRoles.customer],
  )
);

export const selectTenantStaffById = async (
  tenantId: string,
  id: string,
): Promise<ITenantStaffRow | null> => {
  const rows = await tenantQuery<ITenantStaffRow>(
    tenantId,
    `SELECT ${STAFF_COLUMNS} FROM users
     WHERE tenant_id = $1 AND id = $2 AND role <> $3
     LIMIT 1`,
    [tenantId, id, UserRoles.customer],
  );

  return rows[0] ?? null;
};

export const countTenantOwners = async (tenantId: string): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    'SELECT COUNT(*)::text AS total FROM users WHERE tenant_id = $1 AND role = $2',
    [tenantId, UserRoles.owner],
  );

  return Number(rows[0]?.total ?? 0);
};

export const updateTenantStaffFields = async (
  tenantId: string,
  id: string,
  name: string | null,
  email: string | null,
  phone: string | null,
  passwordHash: string | null,
  status: string | null,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    `UPDATE users
     SET name = COALESCE($3, name),
         email = $4,
         phone = $5,
         password_hash = COALESCE($6, password_hash),
         status = COALESCE($7, status),
         updated_at = now()
     WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id, name, email, phone, passwordHash, status],
  );
};

export const deleteTenantStaff = async (tenantId: string, id: string): Promise<void> => {
  await tenantQuery(
    tenantId,
    'DELETE FROM users WHERE tenant_id = $1 AND id = $2',
    [tenantId, id],
  );
};

export const deleteStaffLoginsByUser = async (userId: string): Promise<void> => {
  await query('DELETE FROM staff_logins WHERE user_id = $1', [userId]);
};

export const deleteTenantById = async (id: string): Promise<void> => {
  await query('DELETE FROM tenants WHERE id = $1', [id]);
};

export const insertStaffLogin = async (
  login: string,
  tenantId: string,
  userId: string,
): Promise<void> => {
  await query(
    `INSERT INTO staff_logins (login, tenant_id, user_id)
     VALUES (lower($1), $2, $3)
     ON CONFLICT (login) DO UPDATE SET tenant_id = $2, user_id = $3`,
    [login, tenantId, userId],
  );
};

export const selectStaffLogin = async (
  login: string,
): Promise<{ tenant_id: string; user_id: string } | null> => {
  const rows = await query<{ tenant_id: string; user_id: string }>(
    'SELECT tenant_id, user_id FROM staff_logins WHERE login = lower($1)',
    [login],
  );

  return rows[0] ?? null;
};

export const existsStaffLogin = async (login: string): Promise<boolean> => {
  const rows = await query<{ login: string }>(
    'SELECT login FROM staff_logins WHERE login = lower($1)',
    [login],
  );

  return rows.length > 0;
};

export interface IAuditRow {
  id: string;
  actor_login: string;
  action: string;
  tenant_id: string | null;
  tenant_key: string | null;
  payload: Record<string, unknown>;
  ip: string | null;
  created_at: string;
}

export interface IAuditFilters {
  action: string | null;
  tenantKey: string | null;
  search: string | null;
}

const AUDIT_FROM = `
  FROM platform_audit_log a
  LEFT JOIN tenants t ON t.id = a.tenant_id
  WHERE ($1::text IS NULL OR a.action = $1::text)
    AND ($2::text IS NULL OR t.key = $2::text)
    AND ($3::text IS NULL OR a.actor_login ILIKE '%' || $3::text || '%'
         OR a.payload::text ILIKE '%' || $3::text || '%'
         OR t.key ILIKE '%' || $3::text || '%')
`;

export const selectAuditEntries = async (
  filters: IAuditFilters,
  limit: number,
  offset: number,
): Promise<{ items: IAuditRow[]; total: number }> => {
  const values = [filters.action, filters.tenantKey, filters.search];
  const items = await query<IAuditRow>(
    `SELECT a.id, a.actor_login, a.action, a.tenant_id, t.key AS tenant_key,
            a.payload, a.ip, a.created_at::text AS created_at
     ${AUDIT_FROM}
     ORDER BY a.created_at DESC
     LIMIT $4 OFFSET $5`,
    [...values, limit, offset],
  );
  const counted = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total ${AUDIT_FROM}`,
    values,
  );

  return { items, total: Number(counted[0]?.total ?? 0) };
};

export const selectAuditActions = async (): Promise<string[]> => {
  const rows = await query<{ action: string }>(
    'SELECT DISTINCT action FROM platform_audit_log ORDER BY action',
  );

  return rows.map((row) => row.action);
};

export const insertAuditEntry = async (entry: IAuditEntry): Promise<void> => {
  await writeAuditEntry(entry);
};

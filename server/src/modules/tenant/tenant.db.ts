import { query, tenantQuery } from '@/shared/db';
import { CONFIG_UPDATABLE_FIELDS, ITenantConfigRow, ITenantRow, TenantStatus } from '@/modules/tenant/types';

export const selectTenantByKey = async (key: string): Promise<ITenantRow | null> => {
  const rows = await query<ITenantRow>(
    `SELECT id, key, name, vertical, plan, status, bundle_id
     FROM tenants
     WHERE key = $1 AND status = $2
     LIMIT 1`,
    [key, TenantStatus.active],
  );

  return rows[0] ?? null;
};

export const selectConfigByTenantId = async (tenantId: string): Promise<ITenantConfigRow | null> => {
  const rows = await tenantQuery<ITenantConfigRow>(
    tenantId,
    `SELECT tenant_id, brand, theme, locale, order_rules, payment, delivery, features, contacts
     FROM tenant_configs
     WHERE tenant_id = $1
     LIMIT 1`,
    [tenantId],
  );

  return rows[0] ?? null;
};

export const insertEmptyConfig = async (tenantId: string): Promise<ITenantConfigRow> => {
  const rows = await tenantQuery<ITenantConfigRow>(
    tenantId,
    `INSERT INTO tenant_configs (tenant_id)
     VALUES ($1)
     ON CONFLICT (tenant_id) DO UPDATE SET updated_at = now()
     RETURNING tenant_id, brand, theme, locale, order_rules, payment, delivery, features, contacts`,
    [tenantId],
  );

  return rows[0];
};

export const updateConfigFields = async (
  tenantId: string,
  patch: Record<string, unknown>,
): Promise<ITenantConfigRow> => {
  const entries = CONFIG_UPDATABLE_FIELDS
    .filter((field) => patch[field] !== undefined)
    .map((field, index) => ({ field, placeholder: `$${index + 2}`, value: JSON.stringify(patch[field]) }));

  const assignments = entries
    .map((entry) => `${entry.field} = ${entry.placeholder}::jsonb`)
    .concat('updated_at = now()')
    .join(', ');

  const rows = await tenantQuery<ITenantConfigRow>(
    tenantId,
    `UPDATE tenant_configs
     SET ${assignments}
     WHERE tenant_id = $1
     RETURNING tenant_id, brand, theme, locale, order_rules, payment, delivery, features, contacts`,
    [tenantId, ...entries.map((entry) => entry.value)],
  );

  return rows[0];
};

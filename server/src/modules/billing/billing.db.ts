import { query } from '@/shared/db';
import { IBlockedTenantRow } from '@/modules/billing/types';

const OVERDUE_STATUSES = ['pending', 'failed'];

export const selectBillingSettings = async (): Promise<{
  grace_days: number;
  auto_block: boolean;
} | null> => {
  const rows = await query<{ grace_days: number; auto_block: boolean }>(
    'SELECT grace_days, auto_block FROM platform_settings WHERE id = true LIMIT 1',
  );

  return rows[0] ?? null;
};

export const upsertBillingSettings = async (
  graceDays: number,
  autoBlock: boolean,
): Promise<void> => {
  await query(
    `INSERT INTO platform_settings (id, grace_days, auto_block) VALUES (true, $1, $2)
     ON CONFLICT (id) DO UPDATE
       SET grace_days = EXCLUDED.grace_days,
           auto_block = EXCLUDED.auto_block,
           updated_at = now()`,
    [graceDays, autoBlock],
  );
};

export const selectOverdueTenantIds = async (graceDays: number): Promise<string[]> => {
  const rows = await query<{ tenant_id: string }>(
    `SELECT DISTINCT tenant_id FROM platform_invoices
     WHERE status = ANY($1::text[])
       AND due_date IS NOT NULL
       AND due_date + ($2::int * INTERVAL '1 day') < now()`,
    [OVERDUE_STATUSES, graceDays],
  );

  return rows.map((row) => row.tenant_id);
};

export const selectBlockedTenantIds = async (): Promise<string[]> => {
  const rows = await query<{ id: string }>(
    'SELECT id FROM tenants WHERE blocked_at IS NOT NULL',
  );

  return rows.map((row) => row.id);
};

export const selectTenantKeys = async (ids: string[]): Promise<string[]> => {
  if (ids.length === 0) {
    return [];
  }

  const rows = await query<{ key: string }>(
    'SELECT key FROM tenants WHERE id = ANY($1::uuid[])',
    [ids],
  );

  return rows.map((row) => row.key);
};

export const applyBlock = async (ids: string[], reason: string): Promise<void> => {
  if (ids.length === 0) {
    return;
  }

  await query(
    `UPDATE tenants SET blocked_at = now(), block_reason = $2, updated_at = now()
     WHERE id = ANY($1::uuid[]) AND blocked_at IS NULL`,
    [ids, reason],
  );
};

export const releaseBlock = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) {
    return;
  }

  await query(
    `UPDATE tenants SET blocked_at = NULL, block_reason = NULL, updated_at = now()
     WHERE id = ANY($1::uuid[])`,
    [ids],
  );
};

export const selectBlockedTenants = async (): Promise<IBlockedTenantRow[]> => query<IBlockedTenantRow>(
  `SELECT t.id, t.key, t.name,
          t.blocked_at::text AS blocked_at,
          t.block_reason,
          COUNT(i.id)::text AS overdue_count,
          COALESCE(SUM(i.amount), 0)::text AS overdue_amount
   FROM tenants t
   LEFT JOIN platform_invoices i
     ON i.tenant_id = t.id AND i.status = ANY($1::text[])
   WHERE t.blocked_at IS NOT NULL
   GROUP BY t.id, t.key, t.name, t.blocked_at, t.block_reason
   ORDER BY t.blocked_at DESC`,
  [OVERDUE_STATUSES],
);

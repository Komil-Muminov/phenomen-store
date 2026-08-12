import { tenantQuery } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import { IPromotionFilters, IPromotionInput, IPromotionRow } from '@/modules/promotion/types';

const COLUMNS = `id, code, name, kind, conditions, actions, priority, usage_limit, usage_count,
  starts_at::text AS starts_at, ends_at::text AS ends_at, is_active`;

const FILTER = `
  WHERE tenant_id = $1
    AND ($2::text IS NULL OR name ILIKE $2 OR code ILIKE $2)
    AND ($3::boolean IS NULL OR is_active = $3)
`;

const toValues = (input: IPromotionInput) => [
  input.code,
  input.name,
  input.kind,
  JSON.stringify({ minTotal: input.minTotal }),
  JSON.stringify({ percent: input.percent, amount: input.amount }),
  input.priority,
  input.usageLimit,
  input.startsAt,
  input.endsAt,
  input.isActive,
];

export const selectPromotionPage = async (
  tenantId: string,
  filters: IPromotionFilters,
  limit: number,
  offset: number,
): Promise<{ items: IPromotionRow[]; total: number }> => {
  const rows = await tenantQuery<TCounted<IPromotionRow>>(
    tenantId,
    `SELECT ${COLUMNS}, COUNT(*) OVER()::text AS total_count
     FROM promotions ${FILTER}
     ORDER BY is_active DESC, priority DESC, name
     LIMIT $4 OFFSET $5`,
    [tenantId, filters.search, filters.isActive, limit, offset],
  );

  return splitTotal(rows);
};

export const selectPromotionById = async (
  tenantId: string,
  id: string,
): Promise<IPromotionRow | null> => {
  const rows = await tenantQuery<IPromotionRow>(
    tenantId,
    `SELECT ${COLUMNS} FROM promotions WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] ?? null;
};

export const existsPromotionCode = async (
  tenantId: string,
  code: string,
  excludeId: string | null,
): Promise<boolean> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `SELECT id FROM promotions
     WHERE tenant_id = $1 AND upper(code) = upper($2) AND ($3::uuid IS NULL OR id <> $3)
     LIMIT 1`,
    [tenantId, code, excludeId],
  );

  return rows.length > 0;
};

export const insertPromotion = async (
  tenantId: string,
  input: IPromotionInput,
): Promise<IPromotionRow> => {
  const rows = await tenantQuery<IPromotionRow>(
    tenantId,
    `INSERT INTO promotions
       (tenant_id, code, name, kind, conditions, actions, priority, usage_limit,
        starts_at, ends_at, is_active)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11)
     RETURNING ${COLUMNS}`,
    [tenantId, ...toValues(input)],
  );

  return rows[0];
};

export const updatePromotionFields = async (
  tenantId: string,
  id: string,
  input: IPromotionInput,
): Promise<IPromotionRow> => {
  const rows = await tenantQuery<IPromotionRow>(
    tenantId,
    `UPDATE promotions
     SET code = $3, name = $4, kind = $5, conditions = $6::jsonb, actions = $7::jsonb,
         priority = $8, usage_limit = $9, starts_at = $10, ends_at = $11, is_active = $12
     WHERE tenant_id = $1 AND id = $2
     RETURNING ${COLUMNS}`,
    [tenantId, id, ...toValues(input)],
  );

  return rows[0];
};

export const deletePromotionById = async (tenantId: string, id: string): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'DELETE FROM promotions WHERE tenant_id = $1 AND id = $2 RETURNING id',
    [tenantId, id],
  );

  return rows.length;
};

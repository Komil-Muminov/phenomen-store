import { tenantQuery, withTenant } from '@/shared/db';
import { IAttributePreset, IAttributeRow } from '@/modules/attributes/types';

const COLUMNS = 'id, code, name, value_type, is_variant_option, is_filterable, position, values';

export const selectAttributes = async (tenantId: string): Promise<IAttributeRow[]> => tenantQuery<IAttributeRow>(
  tenantId,
  `SELECT ${COLUMNS} FROM attributes WHERE tenant_id = $1 ORDER BY position, name`,
  [tenantId],
);

export const selectAttributeById = async (
  tenantId: string,
  id: string,
): Promise<IAttributeRow | null> => {
  const rows = await tenantQuery<IAttributeRow>(
    tenantId,
    `SELECT ${COLUMNS} FROM attributes WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] ?? null;
};

export const existsAttributeCode = async (tenantId: string, code: string): Promise<boolean> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'SELECT id FROM attributes WHERE tenant_id = $1 AND code = $2 LIMIT 1',
    [tenantId, code],
  );

  return rows.length > 0;
};

export const insertAttribute = async (
  tenantId: string,
  code: string,
  name: string,
  valueType: string,
  isVariantOption: boolean,
  isFilterable: boolean,
  position: number,
  values: string[],
): Promise<IAttributeRow> => {
  const rows = await tenantQuery<IAttributeRow>(
    tenantId,
    `INSERT INTO attributes
       (tenant_id, code, name, value_type, is_variant_option, is_filterable, position, values)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     RETURNING ${COLUMNS}`,
    [tenantId, code, name, valueType, isVariantOption, isFilterable, position, JSON.stringify(values)],
  );

  return rows[0];
};

export const updateAttributeFields = async (
  tenantId: string,
  id: string,
  name: string | null,
  position: number | null,
  values: string[] | null,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    `UPDATE attributes
     SET name = COALESCE($3, name),
         position = COALESCE($4, position),
         values = COALESCE($5::jsonb, values)
     WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id, name, position, values ? JSON.stringify(values) : null],
  );
};

export const appendAttributeValue = async (
  tenantId: string,
  code: string,
  value: string,
): Promise<void> => {
  await tenantQuery(
    tenantId,
    `UPDATE attributes
     SET values = values || to_jsonb($3::text)
     WHERE tenant_id = $1 AND code = $2
       AND NOT (values @> to_jsonb($3::text))`,
    [tenantId, code, value],
  );
};

export const countAttributeUsage = async (
  tenantId: string,
  code: string,
  isVariantOption: boolean,
): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    isVariantOption
      ? `SELECT COUNT(*)::text AS total FROM product_variants
         WHERE tenant_id = $1 AND options ? $2`
      : `SELECT COUNT(*)::text AS total FROM products
         WHERE tenant_id = $1 AND attributes ? $2`,
    [tenantId, code],
  );

  return Number(rows[0]?.total ?? 0);
};

export const deleteAttributeById = async (tenantId: string, id: string): Promise<void> => {
  await tenantQuery(
    tenantId,
    'DELETE FROM attributes WHERE tenant_id = $1 AND id = $2',
    [tenantId, id],
  );
};

export const seedAttributePreset = async (
  tenantId: string,
  preset: IAttributePreset[],
): Promise<number> => withTenant(tenantId, async (client) => {
  let created = 0;

  for (const item of preset) {
    const result = await client.query(
      `INSERT INTO attributes
         (tenant_id, code, name, value_type, is_variant_option, is_filterable, position, values)
       VALUES ($1, $2, $3, 'string', $4, true, $5, $6::jsonb)
       ON CONFLICT (tenant_id, code) DO NOTHING`,
      [tenantId, item.code, item.name, item.isVariantOption, item.position, JSON.stringify(item.values)],
    );

    created += result.rowCount ?? 0;
  }

  return created;
});

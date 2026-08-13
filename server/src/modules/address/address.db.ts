import { tenantQuery, withTenant } from '@/shared/db';
import { IAddressInput, IAddressRow } from '@/modules/address/types';

const COLUMNS = `
  id, title, city, street, house, apartment, postal_code,
  comment, is_default, created_at::text AS created_at
`;

export const selectAddresses = async (
  tenantId: string,
  userId: string,
): Promise<IAddressRow[]> => tenantQuery<IAddressRow>(
  tenantId,
  `SELECT ${COLUMNS} FROM addresses
   WHERE tenant_id = $1 AND user_id = $2
   ORDER BY is_default DESC, created_at DESC`,
  [tenantId, userId],
);

export const selectAddressById = async (
  tenantId: string,
  userId: string,
  id: string,
): Promise<IAddressRow | null> => {
  const rows = await tenantQuery<IAddressRow>(
    tenantId,
    `SELECT ${COLUMNS} FROM addresses
     WHERE tenant_id = $1 AND user_id = $2 AND id = $3 LIMIT 1`,
    [tenantId, userId, id],
  );

  return rows[0] ?? null;
};

export const countAddresses = async (tenantId: string, userId: string): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    'SELECT COUNT(*)::text AS total FROM addresses WHERE tenant_id = $1 AND user_id = $2',
    [tenantId, userId],
  );

  return Number(rows[0]?.total ?? 0);
};

export const insertAddress = async (
  tenantId: string,
  userId: string,
  input: IAddressInput,
): Promise<IAddressRow> => withTenant(tenantId, async (client) => {
  if (input.isDefault) {
    await client.query(
      'UPDATE addresses SET is_default = false WHERE tenant_id = $1 AND user_id = $2',
      [tenantId, userId],
    );
  }

  const result = await client.query<IAddressRow>(
    `INSERT INTO addresses
       (tenant_id, user_id, title, city, street, house, apartment, postal_code, comment, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${COLUMNS}`,
    [
      tenantId,
      userId,
      input.title,
      input.city,
      input.street,
      input.house,
      input.apartment,
      input.postalCode,
      input.comment,
      input.isDefault,
    ],
  );

  return result.rows[0];
});

export const updateAddressRow = async (
  tenantId: string,
  userId: string,
  id: string,
  input: IAddressInput,
): Promise<IAddressRow | null> => withTenant(tenantId, async (client) => {
  if (input.isDefault) {
    await client.query(
      'UPDATE addresses SET is_default = false WHERE tenant_id = $1 AND user_id = $2',
      [tenantId, userId],
    );
  }

  const result = await client.query<IAddressRow>(
    `UPDATE addresses SET
       title = $4, city = $5, street = $6, house = $7, apartment = $8,
       postal_code = $9, comment = $10, is_default = $11
     WHERE tenant_id = $1 AND user_id = $2 AND id = $3
     RETURNING ${COLUMNS}`,
    [
      tenantId,
      userId,
      id,
      input.title,
      input.city,
      input.street,
      input.house,
      input.apartment,
      input.postalCode,
      input.comment,
      input.isDefault,
    ],
  );

  return result.rows[0] ?? null;
});

export const deleteAddressRow = async (
  tenantId: string,
  userId: string,
  id: string,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'DELETE FROM addresses WHERE tenant_id = $1 AND user_id = $2 AND id = $3 RETURNING id',
    [tenantId, userId, id],
  );

  return rows.length;
};

export const setDefaultAddress = async (
  tenantId: string,
  userId: string,
  id: string,
): Promise<number> => withTenant(tenantId, async (client) => {
  await client.query(
    'UPDATE addresses SET is_default = false WHERE tenant_id = $1 AND user_id = $2',
    [tenantId, userId],
  );

  const result = await client.query(
    'UPDATE addresses SET is_default = true WHERE tenant_id = $1 AND user_id = $2 AND id = $3',
    [tenantId, userId, id],
  );

  return result.rowCount ?? 0;
});

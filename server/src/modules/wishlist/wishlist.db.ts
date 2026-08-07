import { PoolClient } from 'pg';
import { tenantQuery, withTenant } from '@/shared/db';

const SELECT_IDS_SQL = `SELECT product_id FROM favorites
  WHERE tenant_id = $1 AND user_id = $2
  ORDER BY created_at DESC`;

export const selectWishlistIds = async (
  tenantId: string,
  userId: string,
): Promise<string[]> => {
  const rows = await tenantQuery<{ product_id: string }>(
    tenantId,
    SELECT_IDS_SQL,
    [tenantId, userId],
  );

  return rows.map((row) => row.product_id);
};

export const toggleFavorite = async (
  tenantId: string,
  userId: string,
  productId: string,
): Promise<{ wishlisted: boolean; ids: string[] }> => withTenant(
  tenantId,
  async (client: PoolClient) => {
    const existing = await client.query(
      'SELECT 1 FROM favorites WHERE tenant_id = $1 AND user_id = $2 AND product_id = $3',
      [tenantId, userId, productId],
    );
    const wishlisted = existing.rowCount === 0;

    await client.query(
      wishlisted
        ? 'INSERT INTO favorites (tenant_id, user_id, product_id) VALUES ($1, $2, $3)'
        : 'DELETE FROM favorites WHERE tenant_id = $1 AND user_id = $2 AND product_id = $3',
      [tenantId, userId, productId],
    );

    const rows = await client.query<{ product_id: string }>(SELECT_IDS_SQL, [tenantId, userId]);

    return { wishlisted, ids: rows.rows.map((row) => row.product_id) };
  },
);

import { pool } from '@/shared/db';

export interface IWishlistItem {
  productId: string;
}

export const getWishlistProductIds = async (tenantId: string, userId: string): Promise<string[]> => {
  const result = await pool.query<{ product_id: string }>(
    `SELECT product_id FROM favorites WHERE tenant_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
    [tenantId, userId],
  );

  return result.rows.map((row) => row.product_id);
};

export const toggleWishlistItem = async (tenantId: string, userId: string, productId: string): Promise<{ wishlisted: boolean; ids: string[] }> => {
  const existing = await pool.query(
    `SELECT 1 FROM favorites WHERE tenant_id = $1 AND user_id = $2 AND product_id = $3`,
    [tenantId, userId, productId],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    await pool.query(
      `DELETE FROM favorites WHERE tenant_id = $1 AND user_id = $2 AND product_id = $3`,
      [tenantId, userId, productId],
    );
  } else {
    await pool.query(
      `INSERT INTO favorites (tenant_id, user_id, product_id) VALUES ($1, $2, $3)`,
      [tenantId, userId, productId],
    );
  }

  const updatedIds = await getWishlistProductIds(tenantId, userId);
  return {
    wishlisted: !existing.rowCount,
    ids: updatedIds,
  };
};

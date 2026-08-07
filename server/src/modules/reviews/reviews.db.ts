import { tenantQuery } from '@/shared/db';

export interface IReviewRow {
  id: string;
  product_id: string;
  rating: number;
  text: string | null;
  created_at: string;
  author_name: string;
}

export const selectProductReviews = async (
  tenantId: string,
  productId: string,
): Promise<IReviewRow[]> => tenantQuery<IReviewRow>(
  tenantId,
  `SELECT r.id, r.product_id, r.rating, r.text, r.created_at::text AS created_at,
          COALESCE(u.name, 'Покупатель') AS author_name
   FROM reviews r
   LEFT JOIN users u ON u.id = r.user_id AND u.tenant_id = r.tenant_id
   WHERE r.tenant_id = $1 AND r.product_id = $2 AND r.status = 'published'
   ORDER BY r.created_at DESC`,
  [tenantId, productId],
);

export const insertProductReview = async (
  tenantId: string,
  userId: string,
  productId: string,
  rating: number,
  text: string,
): Promise<IReviewRow> => {
  const rows = await tenantQuery<IReviewRow>(
    tenantId,
    `INSERT INTO reviews (tenant_id, product_id, user_id, rating, text, status)
     VALUES ($1, $2, $3, $4, $5, 'published')
     RETURNING id, product_id, rating, text, created_at::text AS created_at,
               '' AS author_name`,
    [tenantId, productId, userId, rating, text],
  );

  return rows[0];
};

import { pool } from '@/shared/db';

export interface IReviewItem {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface IProductReviewsSummary {
  averageRating: number;
  totalCount: number;
  reviews: IReviewItem[];
}

export const getProductReviews = async (tenantId: string, productId: string): Promise<IProductReviewsSummary> => {
  const result = await pool.query<{
    id: string;
    product_id: string;
    rating: number;
    text: string;
    created_at: string;
    author_name: string;
  }>(
    `SELECT r.id, r.product_id, r.rating, r.text, r.created_at, COALESCE(u.name, 'Покупатель') as author_name
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.tenant_id = $1 AND r.product_id = $2 AND r.status = 'published'
     ORDER BY r.created_at DESC`,
    [tenantId, productId],
  );

  const reviews = result.rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    authorName: row.author_name,
    rating: Number(row.rating),
    text: row.text ?? '',
    createdAt: row.created_at,
  }));

  const totalCount = reviews.length;
  const averageRating = totalCount > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1))
    : 5.0;

  return {
    averageRating,
    totalCount,
    reviews,
  };
};

export const addProductReview = async (
  tenantId: string,
  userId: string,
  productId: string,
  rating: number,
  text: string,
): Promise<IReviewItem> => {
  const inserted = await pool.query<{
    id: string;
    product_id: string;
    rating: number;
    text: string;
    created_at: string;
  }>(
    `INSERT INTO reviews (tenant_id, product_id, user_id, rating, text, status)
     VALUES ($1, $2, $3, $4, $5, 'published')
     RETURNING id, product_id, rating, text, created_at`,
    [tenantId, productId, userId, rating, text],
  );

  const row = inserted.rows[0];
  return {
    id: row.id,
    productId: row.product_id,
    authorName: 'Вы',
    rating: Number(row.rating),
    text: row.text ?? '',
    createdAt: row.created_at,
  };
};

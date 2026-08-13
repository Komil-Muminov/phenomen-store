import { tenantQuery } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import {
  IManagedReviewRow,
  IReviewFilters,
  IReviewRow,
  ReviewStatus,
} from '@/modules/reviews/types';

const REVIEW_COLUMNS = `
  r.id, r.product_id, r.rating, r.text,
  r.reply_text, r.reply_author, r.reply_at::text AS reply_at,
  r.created_at::text AS created_at,
  COALESCE(u.name, 'Покупатель') AS author_name
`;

const REVIEW_FROM = `
  FROM reviews r
  LEFT JOIN users u ON u.id = r.user_id AND u.tenant_id = r.tenant_id
`;

export const selectProductReviews = async (
  tenantId: string,
  productId: string,
): Promise<IReviewRow[]> => tenantQuery<IReviewRow>(
  tenantId,
  `SELECT ${REVIEW_COLUMNS} ${REVIEW_FROM}
   WHERE r.tenant_id = $1 AND r.product_id = $2 AND r.status = $3
   ORDER BY r.created_at DESC`,
  [tenantId, productId, ReviewStatus.published],
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
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, product_id, rating, text, reply_text, reply_author,
               reply_at::text AS reply_at, created_at::text AS created_at,
               '' AS author_name`,
    [tenantId, productId, userId, rating, text, ReviewStatus.published],
  );

  return rows[0];
};

export const selectManagedReviews = async (
  tenantId: string,
  filters: IReviewFilters,
  limit: number,
  offset: number,
): Promise<{ items: IManagedReviewRow[]; total: number }> => {
  const rows = await tenantQuery<TCounted<IManagedReviewRow>>(
    tenantId,
    `SELECT ${REVIEW_COLUMNS},
            p.name AS product_name, p.slug AS product_slug, u.email AS author_email,
            COUNT(*) OVER()::text AS total_count
     ${REVIEW_FROM}
     JOIN products p ON p.id = r.product_id AND p.tenant_id = r.tenant_id
     WHERE r.tenant_id = $1
       AND ($2::text IS NULL OR p.name ILIKE $2 OR r.text ILIKE $2 OR u.name ILIKE $2)
       AND ($3::int IS NULL OR r.rating = $3)
       AND ($4::boolean IS NULL OR (r.reply_text IS NOT NULL) = $4)
     ORDER BY r.created_at DESC
     LIMIT $5 OFFSET $6`,
    [tenantId, filters.search, filters.rating, filters.answered, limit, offset],
  );

  return splitTotal(rows);
};

export const selectManagedReviewById = async (
  tenantId: string,
  id: string,
): Promise<IManagedReviewRow | null> => {
  const rows = await tenantQuery<IManagedReviewRow>(
    tenantId,
    `SELECT ${REVIEW_COLUMNS}, p.name AS product_name, p.slug AS product_slug, u.email AS author_email
     ${REVIEW_FROM}
     JOIN products p ON p.id = r.product_id AND p.tenant_id = r.tenant_id
     WHERE r.tenant_id = $1 AND r.id = $2 LIMIT 1`,
    [tenantId, id],
  );

  return rows[0] ?? null;
};

export const updateReviewReply = async (
  tenantId: string,
  id: string,
  reply: string | null,
  author: string | null,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `UPDATE reviews
     SET reply_text = $3, reply_author = $4, reply_at = CASE WHEN $3::text IS NULL THEN NULL ELSE now() END
     WHERE tenant_id = $1 AND id = $2
     RETURNING id`,
    [tenantId, id, reply, author],
  );

  return rows.length;
};

export const selectReviewOwner = async (
  tenantId: string,
  id: string,
): Promise<string | null> => {
  const rows = await tenantQuery<{ user_id: string | null }>(
    tenantId,
    'SELECT user_id FROM reviews WHERE tenant_id = $1 AND id = $2 LIMIT 1',
    [tenantId, id],
  );

  return rows[0]?.user_id ?? null;
};

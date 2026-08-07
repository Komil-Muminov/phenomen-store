import { IReviewRow, insertProductReview, selectProductReviews } from '@/modules/reviews/reviews.db';

const DEFAULT_RATING = 5;

const SELF_AUTHOR_NAME = 'Вы';

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

const mapReview = (row: IReviewRow, authorName?: string): IReviewItem => ({
  id: row.id,
  productId: row.product_id,
  authorName: authorName ?? row.author_name,
  rating: Number(row.rating),
  text: row.text ?? '',
  createdAt: row.created_at,
});

export const getProductReviews = async (
  tenantId: string,
  productId: string,
): Promise<IProductReviewsSummary> => {
  const reviews = (await selectProductReviews(tenantId, productId)).map((row) => mapReview(row));
  const totalCount = reviews.length;
  const averageRating = totalCount > 0
    ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / totalCount).toFixed(1))
    : DEFAULT_RATING;

  return { averageRating, totalCount, reviews };
};

export const addProductReview = async (
  tenantId: string,
  userId: string,
  productId: string,
  rating: number,
  text: string,
): Promise<IReviewItem> => mapReview(
  await insertProductReview(tenantId, userId, productId, rating, text),
  SELF_AUTHOR_NAME,
);

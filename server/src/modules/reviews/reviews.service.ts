import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import { notifyReviewReply } from '@/modules/notifications';
import {
  insertProductReview,
  selectManagedReviewById,
  selectManagedReviews,
  selectProductReviews,
  selectReviewOwner,
  updateReviewReply,
} from '@/modules/reviews/reviews.db';
import {
  IManagedReviewRow,
  IReviewFilters,
  IReviewRow,
  ReviewErrors,
  ReviewFilterValues,
  ReviewLimits,
} from '@/modules/reviews/types';

const DEFAULT_RATING = 5;

const SELF_AUTHOR_NAME = 'Вы';

export interface IReviewItem {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  text: string;
  reply: string | null;
  replyAuthor: string | null;
  replyAt: string | null;
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
  reply: row.reply_text,
  replyAuthor: row.reply_author,
  replyAt: row.reply_at,
  createdAt: row.created_at,
});

const mapManaged = (row: IManagedReviewRow) => ({
  ...mapReview(row),
  productName: row.product_name,
  productSlug: row.product_slug,
  authorEmail: row.author_email,
});

export const pickRatingFilter = (value: unknown): number | null => {
  const rating = Number(pickString(value));

  return Number.isInteger(rating)
    && rating >= ReviewLimits.ratingMin
    && rating <= ReviewLimits.ratingMax
    ? rating
    : null;
};

export const pickAnsweredFilter = (value: unknown): boolean | null => {
  const flag = pickString(value);

  if (flag === ReviewFilterValues.answered) {
    return true;
  }

  return flag === ReviewFilterValues.pending ? false : null;
};

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

export const listManagedReviews = async (
  tenant: ITenantContext,
  filters: IReviewFilters,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectManagedReviews(tenant.id, filters, limit, offset);

  return { items: items.map(mapManaged), total, page, limit };
};

export const replyToReview = async (
  tenant: ITenantContext,
  id: string,
  authorName: string | null,
  payload: Record<string, unknown>,
) => {
  const review = await selectManagedReviewById(tenant.id, id);

  if (!review) {
    throw new AppError(ReviewErrors.notFound, HttpStatus.notFound);
  }

  const text = pickString(payload.text).slice(0, ReviewLimits.replyMax);

  if (!text) {
    throw new AppError(ReviewErrors.replyRequired, HttpStatus.badRequest);
  }

  await updateReviewReply(tenant.id, id, text, authorName);
  await notifyReviewReply(tenant, await selectReviewOwner(tenant.id, id), review.product_name);

  const updated = await selectManagedReviewById(tenant.id, id);

  return mapManaged(updated ?? review);
};

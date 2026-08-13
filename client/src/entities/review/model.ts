export interface IReview {
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

export interface IReviewsSummary {
  averageRating: number;
  totalCount: number;
  reviews: IReview[];
}

export const MAX_RATING = 5;

export const formatStars = (rating: number): string => (
  '★'.repeat(Math.max(0, Math.min(MAX_RATING, Math.round(rating))))
);

export const formatReviewDate = (value: string): string => (
  new Date(value).toLocaleDateString('ru-RU')
);

export const formatReviewsCount = (total: number): string => {
  const last = total % 10;
  const tens = total % 100;

  if (tens >= 11 && tens <= 14) {
    return `${total} отзывов`;
  }

  if (last === 1) {
    return `${total} отзыв`;
  }

  return last >= 2 && last <= 4 ? `${total} отзыва` : `${total} отзывов`;
};

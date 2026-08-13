export const ReviewPaths = {
  get: '/get',
  add: '/add',
  manageSearch: '/manage/search',
  reply: '/reply/:id',
} as const;

export const ReviewStatus = {
  published: 'published',
  hidden: 'hidden',
} as const;

export const ReviewLimits = {
  ratingMin: 1,
  ratingMax: 5,
  textMax: 2000,
  replyMax: 2000,
} as const;

export const ReviewErrors = {
  notFound: 'Отзыв не найден',
  replyRequired: 'Напишите ответ покупателю',
} as const;

export const ReviewFilterValues = {
  answered: 'answered',
  pending: 'pending',
} as const;

export interface IReviewRow {
  id: string;
  product_id: string;
  rating: number;
  text: string | null;
  reply_text: string | null;
  reply_author: string | null;
  reply_at: string | null;
  created_at: string;
  author_name: string;
}

export interface IManagedReviewRow extends IReviewRow {
  product_name: string;
  product_slug: string;
  author_email: string | null;
}

export interface IReviewFilters {
  search: string | null;
  rating: number | null;
  answered: boolean | null;
}

export interface IReview {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  authorName: string;
  authorEmail: string | null;
  rating: number;
  text: string;
  reply: string | null;
  replyAuthor: string | null;
  replyAt: string | null;
  createdAt: string;
}

export interface IReviewList {
  items: IReview[];
  total: number;
  page: number;
  limit: number;
}

export const RatingOptions = [
  { value: 'all', label: 'Любая оценка' },
  { value: '5', label: '5 звёзд' },
  { value: '4', label: '4 звезды' },
  { value: '3', label: '3 звезды' },
  { value: '2', label: '2 звезды' },
  { value: '1', label: '1 звезда' },
];

export const AnsweredOptions = [
  { value: 'all', label: 'Все отзывы' },
  { value: 'pending', label: 'Без ответа' },
  { value: 'answered', label: 'С ответом' },
];

export const parseReviewFilter = (value: string): string | undefined => (
  value === 'all' ? undefined : value
);

export const formatReviewFilter = (value?: string): string => value ?? 'all';

export const formatReviewMoment = (value: string): string => (
  new Date(value).toLocaleString('ru-RU')
);

export const ratingColor = (rating: number): string => {
  if (rating >= 4) {
    return 'green';
  }

  return rating === 3 ? 'gold' : 'red';
};

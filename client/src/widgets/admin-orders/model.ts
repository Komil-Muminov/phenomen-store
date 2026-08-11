import { IOrder } from '@/entities/order';

export interface IOrderList {
  items: IOrder[];
  total: number;
  page: number;
  limit: number;
}

export const OrdersTexts = {
  title: 'Заказы',
  empty: 'Заказов пока нет',
  emptyFiltered: 'По фильтру ничего не найдено',
  allStatuses: 'Все',
  statusSaved: 'Статус обновлён',
  loadMore: 'Показать ещё',
} as const;

export const formatMoney = (value: number, currency: string): string => (
  `${new Intl.NumberFormat('ru-RU').format(value)} ${currency === 'TJS' ? 'смн' : currency}`
);

export const formatDate = (value: string): string => {
  if (!value) return '—';

  const isoStr = typeof value === 'string' ? value.replace(' ', 'T') : String(value);
  const date = new Date(isoStr);

  if (isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${day}.${month}.${year}`;
};

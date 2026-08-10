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

export const formatDate = (value: string): string => (
  new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
);

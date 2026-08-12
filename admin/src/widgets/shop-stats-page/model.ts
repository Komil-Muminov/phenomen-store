export interface IStatsTotals {
  orders: number;
  revenue: number;
  average: number;
  customers: number;
  cancelled: number;
}

export interface IStatsOverview {
  period: string;
  days: number;
  totals: IStatsTotals;
  statuses: { status: string; total: number }[];
  trend: { day: string; orders: number; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStock: { name: string; sku: string; stock: number }[];
  catalog: { products: number; activeProducts: number; categories: number; outOfStock: number };
}

export const StatsPeriodOptions = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
] as const;

export const StatsTexts = {
  title: 'Сводка',
  subtitle: 'Что происходит в магазине',
  orders: 'Заказов',
  revenue: 'Выручка',
  average: 'Средний чек',
  customers: 'Покупателей',
  cancelled: 'Отменено',
  byStatus: 'Заказы по статусам',
  byDay: 'Выручка по дням',
  top: 'Лучше всего продаётся',
  lowStock: 'Заканчивается на складе',
  catalog: 'Каталог',
  products: 'Товаров всего',
  activeProducts: 'В продаже',
  categories: 'Категорий',
  outOfStock: 'Позиций без остатка',
  empty: 'За этот период заказов не было',
  emptyStock: 'Всех товаров хватает',
  quantity: 'шт',
} as const;

export const formatMoney = (value: number): string => (
  `${new Intl.NumberFormat('ru-RU').format(Math.round(value))} смн`
);

export const formatDay = (value: string): string => {
  const [, month, day] = value.split('-');

  return `${day}.${month}`;
};

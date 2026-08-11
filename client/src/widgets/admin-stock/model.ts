import type { IStockItem, TStockList } from '@contracts';

export type { IStockItem };

export type IStockList = TStockList;

export const StockTexts = {
  title: 'Остатки',
  searchPlaceholder: 'Товар или SKU',
  all: 'Все позиции',
  onlyEmpty: 'Закончились',
  empty: 'Позиций пока нет',
  emptyFiltered: 'Ничего не найдено',
  loadMore: 'Показать ещё',
  outOfStock: 'нет в наличии',
  saved: 'Остаток обновлён',
} as const;

export const STOCK_STEP = 1;

export const clampStock = (value: number): number => (
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
);

export const formatOptions = (options: Record<string, string>): string => (
  Object.values(options ?? {}).join(' · ')
);

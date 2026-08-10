export interface IStockItem {
  id: string;
  sku: string;
  options: Record<string, string>;
  stock: number;
  price: number;
  productId: string;
  productName: string;
  isActive: boolean;
}

export interface IStockList {
  items: IStockItem[];
  total: number;
  page: number;
  limit: number;
}

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

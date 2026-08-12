export const StatsPaths = {
  overview: '/overview',
} as const;

export const StatsPeriods = {
  week: 'week',
  month: 'month',
  quarter: 'quarter',
} as const;

export type TStatsPeriod = (typeof StatsPeriods)[keyof typeof StatsPeriods];

export const PeriodDays: Record<TStatsPeriod, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

export const TopProductsLimit = 5;

export const LowStockLimit = 5;

export const LowStockThreshold = 5;

export interface ITotalsRow {
  orders: string;
  revenue: string;
  average: string;
  customers: string;
  cancelled: string;
}

export interface IStatusRow {
  status: string;
  total: string;
}

export interface ITrendRow {
  day: string;
  orders: string;
  revenue: string;
}

export interface ITopProductRow {
  product_name: string;
  quantity: string;
  revenue: string;
}

export interface ILowStockRow {
  product_name: string;
  sku: string;
  stock: string;
}

export interface ICatalogRow {
  products: string;
  active_products: string;
  categories: string;
  out_of_stock: string;
}

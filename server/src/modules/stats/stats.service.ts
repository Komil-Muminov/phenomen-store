import { ITenantContext } from '@/shared/types';
import { pickString } from '@/shared/utils';
import {
  selectCatalogCounts,
  selectLowStock,
  selectStatusBreakdown,
  selectTopProducts,
  selectTotals,
  selectTrend,
} from '@/modules/stats/stats.db';
import { PeriodDays, StatsPeriods, TStatsPeriod } from '@/modules/stats/types';

const PERIODS: string[] = Object.values(StatsPeriods);

const toNumber = (value: string | null | undefined): number => {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};

export const pickPeriod = (value: unknown): TStatsPeriod => {
  const period = pickString(value);

  return PERIODS.includes(period) ? (period as TStatsPeriod) : StatsPeriods.month;
};

export const getOverview = async (tenant: ITenantContext, period: TStatsPeriod) => {
  const days = PeriodDays[period];
  const [totals, statuses, trend, top, lowStock, catalog] = await Promise.all([
    selectTotals(tenant.id, days),
    selectStatusBreakdown(tenant.id, days),
    selectTrend(tenant.id, days),
    selectTopProducts(tenant.id, days),
    selectLowStock(tenant.id),
    selectCatalogCounts(tenant.id),
  ]);

  return {
    period,
    days,
    totals: {
      orders: toNumber(totals?.orders),
      revenue: toNumber(totals?.revenue),
      average: toNumber(totals?.average),
      customers: toNumber(totals?.customers),
      cancelled: toNumber(totals?.cancelled),
    },
    statuses: statuses.map((row) => ({ status: row.status, total: toNumber(row.total) })),
    trend: trend.map((row) => ({
      day: row.day,
      orders: toNumber(row.orders),
      revenue: toNumber(row.revenue),
    })),
    topProducts: top.map((row) => ({
      name: row.product_name,
      quantity: toNumber(row.quantity),
      revenue: toNumber(row.revenue),
    })),
    lowStock: lowStock.map((row) => ({
      name: row.product_name,
      sku: row.sku,
      stock: toNumber(row.stock),
    })),
    catalog: {
      products: toNumber(catalog?.products),
      activeProducts: toNumber(catalog?.active_products),
      categories: toNumber(catalog?.categories),
      outOfStock: toNumber(catalog?.out_of_stock),
    },
  };
};

import { tenantQuery } from '@/shared/db';
import {
  ICatalogRow,
  ILowStockRow,
  IStatusRow,
  ITopProductRow,
  ITotalsRow,
  ITrendRow,
  LowStockLimit,
  LowStockThreshold,
  TopProductsLimit,
} from '@/modules/stats/types';

const PAID_FILTER = "status <> 'cancelled'";

const SINCE = "created_at >= now() - ($2 || ' days')::interval";

export const selectTotals = async (tenantId: string, days: number): Promise<ITotalsRow> => {
  const rows = await tenantQuery<ITotalsRow>(
    tenantId,
    `SELECT
       COUNT(*) FILTER (WHERE ${PAID_FILTER})::text AS orders,
       COALESCE(SUM(grand_total) FILTER (WHERE ${PAID_FILTER}), 0)::text AS revenue,
       COALESCE(AVG(grand_total) FILTER (WHERE ${PAID_FILTER}), 0)::text AS average,
       COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)::text AS customers,
       COUNT(*) FILTER (WHERE status = 'cancelled')::text AS cancelled
     FROM orders
     WHERE tenant_id = $1 AND ${SINCE}`,
    [tenantId, String(days)],
  );

  return rows[0];
};

export const selectStatusBreakdown = async (
  tenantId: string,
  days: number,
): Promise<IStatusRow[]> => tenantQuery<IStatusRow>(
  tenantId,
  `SELECT status, COUNT(*)::text AS total
   FROM orders
   WHERE tenant_id = $1 AND ${SINCE}
   GROUP BY status
   ORDER BY COUNT(*) DESC`,
  [tenantId, String(days)],
);

export const selectTrend = async (tenantId: string, days: number): Promise<ITrendRow[]> => (
  tenantQuery<ITrendRow>(
    tenantId,
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
            COUNT(*)::text AS orders,
            COALESCE(SUM(grand_total), 0)::text AS revenue
     FROM orders
     WHERE tenant_id = $1 AND ${SINCE} AND ${PAID_FILTER}
     GROUP BY date_trunc('day', created_at)
     ORDER BY date_trunc('day', created_at)`,
    [tenantId, String(days)],
  )
);

export const selectTopProducts = async (
  tenantId: string,
  days: number,
): Promise<ITopProductRow[]> => tenantQuery<ITopProductRow>(
  tenantId,
  `SELECT i.product_name,
          SUM(i.quantity)::text AS quantity,
          SUM(i.total)::text AS revenue
   FROM order_items i
   JOIN orders o ON o.id = i.order_id AND o.tenant_id = i.tenant_id
   WHERE i.tenant_id = $1
     AND o.created_at >= now() - ($2 || ' days')::interval
     AND o.status <> 'cancelled'
   GROUP BY i.product_name
   ORDER BY SUM(i.total) DESC
   LIMIT ${TopProductsLimit}`,
  [tenantId, String(days)],
);

export const selectLowStock = async (tenantId: string): Promise<ILowStockRow[]> => (
  tenantQuery<ILowStockRow>(
    tenantId,
    `SELECT p.name AS product_name, v.sku, v.stock::text AS stock
     FROM product_variants v
     JOIN products p ON p.id = v.product_id AND p.tenant_id = v.tenant_id
     WHERE v.tenant_id = $1 AND v.is_active AND v.stock <= ${LowStockThreshold}
     ORDER BY v.stock, p.name
     LIMIT ${LowStockLimit}`,
    [tenantId],
  )
);

export const selectCatalogCounts = async (tenantId: string): Promise<ICatalogRow> => {
  const rows = await tenantQuery<ICatalogRow>(
    tenantId,
    `SELECT
       (SELECT COUNT(*) FROM products WHERE tenant_id = $1)::text AS products,
       (SELECT COUNT(*) FROM products WHERE tenant_id = $1 AND is_active)::text AS active_products,
       (SELECT COUNT(*) FROM categories WHERE tenant_id = $1)::text AS categories,
       (SELECT COUNT(*) FROM product_variants WHERE tenant_id = $1 AND stock = 0)::text
         AS out_of_stock`,
    [tenantId],
  );

  return rows[0];
};

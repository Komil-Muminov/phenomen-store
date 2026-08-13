import { tenantQuery, withTenant } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import { IPaymentFilters, IPaymentRow } from '@/modules/payment/types';

const PAYMENT_COLUMNS = `
  p.id, p.order_id, p.provider, p.amount::text, p.currency, p.status,
  p.receipt_url, p.receipt_note,
  p.submitted_at::text AS submitted_at,
  p.reviewed_at::text AS reviewed_at,
  p.reviewed_by, p.review_note,
  p.created_at::text AS created_at,
  o.number AS order_number,
  o.customer->>'name' AS customer_name
`;

const PAYMENT_FROM = 'FROM payments p JOIN orders o ON o.id = p.order_id AND o.tenant_id = p.tenant_id';

export const selectPaymentByOrder = async (
  tenantId: string,
  orderId: string,
): Promise<IPaymentRow | null> => {
  const rows = await tenantQuery<IPaymentRow>(
    tenantId,
    `SELECT ${PAYMENT_COLUMNS} ${PAYMENT_FROM}
     WHERE p.tenant_id = $1 AND p.order_id = $2
     ORDER BY p.created_at DESC LIMIT 1`,
    [tenantId, orderId],
  );

  return rows[0] ?? null;
};

export const selectPaymentPage = async (
  tenantId: string,
  filters: IPaymentFilters,
  limit: number,
  offset: number,
): Promise<{ items: IPaymentRow[]; total: number }> => {
  const rows = await tenantQuery<TCounted<IPaymentRow>>(
    tenantId,
    `SELECT ${PAYMENT_COLUMNS}, COUNT(*) OVER()::text AS total_count
     ${PAYMENT_FROM}
     WHERE p.tenant_id = $1
       AND ($2::text IS NULL OR o.number ILIKE $2 OR o.customer->>'name' ILIKE $2)
       AND ($3::text IS NULL OR p.status = $3)
     ORDER BY p.submitted_at DESC NULLS LAST, p.created_at DESC
     LIMIT $4 OFFSET $5`,
    [tenantId, filters.search, filters.status, limit, offset],
  );

  return splitTotal(rows);
};

export interface IOrderPaymentContext {
  user_id: string | null;
  number: string;
  payment_method: string | null;
  payment_status: string;
}

export const selectOrderPaymentContext = async (
  tenantId: string,
  orderId: string,
): Promise<IOrderPaymentContext | null> => {
  const rows = await tenantQuery<IOrderPaymentContext>(
    tenantId,
    `SELECT user_id, number, payment_status, delivery->>'paymentMethod' AS payment_method
     FROM orders WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, orderId],
  );

  return rows[0] ?? null;
};

export const attachReceipt = async (
  tenantId: string,
  orderId: string,
  url: string,
  note: string | null,
  status: string,
): Promise<void> => withTenant(tenantId, async (client) => {
  await client.query(
    `UPDATE payments
     SET receipt_url = $3, receipt_note = $4, status = $5,
         submitted_at = now(), reviewed_at = NULL, reviewed_by = NULL,
         review_note = NULL, updated_at = now()
     WHERE tenant_id = $1 AND order_id = $2`,
    [tenantId, orderId, url, note, status],
  );

  await client.query(
    'UPDATE orders SET payment_status = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, orderId, status],
  );
});

export const applyPaymentReview = async (
  tenantId: string,
  orderId: string,
  status: string,
  reviewer: string | null,
  note: string | null,
): Promise<void> => withTenant(tenantId, async (client) => {
  await client.query(
    `UPDATE payments
     SET status = $3, reviewed_at = now(), reviewed_by = $4, review_note = $5, updated_at = now()
     WHERE tenant_id = $1 AND order_id = $2`,
    [tenantId, orderId, status, reviewer, note],
  );

  await client.query(
    'UPDATE orders SET payment_status = $3, updated_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, orderId, status],
  );
});

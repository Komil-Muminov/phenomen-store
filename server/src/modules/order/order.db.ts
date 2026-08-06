import { PoolClient } from 'pg';
import { tenantQuery, withTenant } from '@/shared/db';
import { IPricingItem, IPricingTotals } from '@/modules/pricing';
import { markCartConverted } from '@/modules/cart';
import {
  ICustomerPayload,
  IDeliveryPayload,
  IOrderItemRow,
  IOrderRow,
  ORDER_NUMBER_PAD,
  OrderStatus,
  PaymentStatus,
} from '@/modules/order/types';

const ORDER_COLUMNS = `id, number, status, payment_status, delivery_status, items_total::text, discount_total::text,
  delivery_total::text, tax_total::text, grand_total::text, currency, customer, delivery, comment,
  created_at::text AS created_at`;

interface ICreateOrderInput {
  tenantId: string;
  userId: string | null;
  cartId: string;
  items: IPricingItem[];
  totals: IPricingTotals;
  customer: ICustomerPayload;
  delivery: IDeliveryPayload;
  paymentMethod: string;
  comment: string | null;
  idempotencyKey: string | null;
  promotionId: string | null;
}

const generateNumber = async (client: PoolClient, tenantId: string): Promise<string> => {
  const result = await client.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM orders
     WHERE tenant_id = $1 AND created_at >= date_trunc('day', now())`,
    [tenantId],
  );
  const sequence = Number(result.rows[0]?.total ?? 0) + 1;
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');

  return `${stamp}-${String(sequence).padStart(ORDER_NUMBER_PAD, '0')}`;
};

export const selectOrderByIdempotencyKey = async (
  tenantId: string,
  key: string,
): Promise<IOrderRow | null> => {
  const rows = await tenantQuery<IOrderRow>(
    tenantId,
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE tenant_id = $1 AND idempotency_key = $2 LIMIT 1`,
    [tenantId, key],
  );

  return rows[0] ?? null;
};

export const insertOrder = async (input: ICreateOrderInput): Promise<IOrderRow> => withTenant(
  input.tenantId,
  async (client) => {
    for (const item of input.items) {
      const locked = await client.query<{ available: number }>(
        `SELECT (stock - reserved) AS available FROM product_variants
         WHERE tenant_id = $1 AND id = $2 FOR UPDATE`,
        [input.tenantId, item.variantId],
      );

      if ((locked.rows[0]?.available ?? 0) < item.quantity) {
        throw new Error(`${item.productName}: недостаточно остатка`);
      }
    }

    const number = await generateNumber(client, input.tenantId);
    const created = await client.query<IOrderRow>(
      `INSERT INTO orders (tenant_id, user_id, number, status, payment_status, items_total, discount_total,
                           delivery_total, tax_total, grand_total, currency, customer, delivery, comment, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14, $15)
       RETURNING ${ORDER_COLUMNS}`,
      [
        input.tenantId,
        input.userId,
        number,
        OrderStatus.created,
        PaymentStatus.pending,
        input.totals.itemsTotal,
        input.totals.discountTotal,
        input.totals.deliveryTotal,
        input.totals.taxTotal,
        input.totals.grandTotal,
        input.totals.currency,
        JSON.stringify(input.customer),
        JSON.stringify({ ...input.delivery, paymentMethod: input.paymentMethod }),
        input.comment,
        input.idempotencyKey,
      ],
    );
    const order = created.rows[0];

    for (const item of input.items) {
      await client.query(
        `INSERT INTO order_items (tenant_id, order_id, variant_id, product_name, sku, options, quantity, price, total)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)`,
        [
          input.tenantId,
          order.id,
          item.variantId,
          item.productName,
          item.sku,
          JSON.stringify(item.options),
          item.quantity,
          item.price,
          item.price * item.quantity,
        ],
      );

      await client.query(
        'UPDATE product_variants SET reserved = reserved + $3 WHERE tenant_id = $1 AND id = $2',
        [input.tenantId, item.variantId, item.quantity],
      );
    }

    await client.query(
      'INSERT INTO order_status_history (tenant_id, order_id, status) VALUES ($1, $2, $3)',
      [input.tenantId, order.id, OrderStatus.created],
    );

    await client.query(
      `INSERT INTO payments (tenant_id, order_id, provider, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [input.tenantId, order.id, input.paymentMethod, input.totals.grandTotal, input.totals.currency, PaymentStatus.pending],
    );

    if (input.promotionId) {
      await client.query(
        'UPDATE promotions SET usage_count = usage_count + 1 WHERE tenant_id = $1 AND id = $2',
        [input.tenantId, input.promotionId],
      );
    }

    await markCartConverted(client, input.tenantId, input.cartId);

    return order;
  },
);

export const selectOrders = async (
  tenantId: string,
  userId: string,
  limit: number,
  offset: number,
): Promise<{ items: IOrderRow[]; total: number }> => withTenant(tenantId, async (client) => {
  const items = await client.query<IOrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders
     WHERE tenant_id = $1 AND user_id = $2
     ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
    [tenantId, userId, limit, offset],
  );
  const counted = await client.query<{ total: string }>(
    'SELECT COUNT(*)::text AS total FROM orders WHERE tenant_id = $1 AND user_id = $2',
    [tenantId, userId],
  );

  return { items: items.rows, total: Number(counted.rows[0]?.total ?? 0) };
});

export const selectOrderItems = async (tenantId: string, orderId: string): Promise<IOrderItemRow[]> => (
  tenantQuery<IOrderItemRow>(
    tenantId,
    `SELECT id, variant_id, product_name, sku, options, quantity::text, price::text, total::text
     FROM order_items WHERE tenant_id = $1 AND order_id = $2`,
    [tenantId, orderId],
  )
);

export const selectOrderById = async (tenantId: string, orderId: string): Promise<IOrderRow | null> => {
  const rows = await tenantQuery<IOrderRow>(
    tenantId,
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE tenant_id = $1 AND id = $2 LIMIT 1`,
    [tenantId, orderId],
  );

  return rows[0] ?? null;
};

export const applyOrderStatus = async (
  tenantId: string,
  orderId: string,
  status: string,
  releaseStock: boolean,
  userId: string | null,
): Promise<IOrderRow> => withTenant(tenantId, async (client) => {
  const updated = await client.query<IOrderRow>(
    `UPDATE orders SET status = $3, updated_at = now()
     WHERE tenant_id = $1 AND id = $2
     RETURNING ${ORDER_COLUMNS}`,
    [tenantId, orderId, status],
  );

  await client.query(
    'INSERT INTO order_status_history (tenant_id, order_id, status, created_by) VALUES ($1, $2, $3, $4)',
    [tenantId, orderId, status, userId],
  );

  if (releaseStock) {
    await client.query(
      `UPDATE product_variants pv
       SET reserved = GREATEST(pv.reserved - oi.quantity, 0)
       FROM order_items oi
       WHERE oi.tenant_id = $1 AND oi.order_id = $2 AND oi.variant_id = pv.id`,
      [tenantId, orderId],
    );
  }

  return updated.rows[0];
});

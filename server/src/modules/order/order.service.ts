import { HttpStatus } from '@/shared/config';
import { ITenantContext, IListResult } from '@/shared/types';
import { AppError, isPlainObject, pickString, requireUuid } from '@/shared/utils';
import { getPublicConfig } from '@/modules/tenant';
import { assertOrderAllowed, buildRules, calculateTotals, DeliveryMethods } from '@/modules/pricing';
import { getCartPricing, getCartState, ICartOwner, updateCartItem } from '@/modules/cart';
import { resolveAddressLine } from '@/modules/address';
import { notifyDeliveryStatus, notifyOrderStatus } from '@/modules/notifications';
import { getOrderPayment } from '@/modules/payment';
import {
  applyDeliveryUpdate,
  applyOrderStatus,
  insertOrder,
  selectOrderById,
  selectOrderByIdempotencyKey,
  selectOrderHistory,
  selectOrderItems,
  selectOrderOwner,
  selectOrders,
  selectTenantOrders,
} from '@/modules/order/order.db';
import {
  DeliveryLimits,
  DeliveryStatus,
  DeliveryStatusLabels,
  ICustomerPayload,
  IDeliveryPayload,
  IOrderItemRow,
  IOrderRow,
  OrderErrors,
  OrderStatus,
  OrderTransitions,
  TOrderStatus,
} from '@/modules/order/types';

const mapOrder = (row: IOrderRow, items: IOrderItemRow[] = []) => ({
  id: row.id,
  number: row.number,
  status: row.status,
  paymentStatus: row.payment_status,
  deliveryStatus: row.delivery_status,
  totals: {
    itemsTotal: Number(row.items_total),
    discountTotal: Number(row.discount_total),
    deliveryTotal: Number(row.delivery_total),
    taxTotal: Number(row.tax_total),
    grandTotal: Number(row.grand_total),
    currency: row.currency,
  },
  customer: row.customer,
  delivery: row.delivery,
  comment: row.comment,
  createdAt: row.created_at,
  items: items.map((item) => ({
    id: item.id,
    variantId: item.variant_id,
    name: item.product_name,
    sku: item.sku,
    options: item.options,
    quantity: Number(item.quantity),
    price: Number(item.price),
    total: Number(item.total),
  })),
});

const parseCustomer = (payload: unknown): ICustomerPayload => {
  const source = isPlainObject(payload) ? payload : {};
  const name = pickString(source.name);
  const phone = pickString(source.phone);

  if (!name || !phone) {
    throw new AppError(OrderErrors.customerRequired, HttpStatus.badRequest);
  }

  return {
    name,
    lastName: pickString(source.lastName) || null,
    phone,
    email: pickString(source.email) || null,
  };
};

const parseDelivery = async (
  tenant: ITenantContext,
  owner: ICartOwner,
  payload: unknown,
  allowedMethods: string[],
): Promise<IDeliveryPayload> => {
  const source = isPlainObject(payload) ? payload : {};
  const method = pickString(source.method, DeliveryMethods.courier);

  if (!allowedMethods.includes(method)) {
    throw new AppError(OrderErrors.deliveryNotAllowed, HttpStatus.badRequest);
  }

  const savedId = pickString(source.addressId);
  const saved = savedId && owner.userId
    ? await resolveAddressLine(tenant, owner.userId, requireUuid(savedId, 'addressId'))
    : '';
  const address = saved || pickString(source.address) || null;

  if (method === DeliveryMethods.courier && !address) {
    throw new AppError(OrderErrors.addressRequired, HttpStatus.badRequest);
  }

  return {
    method,
    address,
    slot: pickString(source.slot) || null,
    comment: pickString(source.comment) || null,
  };
};

export const createOrder = async (
  tenant: ITenantContext,
  owner: ICartOwner,
  payload: Record<string, unknown>,
  idempotencyKey: string | null,
) => {
  if (idempotencyKey) {
    const existing = await selectOrderByIdempotencyKey(tenant.id, idempotencyKey);

    if (existing) {
      return mapOrder(existing, await selectOrderItems(tenant.id, existing.id));
    }
  }

  const config = await getPublicConfig(tenant);
  const allowedDelivery = Array.isArray(config.delivery.methods) ? config.delivery.methods as string[] : [];
  const allowedPayment = Array.isArray(config.payment.methods) ? config.payment.methods as string[] : [];
  const customer = parseCustomer(payload.customer);
  const delivery = await parseDelivery(tenant, owner, payload.delivery, allowedDelivery);
  const paymentMethod = pickString(payload.paymentMethod);

  if (!allowedPayment.includes(paymentMethod)) {
    throw new AppError(OrderErrors.paymentNotAllowed, HttpStatus.badRequest);
  }

  const { cartId, items, promotion } = await getCartPricing(tenant, owner);
  const rules = buildRules(config);
  const totals = calculateTotals(items, rules, delivery.method, promotion);

  assertOrderAllowed(items, totals, rules);

  const order = await insertOrder({
    tenantId: tenant.id,
    userId: owner.userId,
    cartId,
    items,
    totals,
    customer,
    delivery,
    paymentMethod,
    comment: pickString(payload.comment) || null,
    idempotencyKey,
    promotionId: promotion?.id ?? null,
  });

  return mapOrder(order, await selectOrderItems(tenant.id, order.id));
};

export const getTenantOrders = async (
  tenant: ITenantContext,
  status: string | null,
  search: string | null,
  page: number,
  limit: number,
): Promise<IListResult<ReturnType<typeof mapOrder>>> => {
  const { items, total } = await selectTenantOrders(
    tenant.id,
    status,
    search,
    limit,
    (page - 1) * limit,
  );
  const mapped = await Promise.all(
    items.map(async (row) => mapOrder(row, await selectOrderItems(tenant.id, row.id))),
  );

  return { items: mapped, total, page, limit };
};

export const getOrders = async (
  tenant: ITenantContext,
  userId: string,
  page: number,
  limit: number,
): Promise<IListResult<ReturnType<typeof mapOrder>>> => {
  const { items, total } = await selectOrders(tenant.id, userId, limit, (page - 1) * limit);
  const mapped = await Promise.all(
    items.map(async (row) => mapOrder(row, await selectOrderItems(tenant.id, row.id))),
  );

  return { items: mapped, total, page, limit };
};

const requireOwnOrder = async (
  tenant: ITenantContext,
  orderId: string,
  userId: string | null,
): Promise<IOrderRow> => {
  const row = await selectOrderById(tenant.id, orderId);

  if (!row || (userId !== null && row.user_id !== userId)) {
    throw new AppError(OrderErrors.notFound, HttpStatus.notFound);
  }

  return row;
};

export const getOrder = async (
  tenant: ITenantContext,
  orderId: string,
  userId: string | null,
) => {
  const row = await requireOwnOrder(tenant, orderId, userId);

  return {
    ...mapOrder(row, await selectOrderItems(tenant.id, orderId)),
    payment: await getOrderPayment(tenant, orderId),
    history: (await selectOrderHistory(tenant.id, orderId)).map((entry) => ({
      status: entry.status,
      comment: entry.comment,
      createdAt: entry.created_at,
    })),
  };
};

const DELIVERY_STATUSES: string[] = Object.values(DeliveryStatus);

const trimmed = (value: unknown, max: number): string | null => (
  pickString(value).slice(0, max) || null
);

export const changeDeliveryStatus = async (
  tenant: ITenantContext,
  orderId: string,
  payload: Record<string, unknown>,
  userId: string | null,
) => {
  const status = pickString(payload.status);

  if (!DELIVERY_STATUSES.includes(status)) {
    throw new AppError(OrderErrors.deliveryStatusInvalid, HttpStatus.badRequest);
  }

  const updated = await applyDeliveryUpdate(
    tenant.id,
    orderId,
    status,
    {
      courierName: trimmed(payload.courierName, DeliveryLimits.courierMax),
      courierPhone: trimmed(payload.courierPhone, DeliveryLimits.phoneMax),
      trackingNumber: trimmed(payload.trackingNumber, DeliveryLimits.trackingMax),
      eta: trimmed(payload.eta, DeliveryLimits.etaMax),
    },
    userId,
    trimmed(payload.comment, DeliveryLimits.courierMax),
  );

  if (!updated) {
    throw new AppError(OrderErrors.notFound, HttpStatus.notFound);
  }

  await notifyDeliveryStatus(
    tenant,
    updated.user_id,
    updated.number,
    DeliveryStatusLabels[status] ?? status,
  );

  return getOrder(tenant, orderId, null);
};

export const repeatOrder = async (
  tenant: ITenantContext,
  owner: ICartOwner,
  orderId: string,
  deliveryMethod: string,
) => {
  await requireOwnOrder(tenant, orderId, owner.userId);

  const items = await selectOrderItems(tenant.id, orderId);
  const skipped: string[] = [];
  let added = 0;

  for (const item of items) {
    try {
      if (!item.variant_id) {
        throw new AppError(OrderErrors.itemGone, HttpStatus.notFound);
      }

      await updateCartItem(
        tenant,
        owner,
        item.variant_id,
        Number(item.quantity),
        deliveryMethod,
      );
      added += 1;
    } catch {
      skipped.push(item.product_name);
    }
  }

  return { added, skipped, cart: await getCartState(tenant, owner, deliveryMethod) };
};

export const changeOrderStatus = async (
  tenant: ITenantContext,
  orderId: string,
  nextStatus: TOrderStatus,
  userId: string | null,
) => {
  const current = await selectOrderById(tenant.id, orderId);

  if (!current) {
    throw new AppError(OrderErrors.notFound, HttpStatus.notFound);
  }

  const allowed = OrderTransitions[current.status as TOrderStatus] ?? [];

  if (!allowed.includes(nextStatus)) {
    throw new AppError(OrderErrors.transitionDenied, HttpStatus.conflict);
  }

  const updated = await applyOrderStatus(
    tenant.id,
    orderId,
    nextStatus,
    nextStatus === OrderStatus.cancelled,
    userId,
  );

  await notifyOrderStatus(
    tenant,
    await selectOrderOwner(tenant.id, orderId),
    updated.number,
    nextStatus,
  );

  return mapOrder(updated, await selectOrderItems(tenant.id, orderId));
};

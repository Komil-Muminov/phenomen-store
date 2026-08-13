import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import { getPublicConfig } from '@/modules/tenant';
import { notifyPaymentReview } from '@/modules/notifications';
import {
  applyPaymentReview,
  attachReceipt,
  selectOrderPaymentContext,
  selectPaymentByOrder,
  selectPaymentPage,
} from '@/modules/payment/payment.db';
import {
  EMPTY_CARD,
  IPaymentCard,
  IPaymentFilters,
  IPaymentRow,
  PaymentErrors,
  PaymentLimits,
  PaymentMethodCodes,
  PaymentStates,
} from '@/modules/payment/types';

const STATES: string[] = Object.values(PaymentStates);

export const mapPayment = (row: IPaymentRow) => ({
  id: row.id,
  orderId: row.order_id,
  orderNumber: row.order_number,
  customerName: row.customer_name,
  method: row.provider,
  amount: Number(row.amount),
  currency: row.currency,
  status: row.status,
  receiptUrl: row.receipt_url,
  receiptNote: row.receipt_note,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at,
  reviewedBy: row.reviewed_by,
  reviewNote: row.review_note,
  createdAt: row.created_at,
});

export const readPaymentCard = (source: Record<string, unknown>): IPaymentCard => {
  const card = source.card;

  if (typeof card !== 'object' || card === null) {
    return EMPTY_CARD;
  }

  const values = card as Record<string, unknown>;

  return {
    number: pickString(values.number),
    holder: pickString(values.holder),
    bank: pickString(values.bank),
    note: pickString(values.note),
  };
};

export const pickPaymentStatus = (value: unknown): string | null => {
  const status = pickString(value);

  return STATES.includes(status) ? status : null;
};

export const getPaymentCard = async (tenant: ITenantContext) => {
  const config = await getPublicConfig(tenant);

  return { card: readPaymentCard(config.payment) };
};

export const getOrderPayment = async (tenant: ITenantContext, orderId: string) => {
  const row = await selectPaymentByOrder(tenant.id, orderId);

  return row ? mapPayment(row) : null;
};

export const submitReceipt = async (
  tenant: ITenantContext,
  orderId: string,
  userId: string | null,
  payload: Record<string, unknown>,
) => {
  const order = await selectOrderPaymentContext(tenant.id, orderId);

  if (!order || (userId !== null && order.user_id !== userId)) {
    throw new AppError(PaymentErrors.orderNotFound, HttpStatus.notFound);
  }

  if (order.payment_method !== PaymentMethodCodes.cardTransfer) {
    throw new AppError(PaymentErrors.methodMismatch, HttpStatus.conflict);
  }

  if (order.payment_status === PaymentStates.paid) {
    throw new AppError(PaymentErrors.alreadyPaid, HttpStatus.conflict);
  }

  const url = pickString(payload.imageUrl).slice(0, PaymentLimits.urlMax);

  if (!url) {
    throw new AppError(PaymentErrors.receiptRequired, HttpStatus.badRequest);
  }

  await attachReceipt(
    tenant.id,
    orderId,
    url,
    pickString(payload.note).slice(0, PaymentLimits.noteMax) || null,
    PaymentStates.review,
  );

  return getOrderPayment(tenant, orderId);
};

export const reviewReceipt = async (
  tenant: ITenantContext,
  orderId: string,
  reviewer: string | null,
  payload: Record<string, unknown>,
) => {
  const order = await selectOrderPaymentContext(tenant.id, orderId);

  if (!order) {
    throw new AppError(PaymentErrors.orderNotFound, HttpStatus.notFound);
  }

  const accepted = payload.accepted === true;
  const stored = await selectPaymentByOrder(tenant.id, orderId);

  if (payload.accepted !== true && payload.accepted !== false) {
    throw new AppError(PaymentErrors.reviewInvalid, HttpStatus.badRequest);
  }

  if (!stored?.receipt_url) {
    throw new AppError(PaymentErrors.noReceipt, HttpStatus.conflict);
  }

  const note = pickString(payload.note).slice(0, PaymentLimits.noteMax);

  await applyPaymentReview(
    tenant.id,
    orderId,
    accepted ? PaymentStates.paid : PaymentStates.failed,
    reviewer,
    note || null,
  );

  await notifyPaymentReview(tenant, order.user_id, order.number, accepted, note);

  return getOrderPayment(tenant, orderId);
};

export const listPayments = async (
  tenant: ITenantContext,
  filters: IPaymentFilters,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectPaymentPage(tenant.id, filters, limit, offset);

  return { items: items.map(mapPayment), total, page, limit };
};

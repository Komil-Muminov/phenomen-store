import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString, requireUuid } from '@/shared/utils';
import { invalidateTenantCache } from '@/modules/tenant';
import { runBillingCheck } from '@/modules/billing';
import {
  NotificationKinds,
  NotificationTexts,
  TNotificationKind,
  insertNotification,
} from '@/modules/notifications';
import { PlanCodes, Plans, isKnownPlan, resolvePlan } from '@/modules/plans';
import {
  applyInvoiceReview,
  applyTenantPlan,
  attachInvoiceReceipt,
  generateInvoiceNumber,
  insertInvoice,
  selectInvoiceById,
  selectInvoicePage,
  selectPlatformCard,
  selectTenantOwnerIds,
  setInvoiceStatus,
  upsertPlatformCard,
} from '@/modules/invoice/invoice.db';
import {
  EMPTY_PLATFORM_CARD,
  IInvoiceFilters,
  IInvoiceRow,
  IPlatformCard,
  InvoiceErrors,
  InvoiceLimits,
  InvoiceStatus,
} from '@/modules/invoice/types';

const STATUSES: string[] = Object.values(InvoiceStatus);

const CLOSED_STATUSES: string[] = [InvoiceStatus.paid, InvoiceStatus.cancelled];

const mapInvoice = (row: IInvoiceRow) => ({
  id: row.id,
  tenantId: row.tenant_id,
  tenantKey: row.tenant_key,
  tenantName: row.tenant_name,
  number: row.number,
  plan: row.plan,
  period: row.period,
  amount: Number(row.amount),
  currency: row.currency,
  status: row.status,
  comment: row.comment,
  receiptUrl: row.receipt_url,
  receiptNote: row.receipt_note,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at,
  reviewedBy: row.reviewed_by,
  reviewNote: row.review_note,
  issuedBy: row.issued_by,
  dueDate: row.due_date,
  createdAt: row.created_at,
});

const readCard = (source: Record<string, unknown>): IPlatformCard => ({
  number: pickString(source.number),
  holder: pickString(source.holder),
  bank: pickString(source.bank),
  note: pickString(source.note),
});

export const pickInvoiceStatus = (value: unknown): string | null => {
  const status = pickString(value);

  return STATUSES.includes(status) ? status : null;
};

const requireInvoice = async (id: string, tenantId: string | null): Promise<IInvoiceRow> => {
  const row = await selectInvoiceById(id, tenantId);

  if (!row) {
    throw new AppError(InvoiceErrors.notFound, HttpStatus.notFound);
  }

  return row;
};

const notifyOwners = async (
  tenantId: string,
  title: string,
  text: string,
): Promise<void> => {
  const owners = await selectTenantOwnerIds(tenantId);

  for (const userId of owners) {
    await insertNotification(tenantId, {
      userId,
      kind: NotificationKinds.system as TNotificationKind,
      title,
      text,
      actionUrl: NotificationTexts.invoiceActionUrl,
    });
  }
};

export const getPlatformCard = async () => ({
  card: readCard(await selectPlatformCard()),
  plans: Plans.map((plan) => ({ code: plan.code, name: plan.name, price: plan.price })),
});

export const savePlatformCard = async (payload: Record<string, unknown>) => {
  const card = readCard(payload.card && typeof payload.card === 'object'
    ? payload.card as Record<string, unknown>
    : payload);

  await upsertPlatformCard({ ...EMPTY_PLATFORM_CARD, ...card });

  return getPlatformCard();
};

export const listInvoices = async (
  filters: IInvoiceFilters,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectInvoicePage(filters, limit, offset);

  return { items: items.map(mapInvoice), total, page, limit };
};

export const getInvoice = async (id: string, tenantId: string | null) => (
  mapInvoice(await requireInvoice(id, tenantId))
);

export const issueInvoice = async (
  payload: Record<string, unknown>,
  issuedBy: string,
) => {
  const tenantId = requireUuid(payload.tenantId, 'tenantId');
  const plan = pickString(payload.plan, PlanCodes.start);
  const period = pickString(payload.period).slice(0, InvoiceLimits.periodMax);
  const rawAmount = Number(payload.amount);
  const amount = Number.isFinite(rawAmount) && rawAmount > 0
    ? rawAmount
    : resolvePlan(plan).price;

  if (!isKnownPlan(plan)) {
    throw new AppError(InvoiceErrors.planRequired, HttpStatus.badRequest);
  }

  if (!period) {
    throw new AppError(InvoiceErrors.periodRequired, HttpStatus.badRequest);
  }

  if (amount <= 0) {
    throw new AppError(InvoiceErrors.amountInvalid, HttpStatus.badRequest);
  }

  const created = await insertInvoice(
    tenantId,
    await generateInvoiceNumber(),
    plan,
    period,
    amount,
    pickString(payload.comment).slice(0, InvoiceLimits.commentMax) || null,
    issuedBy,
    pickString(payload.dueDate) || null,
  );
  const invoice = await getInvoice(created.id, null);

  await notifyOwners(
    tenantId,
    NotificationTexts.invoiceIssuedTitle,
    NotificationTexts.invoiceIssuedBody(invoice.number, invoice.period),
  );

  return invoice;
};

export const submitInvoiceReceipt = async (
  tenant: ITenantContext,
  id: string,
  payload: Record<string, unknown>,
) => {
  const invoice = await requireInvoice(id, tenant.id);

  if (invoice.status === InvoiceStatus.paid) {
    throw new AppError(InvoiceErrors.alreadyPaid, HttpStatus.conflict);
  }

  if (invoice.status === InvoiceStatus.cancelled) {
    throw new AppError(InvoiceErrors.closed, HttpStatus.conflict);
  }

  const url = pickString(payload.imageUrl).slice(0, InvoiceLimits.urlMax);

  if (!url) {
    throw new AppError(InvoiceErrors.receiptRequired, HttpStatus.badRequest);
  }

  await attachInvoiceReceipt(
    id,
    url,
    pickString(payload.note).slice(0, InvoiceLimits.noteMax) || null,
    InvoiceStatus.review,
  );

  return getInvoice(id, tenant.id);
};

export const reviewInvoice = async (
  id: string,
  reviewer: string | null,
  payload: Record<string, unknown>,
) => {
  const invoice = await requireInvoice(id, null);

  if (payload.accepted !== true && payload.accepted !== false) {
    throw new AppError(InvoiceErrors.reviewInvalid, HttpStatus.badRequest);
  }

  if (!invoice.receipt_url) {
    throw new AppError(InvoiceErrors.noReceipt, HttpStatus.conflict);
  }

  const accepted = payload.accepted === true;
  const note = pickString(payload.note).slice(0, InvoiceLimits.noteMax);

  await applyInvoiceReview(
    id,
    accepted ? InvoiceStatus.paid : InvoiceStatus.failed,
    reviewer,
    note || null,
  );

  if (accepted) {
    await applyTenantPlan(invoice.tenant_id, invoice.plan);
    invalidateTenantCache(invoice.tenant_key);
  }

  await runBillingCheck();

  await notifyOwners(
    invoice.tenant_id,
    accepted ? NotificationTexts.invoicePaidTitle : NotificationTexts.invoiceFailedTitle,
    accepted
      ? NotificationTexts.invoicePaidBody(invoice.number)
      : NotificationTexts.invoiceFailedBody(invoice.number, note),
  );

  return getInvoice(id, null);
};

export const cancelInvoice = async (id: string) => {
  const invoice = await requireInvoice(id, null);

  if (CLOSED_STATUSES.includes(invoice.status)) {
    throw new AppError(InvoiceErrors.closed, HttpStatus.conflict);
  }

  await setInvoiceStatus(id, InvoiceStatus.cancelled);
  await runBillingCheck();

  return getInvoice(id, null);
};

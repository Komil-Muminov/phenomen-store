import { query, tenantQuery } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import { IInvoiceFilters, IInvoiceRow, INVOICE_NUMBER_PAD } from '@/modules/invoice/types';

const INVOICE_COLUMNS = `
  i.id, i.tenant_id, i.number, i.plan, i.period, i.amount::text, i.currency,
  i.status, i.comment, i.receipt_url, i.receipt_note,
  i.submitted_at::text AS submitted_at,
  i.reviewed_at::text AS reviewed_at,
  i.reviewed_by, i.review_note, i.issued_by,
  i.due_date::text AS due_date,
  i.created_at::text AS created_at,
  t.key AS tenant_key,
  t.name AS tenant_name
`;

const INVOICE_FROM = 'FROM platform_invoices i JOIN tenants t ON t.id = i.tenant_id';

export const generateInvoiceNumber = async (): Promise<string> => {
  const rows = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM platform_invoices
     WHERE created_at >= date_trunc('month', now())`,
  );
  const sequence = Number(rows[0]?.total ?? 0) + 1;
  const stamp = new Date().toISOString().slice(0, 7).replace('-', '');

  return `${stamp}-${String(sequence).padStart(INVOICE_NUMBER_PAD, '0')}`;
};

export const insertInvoice = async (
  tenantId: string,
  number: string,
  plan: string,
  period: string,
  amount: number,
  comment: string | null,
  issuedBy: string,
  dueDate: string | null,
): Promise<{ id: string }> => {
  const rows = await query<{ id: string }>(
    `INSERT INTO platform_invoices
       (tenant_id, number, plan, period, amount, comment, issued_by, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date)
     RETURNING id`,
    [tenantId, number, plan, period, amount, comment, issuedBy, dueDate],
  );

  return rows[0];
};

export const selectInvoicePage = async (
  filters: IInvoiceFilters,
  limit: number,
  offset: number,
): Promise<{ items: IInvoiceRow[]; total: number }> => {
  const rows = await query<TCounted<IInvoiceRow>>(
    `SELECT ${INVOICE_COLUMNS}, COUNT(*) OVER()::text AS total_count
     ${INVOICE_FROM}
     WHERE ($1::uuid IS NULL OR i.tenant_id = $1)
       AND ($2::text IS NULL OR i.number ILIKE $2 OR t.name ILIKE $2 OR t.key ILIKE $2)
       AND ($3::text IS NULL OR i.status = $3)
     ORDER BY i.created_at DESC
     LIMIT $4 OFFSET $5`,
    [filters.tenantId, filters.search, filters.status, limit, offset],
  );

  return splitTotal(rows);
};

export const selectInvoiceById = async (
  id: string,
  tenantId: string | null,
): Promise<IInvoiceRow | null> => {
  const rows = await query<IInvoiceRow>(
    `SELECT ${INVOICE_COLUMNS} ${INVOICE_FROM}
     WHERE i.id = $1 AND ($2::uuid IS NULL OR i.tenant_id = $2)
     LIMIT 1`,
    [id, tenantId],
  );

  return rows[0] ?? null;
};

export const attachInvoiceReceipt = async (
  id: string,
  url: string,
  note: string | null,
  status: string,
): Promise<void> => {
  await query(
    `UPDATE platform_invoices
     SET receipt_url = $2, receipt_note = $3, status = $4, submitted_at = now(),
         reviewed_at = NULL, reviewed_by = NULL, review_note = NULL
     WHERE id = $1`,
    [id, url, note, status],
  );
};

export const applyInvoiceReview = async (
  id: string,
  status: string,
  reviewer: string | null,
  note: string | null,
): Promise<void> => {
  await query(
    `UPDATE platform_invoices
     SET status = $2, reviewed_at = now(), reviewed_by = $3, review_note = $4
     WHERE id = $1`,
    [id, status, reviewer, note],
  );
};

export const setInvoiceStatus = async (id: string, status: string): Promise<number> => {
  const rows = await query<{ id: string }>(
    'UPDATE platform_invoices SET status = $2 WHERE id = $1 RETURNING id',
    [id, status],
  );

  return rows.length;
};

export const applyTenantPlan = async (tenantId: string, plan: string): Promise<void> => {
  await query('UPDATE tenants SET plan = $2 WHERE id = $1', [tenantId, plan]);
};

export const selectTenantOwnerIds = async (tenantId: string): Promise<string[]> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `SELECT id FROM users
     WHERE tenant_id = $1 AND role IN ('owner', 'admin') AND status = 'active'`,
    [tenantId],
  );

  return rows.map((row) => row.id);
};

export const selectPlatformCard = async (): Promise<Record<string, unknown>> => {
  const rows = await query<{ card: Record<string, unknown> }>(
    'SELECT card FROM platform_settings WHERE id = true LIMIT 1',
  );

  return rows[0]?.card ?? {};
};

export const upsertPlatformCard = async (card: Record<string, string>): Promise<void> => {
  await query(
    `INSERT INTO platform_settings (id, card) VALUES (true, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET card = EXCLUDED.card, updated_at = now()`,
    [JSON.stringify(card)],
  );
};

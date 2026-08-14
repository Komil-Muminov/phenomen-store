export const InvoicePaths = {
  search: '/search',
  get: '/get/:id',
  receipt: '/receipt/:id',
  card: '/card',
} as const;

export const PlatformInvoicePaths = {
  search: '/search',
  create: '/create',
  get: '/get/:id',
  review: '/review/:id',
  cancel: '/cancel/:id',
  settings: '/settings',
} as const;

export const InvoiceStatus = {
  pending: 'pending',
  review: 'review',
  paid: 'paid',
  failed: 'failed',
  cancelled: 'cancelled',
} as const;

export const InvoiceLimits = {
  commentMax: 300,
  noteMax: 300,
  urlMax: 500,
  periodMax: 40,
} as const;

export const InvoiceErrors = {
  notFound: 'Счёт не найден',
  planRequired: 'Выберите тариф',
  periodRequired: 'Укажите период — например, «сентябрь 2026»',
  amountInvalid: 'Сумма счёта должна быть больше нуля',
  receiptRequired: 'Прикрепите скриншот перевода',
  noReceipt: 'Магазин ещё не прикрепил чек',
  alreadyPaid: 'Счёт уже оплачен',
  closed: 'Счёт закрыт',
  reviewInvalid: 'Выберите: подтвердить или отклонить оплату',
} as const;

export const INVOICE_NUMBER_PAD = 4;

export interface IInvoiceRow {
  id: string;
  tenant_id: string;
  tenant_key: string;
  tenant_name: string;
  number: string;
  plan: string;
  period: string;
  amount: string;
  currency: string;
  status: string;
  comment: string | null;
  receipt_url: string | null;
  receipt_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
  issued_by: string;
  due_date: string | null;
  created_at: string;
}

export interface IInvoiceFilters {
  search: string | null;
  status: string | null;
  tenantId: string | null;
}

export interface IPlatformCard {
  number: string;
  holder: string;
  bank: string;
  note: string;
}

export const EMPTY_PLATFORM_CARD: IPlatformCard = {
  number: '',
  holder: '',
  bank: '',
  note: '',
};

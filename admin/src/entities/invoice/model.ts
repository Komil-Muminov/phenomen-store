import type { IInvoice, TInvoiceList } from '@contracts';

export type { IInvoice };

export type IInvoiceList = TInvoiceList;

export const InvoiceStatus = {
  pending: 'pending',
  review: 'review',
  paid: 'paid',
  failed: 'failed',
  cancelled: 'cancelled',
} as const;

export const InvoiceStatusLabels: Record<string, string> = {
  pending: 'ожидает оплаты',
  review: 'чек на проверке',
  paid: 'оплачен',
  failed: 'оплата не принята',
  cancelled: 'отменён',
};

export const InvoiceStatusColors: Record<string, string> = {
  pending: 'default',
  review: 'gold',
  paid: 'green',
  failed: 'red',
  cancelled: 'default',
};

export const InvoiceStatusOptions = [
  { value: 'all', label: 'Все счета' },
  { value: InvoiceStatus.pending, label: 'Ожидают оплаты' },
  { value: InvoiceStatus.review, label: 'Чек на проверке' },
  { value: InvoiceStatus.paid, label: 'Оплачены' },
  { value: InvoiceStatus.failed, label: 'Не приняты' },
  { value: InvoiceStatus.cancelled, label: 'Отменены' },
];

export const parseInvoiceFilter = (value: string): string | undefined => (
  value === 'all' ? undefined : value
);

export const formatInvoiceFilter = (value?: string): string => value ?? 'all';

export const formatInvoiceMoment = (value: string): string => (
  new Date(value).toLocaleString('ru-RU')
);

export const formatInvoiceAmount = (invoice: IInvoice): string => (
  `${invoice.amount.toLocaleString('ru-RU')} ${invoice.currency}`
);

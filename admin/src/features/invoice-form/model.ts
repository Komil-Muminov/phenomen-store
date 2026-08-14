export interface IInvoiceValues {
  tenantId: string;
  plan: string;
  period: string;
  amount: number;
  comment: string;
  dueDate: string;
}

export const InvoiceFormTexts = {
  title: 'Новый счёт магазину',
  open: 'Выставить счёт',
  tenant: 'Магазин',
  plan: 'Тариф',
  period: 'Период',
  periodPlaceholder: 'сентябрь 2026',
  amount: 'Сумма',
  comment: 'Комментарий',
  commentPlaceholder: 'Что входит в счёт',
  dueDate: 'Оплатить до',
  dueDatePlaceholder: '2026-09-10',
  submit: 'Выставить',
  cancel: 'Отмена',
} as const;

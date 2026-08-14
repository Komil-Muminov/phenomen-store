export const NotificationKinds = {
  promo: 'promo',
  order: 'order',
  system: 'system',
} as const;

export type TNotificationKind = (typeof NotificationKinds)[keyof typeof NotificationKinds];

export interface INotificationRow {
  id: string;
  kind: string;
  title: string;
  text: string;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface INotificationInput {
  userId: string;
  kind: TNotificationKind;
  title: string;
  text: string;
  actionUrl?: string | null;
}

export interface INotificationFilters {
  kind: string | null;
}

export const NotificationPaths = {
  search: '/search',
  read: '/read/:id',
  readAll: '/read-all',
  delete: '/delete/:id',
  clearAll: '/clear-all',
} as const;

export const NotificationTexts = {
  supportReplyTitle: 'Магазин ответил на обращение',
  supportReplyBody: (subject: string): string => `По обращению «${subject}» есть ответ.`,
  supportActionUrl: '/profile',
  orderStatusTitle: (number: string): string => `Заказ ${number}: статус обновлён`,
  orderStatusBody: (status: string): string => `Новый статус заказа — ${status}.`,
  orderActionUrl: '/profile',
  reviewReplyTitle: 'Магазин ответил на ваш отзыв',
  reviewReplyBody: (product: string): string => `На отзыв о товаре «${product}» есть ответ.`,
  reviewActionUrl: '/profile',
  paymentPaidTitle: 'Оплата подтверждена',
  paymentPaidBody: (number: string): string => `Магазин принял оплату по заказу ${number}.`,
  paymentFailedTitle: 'Оплата не принята',
  paymentFailedBody: (number: string, reason: string): string => (
    reason
      ? `Оплата по заказу ${number} не принята: ${reason}`
      : `Оплата по заказу ${number} не принята — свяжитесь с магазином.`
  ),
  paymentActionUrl: '/profile',
  deliveryTitle: (number: string): string => `Доставка заказа ${number}`,
  deliveryBody: (status: string): string => `Статус доставки — ${status}.`,
  invoiceIssuedTitle: 'Счёт за тариф',
  invoiceIssuedBody: (number: string, period: string): string => (
    `Выставлен счёт ${number} за ${period}. Оплатите переводом и прикрепите чек.`
  ),
  invoicePaidTitle: 'Оплата тарифа подтверждена',
  invoicePaidBody: (number: string): string => `Платформа приняла оплату по счёту ${number}.`,
  invoiceFailedTitle: 'Оплата тарифа не принята',
  invoiceFailedBody: (number: string, reason: string): string => (
    reason
      ? `Оплата по счёту ${number} не принята: ${reason}`
      : `Оплата по счёту ${number} не принята — свяжитесь с платформой.`
  ),
  invoiceActionUrl: '/shop/invoices',
} as const;

export const OrderStatusLabels: Record<string, string> = {
  created: 'создан',
  confirmed: 'подтверждён',
  assembling: 'сборка',
  shipped: 'передан в доставку',
  delivered: 'доставлен',
  completed: 'выполнен',
  cancelled: 'отменён',
};

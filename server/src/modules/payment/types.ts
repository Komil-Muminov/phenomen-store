export const PaymentPaths = {
  card: '/card',
  receipt: '/receipt/:id',
  review: '/review/:id',
  manageSearch: '/manage/search',
} as const;

export const PaymentStates = {
  pending: 'pending',
  review: 'review',
  paid: 'paid',
  failed: 'failed',
  refunded: 'refunded',
} as const;

export const PaymentMethodCodes = {
  cardTransfer: 'card_transfer',
  cashOnDelivery: 'cash_on_delivery',
} as const;

export const PaymentLimits = {
  noteMax: 300,
  urlMax: 500,
} as const;

export const PaymentErrors = {
  orderNotFound: 'Заказ не найден',
  receiptRequired: 'Прикрепите скриншот перевода',
  methodMismatch: 'Этот заказ не оплачивается переводом на карту',
  alreadyPaid: 'Оплата по заказу уже подтверждена',
  reviewInvalid: 'Выберите: подтвердить или отклонить оплату',
  noReceipt: 'Покупатель ещё не прикрепил чек',
  cardMissing: 'Магазин не указал реквизиты для перевода',
} as const;

export interface IPaymentRow {
  id: string;
  order_id: string;
  order_number: string;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  receipt_url: string | null;
  receipt_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  customer_name: string | null;
}

export interface IPaymentCard {
  number: string;
  holder: string;
  bank: string;
  note: string;
}

export const EMPTY_CARD: IPaymentCard = {
  number: '',
  holder: '',
  bank: '',
  note: '',
};

export interface IPaymentFilters {
  search: string | null;
  status: string | null;
}

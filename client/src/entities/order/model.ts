export interface IOrderItem {
  id: string;
  variantId: string | null;
  name: string;
  sku: string | null;
  options: Record<string, string>;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  totals: {
    itemsTotal: number;
    discountTotal: number;
    deliveryTotal: number;
    taxTotal: number;
    grandTotal: number;
    currency: string;
  };
  customer: Record<string, string>;
  delivery: Record<string, string>;
  comment: string | null;
  createdAt: string;
  items: IOrderItem[];
}

export interface IOrderPayment {
  id: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  receiptUrl: string | null;
  receiptNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface IOrderHistoryEntry {
  status: string;
  comment: string | null;
  createdAt: string;
}

export interface IOrderDetail extends IOrder {
  payment: IOrderPayment | null;
  history: IOrderHistoryEntry[];
}

export interface IPaymentCard {
  number: string;
  holder: string;
  bank: string;
  note: string;
}

export const PaymentStates = {
  pending: 'pending',
  review: 'review',
  paid: 'paid',
  failed: 'failed',
} as const;

export const PaymentStateLabels: Record<string, string> = {
  pending: 'ожидает оплаты',
  review: 'чек на проверке',
  paid: 'оплачен',
  failed: 'оплата не принята',
  refunded: 'возврат',
};

export const DeliveryStatusLabels: Record<string, string> = {
  pending: 'ожидает отправки',
  assigned: 'назначен курьер',
  in_transit: 'в пути',
  delivered: 'доставлен',
  returned: 'возвращён',
};

export const CARD_TRANSFER = 'card_transfer';

export const needsReceipt = (order: IOrder): boolean => (
  order.delivery?.paymentMethod === CARD_TRANSFER
  && order.paymentStatus !== PaymentStates.paid
);

export const readTracking = (order: IOrder): string[] => [
  order.delivery?.courierName ? `Курьер: ${order.delivery.courierName}` : '',
  order.delivery?.courierPhone ? `Телефон: ${order.delivery.courierPhone}` : '',
  order.delivery?.trackingNumber ? `Трек-номер: ${order.delivery.trackingNumber}` : '',
  order.delivery?.eta ? `Ожидается: ${order.delivery.eta}` : '',
].filter(Boolean);

export const OrderStatusLabels: Record<string, string> = {
  created: 'Создан',
  confirmed: 'Подтверждён',
  assembling: 'Собирается',
  shipped: 'В доставке',
  delivered: 'Доставлен',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const PaymentStatusLabels: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  failed: 'Ошибка оплаты',
  refunded: 'Возврат',
};

export const CancellableStatuses = ['created', 'confirmed', 'assembling'];

export const formatOrderDate = (value: string): string => value.slice(0, 16).replace('T', ' ');

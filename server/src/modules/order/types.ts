export const OrderStatus = {
  created: 'created',
  confirmed: 'confirmed',
  assembling: 'assembling',
  shipped: 'shipped',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export type TOrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderTransitions: Record<TOrderStatus, TOrderStatus[]> = {
  created: [OrderStatus.confirmed, OrderStatus.cancelled],
  confirmed: [OrderStatus.assembling, OrderStatus.cancelled],
  assembling: [OrderStatus.shipped, OrderStatus.cancelled],
  shipped: [OrderStatus.delivered],
  delivered: [OrderStatus.completed],
  completed: [],
  cancelled: [],
};

export const PaymentStatus = {
  pending: 'pending',
  paid: 'paid',
  failed: 'failed',
  refunded: 'refunded',
} as const;

export const PaymentMethods = {
  cardOnline: 'card_online',
  cardTransfer: 'card_transfer',
  cashOnDelivery: 'cash_on_delivery',
} as const;

export const DeliveryStatus = {
  pending: 'pending',
  assigned: 'assigned',
  inTransit: 'in_transit',
  delivered: 'delivered',
  returned: 'returned',
} as const;

export type TDeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const DeliveryStatusLabels: Record<string, string> = {
  pending: 'ожидает отправки',
  assigned: 'назначен курьер',
  in_transit: 'в пути',
  delivered: 'доставлен',
  returned: 'возвращён',
};

export const DeliveryLimits = {
  courierMax: 80,
  phoneMax: 30,
  trackingMax: 60,
  etaMax: 60,
} as const;

export interface IDeliveryTracking {
  courierName: string | null;
  courierPhone: string | null;
  trackingNumber: string | null;
  eta: string | null;
}

export interface IOrderRow {
  id: string;
  user_id: string | null;
  number: string;
  status: string;
  payment_status: string;
  delivery_status: string;
  items_total: string;
  discount_total: string;
  delivery_total: string;
  tax_total: string;
  grand_total: string;
  currency: string;
  customer: Record<string, unknown>;
  delivery: Record<string, unknown>;
  comment: string | null;
  created_at: string;
}

export interface IOrderItemRow {
  id: string;
  variant_id: string | null;
  product_name: string;
  sku: string | null;
  options: Record<string, string>;
  quantity: string;
  price: string;
  total: string;
}

export interface ICustomerPayload {
  name: string;
  lastName: string | null;
  phone: string;
  email: string | null;
}

export interface IDeliveryPayload {
  method: string;
  address: string | null;
  slot: string | null;
  comment: string | null;
}

export const OrderErrors = {
  customerRequired: 'Укажите имя и телефон получателя',
  addressRequired: 'Укажите адрес доставки',
  paymentNotAllowed: 'Способ оплаты недоступен для этого магазина',
  deliveryNotAllowed: 'Способ доставки недоступен для этого магазина',
  transitionDenied: 'Недопустимая смена статуса заказа',
  notFound: 'Заказ не найден',
  itemGone: 'Товара из заказа больше нет в каталоге',
  deliveryStatusInvalid: 'Неизвестный статус доставки',
} as const;

export const ORDER_NUMBER_PAD = 4;

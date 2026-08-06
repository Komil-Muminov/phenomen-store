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
  cashOnDelivery: 'cash_on_delivery',
} as const;

export interface IOrderRow {
  id: string;
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
} as const;

export const ORDER_NUMBER_PAD = 4;

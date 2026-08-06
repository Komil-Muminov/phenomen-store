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

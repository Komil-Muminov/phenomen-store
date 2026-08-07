export interface ICartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  options: Record<string, string>;
  quantity: number;
  price: number;
  oldPrice: number | null;
  total: number;
  stock: number;
  media: string | null;
}

export interface ICartTotals {
  itemsTotal: number;
  discountTotal: number;
  deliveryTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface ICart {
  id: string;
  promoCode: string | null;
  promoApplied: boolean;
  deliveryMethod: string;
  minOrderTotal: number;
  items: ICartItem[];
  totals: ICartTotals;
}

export const DEFAULT_CART_TOTALS: ICartTotals = {
  itemsTotal: 0,
  discountTotal: 0,
  deliveryTotal: 0,
  taxTotal: 0,
  grandTotal: 0,
  currency: 'TJS',
};

export const DeliveryMethods = {
  courier: 'courier',
  pickup: 'pickup',
} as const;

export const PaymentMethods = {
  cardOnline: 'card_online',
  cashOnDelivery: 'cash_on_delivery',
} as const;

export const DeliveryLabels: Record<string, string> = {
  courier: 'Курьером',
  pickup: 'Самовывоз',
};

export const PaymentLabels: Record<string, string> = {
  card_online: 'Картой онлайн',
  cash_on_delivery: 'При получении',
};

export const countCartItems = (cart: ICart | undefined): number => (
  cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
);

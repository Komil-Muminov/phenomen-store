export interface IPricingItem {
  variantId: string;
  productName: string;
  sku: string;
  options: Record<string, string>;
  quantity: number;
  price: number;
  taxRate: number;
  stock: number;
  media: string | null;
}

export interface IPricingTotals {
  itemsTotal: number;
  discountTotal: number;
  deliveryTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface IPricingRules {
  currency: string;
  deliveryBasePrice: number;
  deliveryFreeFrom: number | null;
  minOrderTotal: number;
  maxItemsPerOrder: number;
}

export interface IPromotion {
  id: string;
  code: string | null;
  kind: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  priority: number;
}

export const DeliveryMethods = {
  courier: 'courier',
  pickup: 'pickup',
} as const;

export const PromotionKinds = {
  cartPercent: 'cart_percent',
  cartFixed: 'cart_fixed',
  freeDelivery: 'free_delivery',
} as const;

export const PricingErrors = {
  emptyCart: 'Корзина пуста',
  minOrder: 'Сумма заказа меньше минимальной',
  tooManyItems: 'Превышено количество позиций в заказе',
  outOfStock: 'Товара недостаточно на складе',
} as const;

export interface ICartOwner {
  userId: string | null;
  guestKey: string | null;
}

export interface ICartRow {
  id: string;
  promo_code: string | null;
}

export interface ICartItemRow {
  id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  options: Record<string, string>;
  quantity: string;
  price: string;
  old_price: string | null;
  stock: number;
  reserved: number;
  tax_rate: string;
  media: string | null;
}

export interface IPromotionRow {
  id: string;
  code: string | null;
  kind: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  priority: number;
}

export const CartStatus = {
  active: 'active',
  converted: 'converted',
  abandoned: 'abandoned',
} as const;

export const CartErrors = {
  ownerRequired: 'Не передан идентификатор покупателя',
  variantNotFound: 'Товар недоступен',
  invalidQuantity: 'Некорректное количество',
  promoNotFound: 'Промокод не найден или истёк',
} as const;

export const MAX_ITEM_QUANTITY = 99;

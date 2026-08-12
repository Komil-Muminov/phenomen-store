export interface IPromotion {
  id: string;
  code: string | null;
  name: string;
  kind: string;
  minTotal: number;
  percent: number;
  amount: number;
  priority: number;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface IPromotionList {
  items: IPromotion[];
  total: number;
  page: number;
  limit: number;
}

export const PromotionKinds = {
  cartPercent: 'cart_percent',
  cartFixed: 'cart_fixed',
  freeDelivery: 'free_delivery',
} as const;

export const PromotionKindOptions = [
  { value: PromotionKinds.cartPercent, label: 'Процент от корзины' },
  { value: PromotionKinds.cartFixed, label: 'Фиксированная сумма' },
  { value: PromotionKinds.freeDelivery, label: 'Бесплатная доставка' },
] as const;

export const PromotionKindLabels: Record<string, string> = {
  cart_percent: 'процент',
  cart_fixed: 'сумма',
  free_delivery: 'доставка',
};

export const PromotionTexts = {
  title: 'Акции',
  subtitle: 'Скидки и промокоды магазина',
  create: 'Новая акция',
  edit: 'Изменение акции',
  empty: 'Акций пока нет',
  searchPlaceholder: 'Название или код',
  deleteTitle: 'Удалить акцию?',
  deleteHint: 'Промокод перестанет работать сразу. Оформленные заказы не изменятся.',
  created: 'Акция создана',
  updated: 'Акция обновлена',
  deleted: 'Акция удалена',
  noCode: 'без кода',
  unlimited: 'без лимита',
  always: 'всегда',
} as const;

export const formatDiscount = (promotion: IPromotion): string => {
  if (promotion.kind === PromotionKinds.cartPercent) {
    return `−${promotion.percent}%`;
  }

  if (promotion.kind === PromotionKinds.cartFixed) {
    return `−${new Intl.NumberFormat('ru-RU').format(promotion.amount)} смн`;
  }

  return 'доставка 0';
};

export const formatUsage = (promotion: IPromotion): string => (
  promotion.usageLimit === null
    ? `${promotion.usageCount} · ${PromotionTexts.unlimited}`
    : `${promotion.usageCount} из ${promotion.usageLimit}`
);

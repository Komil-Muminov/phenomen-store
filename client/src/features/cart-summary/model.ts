import { ICartTotals } from '@/entities/cart';

export const SummaryLabels = {
  items: 'Товары',
  discount: 'Скидка',
  delivery: 'Доставка',
  tax: 'В том числе НДС',
  total: 'Итого',
  promoPlaceholder: 'Промокод',
  promoApply: 'Применить',
  promoReset: 'Сбросить',
  checkout: 'Оформить заказ',
  freeDelivery: 'Бесплатно',
} as const;

export const buildSummaryRows = (totals: ICartTotals) => [
  { key: 'items', label: SummaryLabels.items, value: totals.itemsTotal, muted: false },
  { key: 'discount', label: SummaryLabels.discount, value: -totals.discountTotal, muted: false },
  { key: 'delivery', label: SummaryLabels.delivery, value: totals.deliveryTotal, muted: false },
  { key: 'tax', label: SummaryLabels.tax, value: totals.taxTotal, muted: true },
].filter((row) => row.key !== 'discount' || totals.discountTotal > 0);

export const buildMinOrderMessage = (itemsTotal: number, minOrderTotal: number): string | null => (
  itemsTotal >= minOrderTotal
    ? null
    : `До минимального заказа не хватает ${Math.ceil(minOrderTotal - itemsTotal)}`
);

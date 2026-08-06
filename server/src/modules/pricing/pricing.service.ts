import { HttpStatus } from '@/shared/config';
import { AppError } from '@/shared/utils';
import {
  DeliveryMethods,
  IPricingItem,
  IPricingRules,
  IPricingTotals,
  IPromotion,
  PricingErrors,
  PromotionKinds,
} from '@/modules/pricing/types';

const PERCENT_BASE = 100;

const round = (value: number): number => Math.round(value * PERCENT_BASE) / PERCENT_BASE;

export const buildRules = (config: {
  locale: Record<string, unknown>;
  delivery: Record<string, unknown>;
  orderRules: Record<string, unknown>;
}): IPricingRules => ({
  currency: typeof config.locale.currency === 'string' ? config.locale.currency : 'RUB',
  deliveryBasePrice: Number(config.delivery.basePrice ?? 0),
  deliveryFreeFrom: config.delivery.freeFrom === null || config.delivery.freeFrom === undefined
    ? null
    : Number(config.delivery.freeFrom),
  minOrderTotal: Number(config.orderRules.minOrderTotal ?? 0),
  maxItemsPerOrder: Number(config.orderRules.maxItemsPerOrder ?? 100),
});

const applyPromotion = (
  promotion: IPromotion,
  itemsTotal: number,
  deliveryTotal: number,
): { discount: number; delivery: number } => {
  const minTotal = Number(promotion.conditions.minTotal ?? 0);

  if (itemsTotal < minTotal) {
    return { discount: 0, delivery: deliveryTotal };
  }

  if (promotion.kind === PromotionKinds.cartPercent) {
    const percent = Number(promotion.actions.percent ?? 0);

    return { discount: round((itemsTotal * percent) / PERCENT_BASE), delivery: deliveryTotal };
  }

  if (promotion.kind === PromotionKinds.cartFixed) {
    return { discount: Math.min(Number(promotion.actions.amount ?? 0), itemsTotal), delivery: deliveryTotal };
  }

  if (promotion.kind === PromotionKinds.freeDelivery) {
    return { discount: 0, delivery: 0 };
  }

  return { discount: 0, delivery: deliveryTotal };
};

export const calculateTotals = (
  items: IPricingItem[],
  rules: IPricingRules,
  deliveryMethod: string,
  promotion: IPromotion | null,
): IPricingTotals => {
  const itemsTotal = round(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const baseDelivery = deliveryMethod === DeliveryMethods.pickup ? 0 : rules.deliveryBasePrice;
  const freeByThreshold = rules.deliveryFreeFrom !== null && itemsTotal >= rules.deliveryFreeFrom;
  const deliveryBeforePromo = freeByThreshold ? 0 : baseDelivery;
  const applied = promotion
    ? applyPromotion(promotion, itemsTotal, deliveryBeforePromo)
    : { discount: 0, delivery: deliveryBeforePromo };

  const payableItems = round(itemsTotal - applied.discount);
  const taxTotal = round(items.reduce((sum, item) => {
    const share = itemsTotal > 0 ? (item.price * item.quantity) / itemsTotal : 0;
    const taxable = payableItems * share;

    return sum + (taxable * item.taxRate) / (PERCENT_BASE + item.taxRate);
  }, 0));

  return {
    itemsTotal,
    discountTotal: round(applied.discount),
    deliveryTotal: round(applied.delivery),
    taxTotal,
    grandTotal: round(payableItems + applied.delivery),
    currency: rules.currency,
  };
};

export const assertOrderAllowed = (
  items: IPricingItem[],
  totals: IPricingTotals,
  rules: IPricingRules,
): void => {
  if (items.length === 0) {
    throw new AppError(PricingErrors.emptyCart, HttpStatus.badRequest);
  }

  if (items.length > rules.maxItemsPerOrder) {
    throw new AppError(PricingErrors.tooManyItems, HttpStatus.badRequest);
  }

  if (totals.itemsTotal < rules.minOrderTotal) {
    throw new AppError(
      `${PricingErrors.minOrder}: ${rules.minOrderTotal} ${totals.currency}`,
      HttpStatus.badRequest,
    );
  }

  const missing = items.find((item) => item.quantity > item.stock);

  if (missing) {
    throw new AppError(`${PricingErrors.outOfStock}: ${missing.productName}`, HttpStatus.conflict);
  }
};

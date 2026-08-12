import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DeliveryMethods,
  IPricingItem,
  IPricingRules,
  IPromotion,
  PromotionKinds,
  assertOrderAllowed,
  buildRules,
  calculateTotals,
} from '@/modules/pricing';
import { AppError } from '@/shared/utils';

const RULES: IPricingRules = {
  currency: 'TJS',
  deliveryBasePrice: 30,
  deliveryFreeFrom: 500,
  minOrderTotal: 50,
  maxItemsPerOrder: 3,
};

const buildItem = (patch: Partial<IPricingItem> = {}): IPricingItem => ({
  variantId: 'v1',
  productName: 'Товар',
  sku: 'SKU-1',
  options: {},
  quantity: 1,
  price: 100,
  taxRate: 0,
  stock: 10,
  media: null,
  ...patch,
});

const buildPromotion = (patch: Partial<IPromotion> = {}): IPromotion => ({
  id: 'p1',
  code: 'SALE',
  kind: PromotionKinds.cartPercent,
  conditions: {},
  actions: {},
  priority: 1,
  ...patch,
});

describe('сумма корзины', () => {
  it('складывает позиции с учётом количества', () => {
    const totals = calculateTotals(
      [buildItem({ price: 150, quantity: 2 }), buildItem({ variantId: 'v2', price: 99, quantity: 3 })],
      RULES,
      DeliveryMethods.pickup,
      null,
    );

    assert.equal(totals.itemsTotal, 597);
    assert.equal(totals.grandTotal, 597);
  });

  it('самовывоз не стоит ничего, доставка добавляет базовую цену', () => {
    const items = [buildItem({ price: 100 })];

    assert.equal(calculateTotals(items, RULES, DeliveryMethods.pickup, null).deliveryTotal, 0);
    assert.equal(calculateTotals(items, RULES, DeliveryMethods.courier, null).deliveryTotal, 30);
  });

  it('доставка бесплатна от порога', () => {
    const totals = calculateTotals(
      [buildItem({ price: 500 })],
      RULES,
      DeliveryMethods.courier,
      null,
    );

    assert.equal(totals.deliveryTotal, 0);
    assert.equal(totals.grandTotal, 500);
  });

  it('без порога доставка платная на любой сумме', () => {
    const totals = calculateTotals(
      [buildItem({ price: 5000 })],
      { ...RULES, deliveryFreeFrom: null },
      DeliveryMethods.courier,
      null,
    );

    assert.equal(totals.deliveryTotal, 30);
  });
});

describe('промокоды', () => {
  it('процентная скидка уменьшает сумму', () => {
    const totals = calculateTotals(
      [buildItem({ price: 200 })],
      RULES,
      DeliveryMethods.pickup,
      buildPromotion({ actions: { percent: 25 } }),
    );

    assert.equal(totals.discountTotal, 50);
    assert.equal(totals.grandTotal, 150);
  });

  it('фиксированная скидка не уводит сумму в минус', () => {
    const totals = calculateTotals(
      [buildItem({ price: 80 })],
      RULES,
      DeliveryMethods.pickup,
      buildPromotion({ kind: PromotionKinds.cartFixed, actions: { amount: 500 } }),
    );

    assert.equal(totals.discountTotal, 80);
    assert.equal(totals.grandTotal, 0);
  });

  it('бесплатная доставка обнуляет доставку, а не товары', () => {
    const totals = calculateTotals(
      [buildItem({ price: 100 })],
      RULES,
      DeliveryMethods.courier,
      buildPromotion({ kind: PromotionKinds.freeDelivery }),
    );

    assert.equal(totals.deliveryTotal, 0);
    assert.equal(totals.discountTotal, 0);
    assert.equal(totals.grandTotal, 100);
  });

  it('не применяется, если сумма меньше условия', () => {
    const totals = calculateTotals(
      [buildItem({ price: 100 })],
      RULES,
      DeliveryMethods.pickup,
      buildPromotion({ conditions: { minTotal: 300 }, actions: { percent: 50 } }),
    );

    assert.equal(totals.discountTotal, 0);
    assert.equal(totals.grandTotal, 100);
  });

  it('налог считается от суммы после скидки', () => {
    const withoutPromo = calculateTotals(
      [buildItem({ price: 240, taxRate: 20 })],
      RULES,
      DeliveryMethods.pickup,
      null,
    );
    const withPromo = calculateTotals(
      [buildItem({ price: 240, taxRate: 20 })],
      RULES,
      DeliveryMethods.pickup,
      buildPromotion({ actions: { percent: 50 } }),
    );

    assert.equal(withoutPromo.taxTotal, 40);
    assert.equal(withPromo.taxTotal, 20);
  });
});

describe('проверка перед оформлением', () => {
  const totalsFor = (items: IPricingItem[]) => (
    calculateTotals(items, RULES, DeliveryMethods.pickup, null)
  );

  it('пустую корзину не пропускает', () => {
    assert.throws(() => assertOrderAllowed([], totalsFor([]), RULES), AppError);
  });

  it('не пропускает сумму ниже минимальной', () => {
    const items = [buildItem({ price: 10 })];

    assert.throws(() => assertOrderAllowed(items, totalsFor(items), RULES), AppError);
  });

  it('ограничивает число позиций', () => {
    const items = [1, 2, 3, 4].map((index) => buildItem({ variantId: `v${index}`, price: 100 }));

    assert.throws(() => assertOrderAllowed(items, totalsFor(items), RULES), AppError);
  });

  it('не даёт заказать больше, чем есть на складе', () => {
    const items = [buildItem({ price: 100, quantity: 11, stock: 10 })];

    assert.throws(
      () => assertOrderAllowed(items, totalsFor(items), RULES),
      (error: unknown) => error instanceof AppError && error.message.includes('Товар'),
    );
  });

  it('корректный заказ проходит', () => {
    const items = [buildItem({ price: 100, quantity: 2 })];

    assert.doesNotThrow(() => assertOrderAllowed(items, totalsFor(items), RULES));
  });
});

describe('buildRules', () => {
  it('подставляет значения по умолчанию', () => {
    const rules = buildRules({ locale: {}, delivery: {}, orderRules: {} });

    assert.equal(rules.currency, 'TJS');
    assert.equal(rules.deliveryBasePrice, 0);
    assert.equal(rules.deliveryFreeFrom, null);
    assert.equal(rules.minOrderTotal, 0);
    assert.equal(rules.maxItemsPerOrder, 100);
  });

  it('читает настройки магазина', () => {
    const rules = buildRules({
      locale: { currency: 'USD' },
      delivery: { basePrice: 15, freeFrom: 200 },
      orderRules: { minOrderTotal: 100, maxItemsPerOrder: 5 },
    });

    assert.deepEqual(rules, {
      currency: 'USD',
      deliveryBasePrice: 15,
      deliveryFreeFrom: 200,
      minOrderTotal: 100,
      maxItemsPerOrder: 5,
    });
  });
});

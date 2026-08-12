import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { GuestHeader, HttpStatus, UserRoles } from '@/shared/config';
import { PromotionKinds } from '@/modules/promotion';
import {
  ITestContext,
  ITestProduct,
  SKIP_REASON,
  callApi,
  createStaffToken,
  seedProduct,
  startContext,
  stopContext,
} from './helpers';

interface IPromotion {
  id: string;
  code: string | null;
  name: string;
  kind: string;
  percent: number;
  amount: number;
  minTotal: number;
  usageCount: number;
  isActive: boolean;
}

interface IPromotionList {
  items: IPromotion[];
  total: number;
}

interface ICartState {
  totals: { itemsTotal: number; discountTotal: number; grandTotal: number };
}

const PRICE = 1000;

let context: ITestContext | null = null;
let staffToken = '';
let product: ITestProduct | null = null;

const uniqueCode = (prefix: string): string => (
  `${prefix}${Date.now() % 100000}${Math.floor(Math.random() * 100)}`
);

const create = (ctx: ITestContext, body: Record<string, unknown>) => callApi(
  ctx,
  '/promotions/create',
  { method: 'POST', token: staffToken, body: { name: 'Акция', ...body } },
);

const list = async (ctx: ITestContext, query = ''): Promise<IPromotionList> => {
  const response = await callApi(ctx, `/promotions/manage/search${query}`, { token: staffToken });

  return response.body.data as IPromotionList;
};

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  staffToken = await createStaffToken(context, UserRoles.owner);
  product = await seedProduct(context, context.tenant.id, PRICE);
});

after(async () => {
  await stopContext(context);
});

describe('управление акциями', () => {
  it('создаёт процентную скидку', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await create(context, {
      name: 'Летняя распродажа',
      kind: PromotionKinds.cartPercent,
      code: uniqueCode('SUMMER'),
      percent: 15,
    });
    const promo = response.body.data as IPromotion;

    assert.equal(response.status, HttpStatus.created);
    assert.equal(promo.percent, 15);
    assert.equal(promo.isActive, true);
    assert.equal(promo.usageCount, 0);
  });

  it('требует название', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/promotions/create', {
      method: 'POST',
      token: staffToken,
      body: { kind: PromotionKinds.cartPercent, percent: 10 },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('процент вне диапазона отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    assert.equal((await create(context, { kind: PromotionKinds.cartPercent, percent: 0 })).status,
      HttpStatus.badRequest);
    assert.equal((await create(context, { kind: PromotionKinds.cartPercent, percent: 150 })).status,
      HttpStatus.badRequest);
  });

  it('фиксированная скидка требует сумму', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await create(context, { kind: PromotionKinds.cartFixed, amount: 0 });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('код проверяется по формату и не повторяется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const code = uniqueCode('DUP');

    assert.equal(
      (await create(context, { kind: PromotionKinds.freeDelivery, code: 'a b' })).status,
      HttpStatus.badRequest,
    );

    await create(context, { kind: PromotionKinds.freeDelivery, code });

    const duplicate = await create(context, { kind: PromotionKinds.freeDelivery, code });

    assert.equal(duplicate.status, HttpStatus.conflict);
  });

  it('дата окончания раньше начала отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await create(context, {
      kind: PromotionKinds.freeDelivery,
      startsAt: '2026-05-10T00:00:00.000Z',
      endsAt: '2026-05-01T00:00:00.000Z',
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('меняет и удаляет акцию', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = (await create(context, {
      kind: PromotionKinds.cartPercent,
      percent: 10,
      name: 'До правки',
    })).body.data as IPromotion;

    const updated = await callApi(context, `/promotions/update/${created.id}`, {
      method: 'PATCH',
      token: staffToken,
      body: { name: 'После правки', kind: PromotionKinds.cartPercent, percent: 30 },
    });

    assert.equal((updated.body.data as IPromotion).name, 'После правки');
    assert.equal((updated.body.data as IPromotion).percent, 30);

    const removed = await callApi(context, `/promotions/delete/${created.id}`, {
      method: 'DELETE',
      token: staffToken,
    });

    assert.equal(removed.status, HttpStatus.ok);
    assert.ok(!(await list(context)).items.some((item) => item.id === created.id));
  });

  it('акции закрыты от покупателя и без токена', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const customerToken = await createStaffToken(context, UserRoles.customer);

    assert.equal((await callApi(context, '/promotions/manage/search')).status,
      HttpStatus.unauthorized);
    assert.equal(
      (await callApi(context, '/promotions/manage/search', { token: customerToken })).status,
      HttpStatus.forbidden,
    );
  });

  it('акции чужого магазина не видны', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const response = await callApi(context, '/promotions/manage/search', {
      token: foreignToken,
      tenantKey: context.other.key,
    });

    assert.equal((response.body.data as IPromotionList).total, 0);
  });
});

describe('созданная акция работает в корзине', () => {
  it('код из кабинета даёт скидку покупателю', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const code = uniqueCode('WORKS');

    await create(context, { kind: PromotionKinds.cartPercent, code, percent: 20 });

    const guest = { [GuestHeader]: `promo-${Date.now()}` };

    await callApi(context, '/cart/update', {
      method: 'POST',
      headers: guest,
      body: { variantId: product?.variantId, quantity: 2 },
    });

    const response = await callApi(context, '/cart/promo', {
      method: 'POST',
      headers: guest,
      body: { code },
    });
    const cart = response.body.data as ICartState;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(cart.totals.itemsTotal, PRICE * 2);
    assert.equal(cart.totals.discountTotal, PRICE * 2 * 0.2);
  });

  it('выключенная акция не применяется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const code = uniqueCode('OFF');

    await create(context, { kind: PromotionKinds.cartPercent, code, percent: 50, isActive: false });

    const guest = { [GuestHeader]: `promo-off-${Date.now()}` };

    await callApi(context, '/cart/update', {
      method: 'POST',
      headers: guest,
      body: { variantId: product?.variantId, quantity: 1 },
    });

    const response = await callApi(context, '/cart/promo', {
      method: 'POST',
      headers: guest,
      body: { code },
    });

    assert.equal(response.status, HttpStatus.notFound);
  });
});

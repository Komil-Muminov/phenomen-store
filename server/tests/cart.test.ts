import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { GuestHeader, HttpStatus } from '@/shared/config';
import {
  ITestContext,
  ITestProduct,
  SKIP_REASON,
  callApi,
  seedProduct,
  startContext,
  stopContext,
} from './helpers';

interface ICartState {
  items: { variantId: string; quantity: number }[];
  totals: { itemsTotal: number; grandTotal: number; deliveryTotal: number };
}

const PRICE = 250;
const UNKNOWN_VARIANT = '00000000-0000-0000-0000-000000000000';

let context: ITestContext | null = null;
let product: ITestProduct | null = null;

const guest = (name: string): Record<string, string> => ({
  [GuestHeader]: `${name}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
});

const setQuantity = (
  ctx: ITestContext,
  headers: Record<string, string>,
  quantity: number,
  variantId?: string,
) => callApi(ctx, '/cart/update', {
  method: 'POST',
  headers,
  body: { variantId: variantId ?? product?.variantId, quantity },
});

before(async () => {
  context = await startContext();

  if (context) {
    product = await seedProduct(context, context.tenant.id, PRICE);
  }
});

after(async () => {
  await stopContext(context);
});

describe('корзина', () => {
  it('добавляет позицию и считает сумму', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const headers = guest('add');
    const response = await setQuantity(context, headers, 3);
    const cart = response.body.data as ICartState;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(cart.items.length, 1);
    assert.equal(cart.items[0].quantity, 3);
    assert.equal(cart.totals.itemsTotal, PRICE * 3);
  });

  it('меняет количество уже добавленной позиции', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const headers = guest('change');

    await setQuantity(context, headers, 2);

    const cart = (await setQuantity(context, headers, 5)).body.data as ICartState;

    assert.equal(cart.items.length, 1);
    assert.equal(cart.items[0].quantity, 5);
    assert.equal(cart.totals.itemsTotal, PRICE * 5);
  });

  it('нулевое количество убирает позицию', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const headers = guest('remove');

    await setQuantity(context, headers, 2);

    const cart = (await setQuantity(context, headers, 0)).body.data as ICartState;

    assert.equal(cart.items.length, 0);
    assert.equal(cart.totals.itemsTotal, 0);
  });

  it('очистка убирает всё', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const headers = guest('clear');

    await setQuantity(context, headers, 4);

    const response = await callApi(context, '/cart/clear', { method: 'POST', headers, body: {} });
    const cart = response.body.data as ICartState;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(cart.items.length, 0);
  });

  it('корзины разных гостей не смешиваются', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const first = guest('one');
    const second = guest('two');

    await setQuantity(context, first, 7);

    const other = (await callApi(context, '/cart/get', { headers: second })).body.data as ICartState;
    const own = (await callApi(context, '/cart/get', { headers: first })).body.data as ICartState;

    assert.equal(other.items.length, 0);
    assert.equal(own.items[0].quantity, 7);
  });
});

describe('корзина отвергает некорректный ввод', () => {
  it('несуществующий вариант товара', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await setQuantity(context, guest('missing'), 1, UNKNOWN_VARIANT);

    assert.equal(response.status, HttpStatus.notFound);
  });

  it('отрицательное количество', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await setQuantity(context, guest('negative'), -1);

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('количество выше предела', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await setQuantity(context, guest('huge'), 1000);

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('битый идентификатор варианта', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await setQuantity(context, guest('broken'), 1, 'not-a-uuid');

    assert.equal(response.status, HttpStatus.badRequest);
  });
});

describe('промокод в корзине', () => {
  it('неизвестный код отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const headers = guest('promo');

    await setQuantity(context, headers, 1);

    const response = await callApi(context, '/cart/promo', {
      method: 'POST',
      headers,
      body: { code: 'НЕТ-ТАКОГО' },
    });

    assert.equal(response.status, HttpStatus.notFound);
  });

  it('пустой код снимает скидку без ошибки', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const headers = guest('promo-reset');

    await setQuantity(context, headers, 1);

    const response = await callApi(context, '/cart/promo', {
      method: 'POST',
      headers,
      body: { code: '' },
    });

    assert.equal(response.status, HttpStatus.ok);
  });
});

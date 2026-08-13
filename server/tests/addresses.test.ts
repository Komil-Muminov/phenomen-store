import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus } from '@/shared/config';
import {
  ITestContext,
  ITestProduct,
  SKIP_REASON,
  callApi,
  seedProduct,
  startContext,
  stopContext,
} from './helpers';

interface IAddress {
  id: string;
  city: string;
  street: string;
  line: string;
  isDefault: boolean;
}

interface IAddressList {
  items: IAddress[];
}

interface IRepeatResult {
  added: number;
  skipped: string[];
  cart: { items: { variantId: string; quantity: number }[] };
}

const PRICE = 1200;

let context: ITestContext | null = null;
let customerToken = '';
let otherToken = '';
let product: ITestProduct | null = null;

const uniqueEmail = (prefix: string): string => (
  `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1000)}@test.local`
);

const signInCustomer = async (ctx: ITestContext): Promise<string> => {
  const email = uniqueEmail('buyer');
  const issued = (await callApi(ctx, '/auth/code', { method: 'POST', body: { email } }))
    .body.data as { code: string | null };
  const session = await callApi(ctx, '/auth/verify', {
    method: 'POST',
    body: { email, code: issued.code },
  });

  return (session.body.data as { token: string }).token;
};

const createAddress = (
  ctx: ITestContext,
  token: string,
  body: Record<string, unknown> = {},
) => callApi(ctx, '/addresses/create', {
  method: 'POST',
  token,
  body: { city: 'Душанбе', street: 'Рудаки', house: '12', ...body },
});

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  await context.admin.query(
    `INSERT INTO tenant_configs (tenant_id, delivery) VALUES ($1, $2::jsonb)
     ON CONFLICT (tenant_id) DO UPDATE SET delivery = EXCLUDED.delivery`,
    [context.tenant.id, JSON.stringify({ methods: ['courier', 'pickup'] })],
  );

  customerToken = await signInCustomer(context);
  otherToken = await signInCustomer(context);
  product = await seedProduct(context, context.tenant.id, PRICE);
});

after(async () => {
  await stopContext(context);
});

describe('справочник адресов', () => {
  it('первый адрес автоматически становится основным', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const created = await createAddress(context, customerToken);
    const address = created.body.data as IAddress;

    assert.equal(created.status, HttpStatus.created);
    assert.equal(address.isDefault, true);
    assert.equal(address.line, 'Душанбе, Рудаки, д. 12');
  });

  it('город и улица обязательны', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await createAddress(context, customerToken, { street: '' });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('новый основной адрес снимает признак со старого', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await createAddress(context, customerToken, { street: 'Айни', isDefault: true });

    const list = await callApi(context, '/addresses/search', { token: customerToken });
    const items = (list.body.data as IAddressList).items;

    assert.equal(items.filter((item) => item.isDefault).length, 1);
    assert.equal(items[0].street, 'Айни');
  });

  it('чужой адрес не виден и не удаляется', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const mine = (await createAddress(context, customerToken, { street: 'Сомони' }))
      .body.data as IAddress;
    const foreign = await callApi(context, '/addresses/search', { token: otherToken });

    assert.equal((foreign.body.data as IAddressList).items.length, 0);

    const removal = await callApi(context, `/addresses/delete/${mine.id}`, {
      method: 'DELETE',
      token: otherToken,
    });

    assert.equal(removal.status, HttpStatus.notFound);
  });

  it('удаление основного адреса передаёт признак следующему', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const before = await callApi(context, '/addresses/search', { token: customerToken });
    const current = (before.body.data as IAddressList).items.find((item) => item.isDefault);

    assert.ok(current);

    const after = await callApi(context, `/addresses/delete/${current?.id}`, {
      method: 'DELETE',
      token: customerToken,
    });
    const rest = (after.body.data as IAddressList).items;

    assert.equal(rest.filter((item) => item.isDefault).length, 1);
  });
});

describe('заказ по сохранённому адресу и повтор', () => {
  it('доставка берёт адрес из справочника', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const address = (await createAddress(context, customerToken, { street: 'Фирдавси', house: '7' }))
      .body.data as IAddress;

    await callApi(context, '/cart/update', {
      method: 'POST',
      token: customerToken,
      body: { variantId: product?.variantId, quantity: 1 },
    });

    const order = await callApi(context, '/orders/create', {
      method: 'POST',
      token: customerToken,
      body: {
        customer: { name: 'Иван', phone: '+992900112233' },
        delivery: { method: 'courier', addressId: address.id },
        paymentMethod: 'cash_on_delivery',
      },
    });

    assert.equal(order.status, HttpStatus.created, String(order.body.message));
    assert.equal(
      (order.body.data as { delivery: { address: string } }).delivery.address,
      'Душанбе, Фирдавси, д. 7',
    );
  });

  it('чужой заказ не открывается и не повторяется', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const list = await callApi(context, '/orders/search', { token: customerToken });
    const orderId = (list.body.data as { items: { id: string }[] }).items[0]?.id;

    assert.ok(orderId);

    const foreign = await callApi(context, `/orders/get/${orderId}`, { token: otherToken });

    assert.equal(foreign.status, HttpStatus.notFound);

    const repeat = await callApi(context, `/orders/repeat/${orderId}`, {
      method: 'POST',
      token: otherToken,
    });

    assert.equal(repeat.status, HttpStatus.notFound);
  });

  it('повтор заказа возвращает товары в корзину', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const list = await callApi(context, '/orders/search', { token: customerToken });
    const orderId = (list.body.data as { items: { id: string }[] }).items[0]?.id;

    await callApi(context, '/cart/clear', { method: 'POST', token: customerToken });

    const repeat = await callApi(context, `/orders/repeat/${orderId}`, {
      method: 'POST',
      token: customerToken,
    });
    const result = repeat.body.data as IRepeatResult;

    assert.equal(repeat.status, HttpStatus.ok);
    assert.equal(result.added, 1);
    assert.deepEqual(result.skipped, []);
    assert.equal(result.cart.items[0].variantId, product?.variantId);
  });
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { GuestHeader, HttpStatus, UserRoles } from '@/shared/config';
import { OrderStatus } from '@/modules/order/types';
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

interface IOrderResponse {
  id: string;
  number: string;
  status: string;
  totals: { itemsTotal: number; grandTotal: number };
  items: { quantity: number; total: number }[];
}

interface IOrderListResponse {
  items: { id: string }[];
  total: number;
}

const PRICE = 1500;
const QUANTITY = 2;

let context: ITestContext | null = null;
let staffToken = '';
let product: ITestProduct | null = null;

const guestHeaders = (guest: string): Record<string, string> => ({ [GuestHeader]: guest });

const placeOrder = async (
  ctx: ITestContext,
  guest: string,
  overrides: Record<string, unknown> = {},
) => {
  await callApi(ctx, '/cart/update', {
    method: 'POST',
    headers: guestHeaders(guest),
    body: { variantId: product?.variantId, quantity: QUANTITY },
  });

  return callApi(ctx, '/orders/create', {
    method: 'POST',
    headers: guestHeaders(guest),
    body: {
      customer: { name: 'Тестовый покупатель', phone: '+992900112233' },
      delivery: { method: 'pickup' },
      paymentMethod: 'cash_on_delivery',
      ...overrides,
    },
  });
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

describe('оформление заказа', () => {
  it('считает сумму по позициям корзины', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await placeOrder(context, `guest-total-${Date.now()}`);
    const order = response.body.data as IOrderResponse;

    assert.equal(response.status, HttpStatus.created);
    assert.equal(order.status, OrderStatus.created);
    assert.equal(order.items.length, 1);
    assert.equal(order.items[0].quantity, QUANTITY);
    assert.equal(order.totals.itemsTotal, PRICE * QUANTITY);
    assert.ok(order.number.length > 0);
  });

  it('отклоняет заказ с пустой корзиной', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/orders/create', {
      method: 'POST',
      headers: guestHeaders(`guest-empty-${Date.now()}`),
      body: {
        customer: { name: 'Пустая корзина', phone: '+992900112233' },
        delivery: { method: 'pickup' },
        paymentMethod: 'cash_on_delivery',
      },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('требует имя и телефон покупателя', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await placeOrder(context, `guest-nocustomer-${Date.now()}`, { customer: {} });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('не принимает недоступный способ оплаты', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await placeOrder(context, `guest-pay-${Date.now()}`, {
      paymentMethod: 'card_online',
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('повторный запрос с тем же ключом не создаёт второй заказ', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const guest = `guest-idem-${Date.now()}`;
    const key = `idem-${Date.now()}`;

    await callApi(context, '/cart/update', {
      method: 'POST',
      headers: guestHeaders(guest),
      body: { variantId: product?.variantId, quantity: QUANTITY },
    });

    const body = {
      customer: { name: 'Повтор', phone: '+992900112233' },
      delivery: { method: 'pickup' },
      paymentMethod: 'cash_on_delivery',
    };
    const options = {
      method: 'POST',
      headers: { ...guestHeaders(guest), 'x-idempotency-key': key },
      body,
    };

    const first = await callApi(context, '/orders/create', options);
    const second = await callApi(context, '/orders/create', options);

    assert.equal((first.body.data as IOrderResponse).id, (second.body.data as IOrderResponse).id);
  });
});

describe('смена статуса заказа', () => {
  it('проводит заказ по разрешённым переходам', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = await placeOrder(context, `guest-status-${Date.now()}`);
    const orderId = (created.body.data as IOrderResponse).id;

    for (const status of [OrderStatus.confirmed, OrderStatus.assembling, OrderStatus.shipped]) {
      const response = await callApi(context, `/orders/status/${orderId}`, {
        method: 'POST',
        token: staffToken,
        body: { status },
      });

      assert.equal(response.status, HttpStatus.ok, `переход в ${status} отклонён`);
      assert.equal((response.body.data as IOrderResponse).status, status);
    }
  });

  it('запрещает переход через этап', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = await placeOrder(context, `guest-jump-${Date.now()}`);
    const orderId = (created.body.data as IOrderResponse).id;

    const response = await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: staffToken,
      body: { status: OrderStatus.delivered },
    });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('не принимает несуществующий статус', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = await placeOrder(context, `guest-bad-${Date.now()}`);
    const orderId = (created.body.data as IOrderResponse).id;

    const response = await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: staffToken,
      body: { status: 'придуманный' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('покупателю менять статус нельзя', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = await placeOrder(context, `guest-role-${Date.now()}`);
    const orderId = (created.body.data as IOrderResponse).id;
    const customerToken = await createStaffToken(context, UserRoles.customer);

    const response = await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: customerToken,
      body: { status: OrderStatus.confirmed },
    });

    assert.equal(response.status, HttpStatus.forbidden);
  });
});

describe('заказы не видны чужому магазину', () => {
  it('список кабинета отдаёт только свои заказы', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = await placeOrder(context, `guest-isolation-${Date.now()}`);
    const orderId = (created.body.data as IOrderResponse).id;

    const own = await callApi(context, '/orders/manage/search', { token: staffToken });
    const ownList = own.body.data as IOrderListResponse;

    assert.ok(ownList.items.some((item) => item.id === orderId));

    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const foreign = await callApi(context, '/orders/manage/search', {
      token: foreignToken,
      tenantKey: context.other.key,
    });
    const foreignList = foreign.body.data as IOrderListResponse;

    assert.ok(!foreignList.items.some((item) => item.id === orderId));
  });

  it('чужой сотрудник не сменит статус', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = await placeOrder(context, `guest-foreign-${Date.now()}`);
    const orderId = (created.body.data as IOrderResponse).id;
    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);

    const response = await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: foreignToken,
      tenantKey: context.other.key,
      body: { status: OrderStatus.confirmed },
    });

    assert.notEqual(response.status, HttpStatus.ok);
  });
});

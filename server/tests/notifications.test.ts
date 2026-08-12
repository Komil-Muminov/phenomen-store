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

interface INotification {
  id: string;
  kind: string;
  title: string;
  unread: boolean;
  createdAt: string;
}

interface INotificationList {
  items: INotification[];
  total: number;
  unreadCount: number;
}

let context: ITestContext | null = null;
let staffToken = '';
let product: ITestProduct | null = null;

const uniqueEmail = (prefix: string): string => (
  `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1000)}@test.local`
);

const signIn = async (ctx: ITestContext, email: string, tenantKey?: string): Promise<string> => {
  const issued = (await callApi(ctx, '/auth/code', { method: 'POST', tenantKey, body: { email } }))
    .body.data as { code: string | null };
  const session = await callApi(ctx, '/auth/verify', {
    method: 'POST',
    tenantKey,
    body: { email, code: issued.code },
  });

  return (session.body.data as { token: string }).token;
};

const listFor = async (
  ctx: ITestContext,
  token: string,
  query = '',
): Promise<INotificationList> => {
  const response = await callApi(ctx, `/notifications/search${query}`, { token });

  return response.body.data as INotificationList;
};

const placeOrder = async (ctx: ITestContext, token: string): Promise<string> => {
  const guest = { [GuestHeader]: `notify-${Date.now()}-${Math.floor(Math.random() * 1000)}` };

  await callApi(ctx, '/cart/update', {
    method: 'POST',
    token,
    headers: guest,
    body: { variantId: product?.variantId, quantity: 1 },
  });

  const created = await callApi(ctx, '/orders/create', {
    method: 'POST',
    token,
    headers: guest,
    body: {
      customer: { name: 'Иван', lastName: 'Петров', phone: '+992900112233' },
      delivery: { method: 'pickup' },
      paymentMethod: 'cash_on_delivery',
    },
  });

  return (created.body.data as { id: string }).id;
};

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  staffToken = await createStaffToken(context, UserRoles.owner);
  product = await seedProduct(context, context.tenant.id);
});

after(async () => {
  await stopContext(context);
});

describe('уведомления живут в базе', () => {
  it('у нового покупателя список пуст', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signIn(context, uniqueEmail('empty'));
    const list = await listFor(context, token);

    assert.equal(list.total, 0);
    assert.equal(list.unreadCount, 0);
    assert.deepEqual(list.items, []);
  });

  it('без токена список закрыт', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/notifications/search');

    assert.equal(response.status, HttpStatus.unauthorized);
  });

  it('смена статуса заказа создаёт уведомление покупателю', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signIn(context, uniqueEmail('order'));
    const orderId = await placeOrder(context, token);

    await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: staffToken,
      body: { status: OrderStatus.confirmed },
    });

    const list = await listFor(context, token);

    assert.equal(list.total, 1);
    assert.equal(list.unreadCount, 1);
    assert.equal(list.items[0].kind, 'order');
    assert.equal(list.items[0].unread, true);
    assert.ok(list.items[0].title.includes('статус обновлён'));
  });

  it('уведомление переживает перезапуск, потому что лежит в базе', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('persist');
    const token = await signIn(context, email);
    const orderId = await placeOrder(context, token);

    await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: staffToken,
      body: { status: OrderStatus.confirmed },
    });

    const freshToken = await signIn(context, email);
    const list = await listFor(context, freshToken);

    assert.equal(list.total, 1);
  });

  it('чужие уведомления не видны', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const owner = await signIn(context, uniqueEmail('owner'));
    const stranger = await signIn(context, uniqueEmail('stranger'));
    const orderId = await placeOrder(context, owner);

    await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: staffToken,
      body: { status: OrderStatus.confirmed },
    });

    assert.equal((await listFor(context, stranger)).total, 0);
  });

  it('покупатель другого магазина ничего не видит', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signIn(context, uniqueEmail('own-shop'));
    const orderId = await placeOrder(context, token);

    await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: staffToken,
      body: { status: OrderStatus.confirmed },
    });

    const otherToken = await signIn(context, uniqueEmail('other-shop'), context.other.key);
    const response = await callApi(context, '/notifications/search', {
      token: otherToken,
      tenantKey: context.other.key,
    });

    assert.equal((response.body.data as INotificationList).total, 0);
  });
});

describe('работа со списком уведомлений', () => {
  const prepare = async (ctx: ITestContext) => {
    const token = await signIn(ctx, uniqueEmail('actions'));
    const orderId = await placeOrder(ctx, token);

    for (const status of [OrderStatus.confirmed, OrderStatus.assembling]) {
      await callApi(ctx, `/orders/status/${orderId}`, {
        method: 'POST',
        token: staffToken,
        body: { status },
      });
    }

    return token;
  };

  it('отметка о прочтении уменьшает счётчик', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await prepare(context);
    const before = await listFor(context, token);

    assert.equal(before.unreadCount, 2);

    await callApi(context, `/notifications/read/${before.items[0].id}`, {
      method: 'PATCH',
      token,
    });

    const after = await listFor(context, token);

    assert.equal(after.unreadCount, 1);
    assert.equal(after.total, 2);
  });

  it('прочитать всё обнуляет счётчик', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await prepare(context);

    await callApi(context, '/notifications/read-all', { method: 'PATCH', token });

    assert.equal((await listFor(context, token)).unreadCount, 0);
  });

  it('удаление убирает одно уведомление', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await prepare(context);
    const before = await listFor(context, token);

    await callApi(context, `/notifications/delete/${before.items[0].id}`, {
      method: 'DELETE',
      token,
    });

    assert.equal((await listFor(context, token)).total, 1);
  });

  it('чужое уведомление удалить нельзя', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await prepare(context);
    const stranger = await signIn(context, uniqueEmail('thief'));
    const target = (await listFor(context, token)).items[0].id;

    const response = await callApi(context, `/notifications/delete/${target}`, {
      method: 'DELETE',
      token: stranger,
    });

    assert.equal(response.status, HttpStatus.notFound);
    assert.equal((await listFor(context, token)).total, 2);
  });

  it('очистка убирает всё', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await prepare(context);

    await callApi(context, '/notifications/clear-all', { method: 'DELETE', token });

    assert.equal((await listFor(context, token)).total, 0);
  });

  it('фильтр по виду отбирает нужные', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await prepare(context);

    assert.equal((await listFor(context, token, '?kind=order')).total, 2);
    assert.equal((await listFor(context, token, '?kind=promo')).total, 0);
  });
});

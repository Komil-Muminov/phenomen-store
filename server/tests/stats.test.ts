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

interface IOverview {
  period: string;
  days: number;
  totals: {
    orders: number;
    revenue: number;
    average: number;
    customers: number;
    cancelled: number;
  };
  statuses: { status: string; total: number }[];
  trend: { day: string; orders: number; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStock: { name: string; sku: string; stock: number }[];
  catalog: { products: number; activeProducts: number; categories: number; outOfStock: number };
}

const PRICE = 1000;
const QUANTITY = 2;

let context: ITestContext | null = null;
let staffToken = '';
let product: ITestProduct | null = null;

const overview = async (ctx: ITestContext, query = ''): Promise<IOverview> => {
  const response = await callApi(ctx, `/stats/overview${query}`, { token: staffToken });

  return response.body.data as IOverview;
};

const placeOrder = async (ctx: ITestContext): Promise<string> => {
  const guest = { [GuestHeader]: `stats-${Date.now()}-${Math.floor(Math.random() * 10000)}` };

  await callApi(ctx, '/cart/update', {
    method: 'POST',
    headers: guest,
    body: { variantId: product?.variantId, quantity: QUANTITY },
  });

  const created = await callApi(ctx, '/orders/create', {
    method: 'POST',
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
  product = await seedProduct(context, context.tenant.id, PRICE);
});

after(async () => {
  await stopContext(context);
});

describe('сводка кабинета', () => {
  it('у нового магазина всё по нулям', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const data = await overview(context);

    assert.equal(data.totals.orders, 0);
    assert.equal(data.totals.revenue, 0);
    assert.deepEqual(data.topProducts, []);
    assert.equal(data.catalog.products, 1);
    assert.equal(data.catalog.activeProducts, 1);
  });

  it('считает выручку, число заказов и средний чек', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    await placeOrder(context);
    await placeOrder(context);

    const data = await overview(context);

    assert.equal(data.totals.orders, 2);
    assert.equal(data.totals.revenue, PRICE * QUANTITY * 2);
    assert.equal(data.totals.average, PRICE * QUANTITY);
  });

  it('отменённый заказ не попадает в выручку', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const before = await overview(context);
    const orderId = await placeOrder(context);

    await callApi(context, `/orders/status/${orderId}`, {
      method: 'POST',
      token: staffToken,
      body: { status: OrderStatus.cancelled },
    });

    const after = await overview(context);

    assert.equal(after.totals.revenue, before.totals.revenue);
    assert.equal(after.totals.orders, before.totals.orders);
    assert.equal(after.totals.cancelled, before.totals.cancelled + 1);
  });

  it('показывает, что продаётся лучше всего', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const data = await overview(context);

    assert.ok(data.topProducts.length > 0);
    assert.equal(data.topProducts[0].name, 'Тестовый товар');
    assert.ok(data.topProducts[0].revenue > 0);
  });

  it('разбивает заказы по статусам', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const data = await overview(context);
    const cancelled = data.statuses.find((row) => row.status === OrderStatus.cancelled);

    assert.ok(data.statuses.length > 0);
    assert.equal(cancelled?.total, 1);
  });

  it('собирает выручку по дням', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const data = await overview(context);

    assert.equal(data.trend.length, 1);
    assert.ok(data.trend[0].revenue > 0);
  });

  it('период меняет глубину выборки', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    assert.equal((await overview(context, '?period=week')).days, 7);
    assert.equal((await overview(context, '?period=quarter')).days, 90);
    assert.equal((await overview(context, '?period=выдумка')).days, 30);
  });

  it('подсказывает, что заканчивается на складе', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const scarce = await seedProduct(context, context.tenant.id, 500);

    await context.admin.query(
      'UPDATE product_variants SET stock = 2 WHERE tenant_id = $1 AND id = $2',
      [context.tenant.id, scarce.variantId],
    );

    const data = await overview(context);

    assert.ok(data.lowStock.some((row) => row.stock === 2));
  });

  it('сводка закрыта от покупателя и без токена', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const anonymous = await callApi(context, '/stats/overview');
    const customerToken = await createStaffToken(context, UserRoles.customer);
    const customer = await callApi(context, '/stats/overview', { token: customerToken });

    assert.equal(anonymous.status, HttpStatus.unauthorized);
    assert.equal(customer.status, HttpStatus.forbidden);
  });

  it('сводка чужого магазина пуста', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const response = await callApi(context, '/stats/overview', {
      token: foreignToken,
      tenantKey: context.other.key,
    });
    const data = response.body.data as IOverview;

    assert.equal(data.totals.orders, 0);
    assert.equal(data.catalog.products, 0);
  });
});

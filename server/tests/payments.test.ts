import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import { DeliveryStatus } from '@/modules/order';
import { PaymentStates } from '@/modules/payment';
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

interface IPayment {
  status: string;
  receiptUrl: string | null;
  receiptNote: string | null;
  reviewNote: string | null;
  reviewedBy: string | null;
}

interface IOrderDetail {
  id: string;
  paymentStatus: string;
  deliveryStatus: string;
  delivery: Record<string, string | null>;
  payment: IPayment | null;
  history: { status: string }[];
}

const RECEIPT = '/uploads/demo/receipt.png';

let context: ITestContext | null = null;
let staffToken = '';
let customerToken = '';
let otherToken = '';
let product: ITestProduct | null = null;
let transferOrderId = '';
let cashOrderId = '';

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

const placeOrder = async (ctx: ITestContext, paymentMethod: string): Promise<string> => {
  await callApi(ctx, '/cart/update', {
    method: 'POST',
    token: customerToken,
    body: { variantId: product?.variantId, quantity: 1 },
  });

  const order = await callApi(ctx, '/orders/create', {
    method: 'POST',
    token: customerToken,
    body: {
      customer: { name: 'Иван', lastName: 'Петров', phone: '+992900112233' },
      delivery: { method: 'pickup' },
      paymentMethod,
    },
  });

  return (order.body.data as { id: string }).id;
};

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  await context.admin.query(
    `INSERT INTO tenant_configs (tenant_id, payment) VALUES ($1, $2::jsonb)
     ON CONFLICT (tenant_id) DO UPDATE SET payment = EXCLUDED.payment`,
    [
      context.tenant.id,
      JSON.stringify({
        methods: ['card_transfer', 'cash_on_delivery'],
        card: { number: '5555 4444 3333 2222', holder: 'IVAN PETROV', bank: 'Алиф' },
      }),
    ],
  );

  staffToken = await createStaffToken(context, UserRoles.owner);
  customerToken = await signInCustomer(context);
  otherToken = await signInCustomer(context);
  product = await seedProduct(context, context.tenant.id, 800);
  transferOrderId = await placeOrder(context, 'card_transfer');
  cashOrderId = await placeOrder(context, 'cash_on_delivery');
});

after(async () => {
  await stopContext(context);
});

describe('оплата переводом на карту', () => {
  it('реквизиты магазина отдаются покупателю', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/payments/card');
    const card = (response.body.data as { card: { number: string } }).card;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(card.number, '5555 4444 3333 2222');
  });

  it('чек без картинки не принимается', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/payments/receipt/${transferOrderId}`, {
      method: 'POST',
      token: customerToken,
      body: { note: 'перевёл' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('к заказу с оплатой при получении чек не прикрепить', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/payments/receipt/${cashOrderId}`, {
      method: 'POST',
      token: customerToken,
      body: { imageUrl: RECEIPT },
    });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('чужой заказ оплатить нельзя', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/payments/receipt/${transferOrderId}`, {
      method: 'POST',
      token: otherToken,
      body: { imageUrl: RECEIPT },
    });

    assert.equal(response.status, HttpStatus.notFound);
  });

  it('прикреплённый чек переводит оплату в проверку', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/payments/receipt/${transferOrderId}`, {
      method: 'POST',
      token: customerToken,
      body: { imageUrl: RECEIPT, note: 'Перевёл с карты Алиф' },
    });
    const payment = response.body.data as IPayment;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(payment.status, PaymentStates.review);
    assert.equal(payment.receiptUrl, RECEIPT);

    const order = await callApi(context, `/orders/get/${transferOrderId}`, { token: customerToken });

    assert.equal((order.body.data as IOrderDetail).paymentStatus, PaymentStates.review);
  });

  it('магазин отклоняет оплату с причиной, покупатель её видит', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const rejected = await callApi(context, `/payments/review/${transferOrderId}`, {
      method: 'PATCH',
      token: staffToken,
      body: { accepted: false, note: 'Сумма не сошлась' },
    });

    assert.equal(rejected.status, HttpStatus.ok);
    assert.equal((rejected.body.data as IPayment).status, PaymentStates.failed);

    const order = await callApi(context, `/orders/get/${transferOrderId}`, { token: customerToken });

    assert.equal((order.body.data as IOrderDetail).payment?.reviewNote, 'Сумма не сошлась');
  });

  it('после отказа покупатель отправляет чек заново, магазин подтверждает', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await callApi(context, `/payments/receipt/${transferOrderId}`, {
      method: 'POST',
      token: customerToken,
      body: { imageUrl: RECEIPT },
    });

    const accepted = await callApi(context, `/payments/review/${transferOrderId}`, {
      method: 'PATCH',
      token: staffToken,
      body: { accepted: true },
    });

    assert.equal((accepted.body.data as IPayment).status, PaymentStates.paid);

    const notifications = await callApi(context, '/notifications/search', { token: customerToken });
    const titles = (notifications.body.data as { items: { title: string }[] }).items
      .map((item) => item.title);

    assert.ok(titles.includes('Оплата подтверждена'));
  });

  it('подтверждённую оплату повторно не переоформить', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/payments/receipt/${transferOrderId}`, {
      method: 'POST',
      token: customerToken,
      body: { imageUrl: RECEIPT },
    });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('без чека магазину нечего проверять', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/payments/review/${cashOrderId}`, {
      method: 'PATCH',
      token: staffToken,
      body: { accepted: true },
    });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('покупателю проверка чужих чеков закрыта', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/payments/review/${transferOrderId}`, {
      method: 'PATCH',
      token: customerToken,
      body: { accepted: true },
    });

    assert.equal(response.status, HttpStatus.forbidden);
  });
});

describe('отслеживание доставки', () => {
  it('магазин ставит статус и данные курьера', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/orders/delivery/${transferOrderId}`, {
      method: 'PATCH',
      token: staffToken,
      body: {
        status: DeliveryStatus.inTransit,
        courierName: 'Азиз',
        courierPhone: '+992900000000',
        trackingNumber: 'TJ-1001',
        eta: 'сегодня до 18:00',
      },
    });
    const order = response.body.data as IOrderDetail;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(order.deliveryStatus, DeliveryStatus.inTransit);
    assert.equal(order.delivery.courierName, 'Азиз');
    assert.equal(order.delivery.trackingNumber, 'TJ-1001');
  });

  it('покупатель видит трек и историю доставки', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/orders/get/${transferOrderId}`, {
      token: customerToken,
    });
    const order = response.body.data as IOrderDetail;

    assert.equal(order.delivery.courierPhone, '+992900000000');
    assert.ok(order.history.some((entry) => entry.status === `delivery:${DeliveryStatus.inTransit}`));
  });

  it('неизвестный статус доставки отклоняется', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/orders/delivery/${transferOrderId}`, {
      method: 'PATCH',
      token: staffToken,
      body: { status: 'teleported' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('покупатель не может менять доставку', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/orders/delivery/${transferOrderId}`, {
      method: 'PATCH',
      token: customerToken,
      body: { status: DeliveryStatus.delivered },
    });

    assert.equal(response.status, HttpStatus.forbidden);
  });
});

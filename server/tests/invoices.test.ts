import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import { InvoiceStatus } from '@/modules/invoice';
import { PlanCodes } from '@/modules/plans';
import {
  ITestContext,
  SKIP_REASON,
  callApi,
  createStaffToken,
  startContext,
  stopContext,
} from './helpers';

interface IInvoice {
  id: string;
  number: string;
  plan: string;
  period: string;
  amount: number;
  status: string;
  receiptUrl: string | null;
  reviewNote: string | null;
  tenantId: string;
}

interface IInvoiceList {
  items: IInvoice[];
  total: number;
}

const RECEIPT = '/uploads/demo/invoice.png';

let context: ITestContext | null = null;
let platformToken = '';
let ownerToken = '';
let foreignToken = '';
let managerToken = '';
let invoiceId = '';

const issueInvoice = (
  ctx: ITestContext,
  body: Record<string, unknown> = {},
) => callApi(ctx, '/platform/invoices/create', {
  method: 'POST',
  token: platformToken,
  body: {
    tenantId: ctx.tenant.id,
    plan: PlanCodes.pro,
    period: 'сентябрь 2026',
    amount: 490,
    ...body,
  },
});

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  ownerToken = await createStaffToken(context, UserRoles.owner);
  managerToken = await createStaffToken(context, UserRoles.manager);
  foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);

  const signin = await callApi(context, '/platform/auth/signin', {
    method: 'POST',
    body: { login: 'km', password: '123' },
  });

  platformToken = (signin.body.data as { token?: string })?.token ?? '';
});

after(async () => {
  await stopContext(context);
});

describe('счета за тариф', () => {
  it('платформа сохраняет свои реквизиты и отдаёт их магазину', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const saved = await callApi(context, '/platform/invoices/settings', {
      method: 'PATCH',
      token: platformToken,
      body: { card: { number: '1111 2222 3333 4444', holder: 'PHENOMEN', bank: 'Алиф' } },
    });

    assert.equal(saved.status, HttpStatus.ok);

    const shopView = await callApi(context, '/invoices/card', { token: ownerToken });
    const card = (shopView.body.data as { card: { number: string } }).card;

    assert.equal(card.number, '1111 2222 3333 4444');
  });

  it('счёт без периода не выставляется', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await issueInvoice(context, { period: '' });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('платформа выставляет счёт, магазин видит его у себя', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const created = await issueInvoice(context);
    const invoice = created.body.data as IInvoice;

    invoiceId = invoice.id;

    assert.equal(created.status, HttpStatus.created);
    assert.equal(invoice.status, InvoiceStatus.pending);
    assert.equal(invoice.amount, 490);

    const list = await callApi(context, '/invoices/search', { token: ownerToken });

    assert.ok((list.body.data as IInvoiceList).items.some((item) => item.id === invoiceId));
  });

  it('чужой магазин счёт не видит', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const list = await callApi(context, '/invoices/search', {
      token: foreignToken,
      tenantKey: context.other.key,
    });

    assert.equal((list.body.data as IInvoiceList).items.some((item) => item.id === invoiceId), false);

    const receipt = await callApi(context, `/invoices/receipt/${invoiceId}`, {
      method: 'POST',
      token: foreignToken,
      tenantKey: context.other.key,
      body: { imageUrl: RECEIPT },
    });

    assert.equal(receipt.status, HttpStatus.notFound);
  });

  it('менеджеру магазина счета недоступны', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/invoices/search', { token: managerToken });

    assert.equal(response.status, HttpStatus.forbidden);
  });

  it('без чека платформе нечего проверять', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/platform/invoices/review/${invoiceId}`, {
      method: 'PATCH',
      token: platformToken,
      body: { accepted: true },
    });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('магазин прикрепляет чек, счёт уходит на проверку', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/invoices/receipt/${invoiceId}`, {
      method: 'POST',
      token: ownerToken,
      body: { imageUrl: RECEIPT, note: 'Перевёл 490' },
    });
    const invoice = response.body.data as IInvoice;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(invoice.status, InvoiceStatus.review);
    assert.equal(invoice.receiptUrl, RECEIPT);
  });

  it('отказ платформы виден магазину, тариф не меняется', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const rejected = await callApi(context, `/platform/invoices/review/${invoiceId}`, {
      method: 'PATCH',
      token: platformToken,
      body: { accepted: false, note: 'Пришло 400 вместо 490' },
    });

    assert.equal((rejected.body.data as IInvoice).status, InvoiceStatus.failed);
    assert.equal((rejected.body.data as IInvoice).reviewNote, 'Пришло 400 вместо 490');

    const plan = await callApi(context, '/plans/current', { token: ownerToken });

    assert.equal((plan.body.data as { plan: { code: string } }).plan.code, PlanCodes.start);
  });

  it('подтверждение оплаты переводит магазин на оплаченный тариф', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await callApi(context, `/invoices/receipt/${invoiceId}`, {
      method: 'POST',
      token: ownerToken,
      body: { imageUrl: RECEIPT },
    });

    const accepted = await callApi(context, `/platform/invoices/review/${invoiceId}`, {
      method: 'PATCH',
      token: platformToken,
      body: { accepted: true },
    });

    assert.equal((accepted.body.data as IInvoice).status, InvoiceStatus.paid);

    const plan = await callApi(context, '/plans/current', { token: ownerToken });

    assert.equal((plan.body.data as { plan: { code: string } }).plan.code, PlanCodes.pro);
  });

  it('оплаченный счёт заново не оплатить', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/invoices/receipt/${invoiceId}`, {
      method: 'POST',
      token: ownerToken,
      body: { imageUrl: RECEIPT },
    });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('владелец магазина получает уведомление о счёте и об оплате', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const list = await callApi(context, '/notifications/search', { token: ownerToken });
    const titles = (list.body.data as { items: { title: string }[] }).items
      .map((item) => item.title);

    assert.ok(titles.includes('Счёт за тариф'));
    assert.ok(titles.includes('Оплата тарифа подтверждена'));
  });

  it('неоплаченный счёт можно отменить, оплаченный — нет', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const fresh = (await issueInvoice(context, { period: 'октябрь 2026' })).body.data as IInvoice;
    const cancelled = await callApi(context, `/platform/invoices/cancel/${fresh.id}`, {
      method: 'PATCH',
      token: platformToken,
    });

    assert.equal((cancelled.body.data as IInvoice).status, InvoiceStatus.cancelled);

    const blocked = await callApi(context, `/platform/invoices/cancel/${invoiceId}`, {
      method: 'PATCH',
      token: platformToken,
    });

    assert.equal(blocked.status, HttpStatus.conflict);
  });

  it('без токена платформы счета всех магазинов закрыты', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/platform/invoices/search');

    assert.equal(response.status, HttpStatus.unauthorized);
  });
});

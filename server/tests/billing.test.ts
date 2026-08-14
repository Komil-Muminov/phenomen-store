import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
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
  status: string;
}

interface IBlockedList {
  items: { id: string; key: string; overdueCount: number; overdueAmount: number }[];
}

interface IRunResult {
  blocked: string[];
  unblocked: string[];
  reminded: string[];
}

const RECEIPT = '/uploads/demo/invoice.png';

let context: ITestContext | null = null;
let platformToken = '';
let ownerToken = '';
let invoiceId = '';

const runCheck = async (ctx: ITestContext): Promise<IRunResult> => {
  const response = await callApi(ctx, '/platform/billing/run', {
    method: 'POST',
    token: platformToken,
  });

  return response.body.data as IRunResult;
};

const setDue = async (ctx: ITestContext, id: string, daysAgo: number): Promise<void> => {
  await ctx.admin.query(
    `UPDATE platform_invoices SET due_date = (now() - ($2::int * INTERVAL '1 day'))::date
     WHERE id = $1`,
    [id, daysAgo],
  );
};

const issueInvoice = async (ctx: ITestContext): Promise<IInvoice> => {
  const created = await callApi(ctx, '/platform/invoices/create', {
    method: 'POST',
    token: platformToken,
    body: {
      tenantId: ctx.tenant.id,
      plan: PlanCodes.pro,
      period: 'сентябрь 2026',
      amount: 490,
    },
  });

  return created.body.data as IInvoice;
};

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  ownerToken = await createStaffToken(context, UserRoles.owner);

  const signin = await callApi(context, '/platform/auth/signin', {
    method: 'POST',
    body: { login: 'km', password: '123' },
  });

  platformToken = (signin.body.data as { token?: string })?.token ?? '';

  await callApi(context, '/platform/billing/settings', {
    method: 'PATCH',
    token: platformToken,
    body: { graceDays: 3, autoBlock: true, remindDays: 3 },
  });

  const invoice = await issueInvoice(context);

  invoiceId = invoice.id;
});

beforeEach(async () => {
  if (context) {
    await context.admin.query(
      'UPDATE tenants SET blocked_at = NULL, block_reason = NULL WHERE id = $1',
      [context.tenant.id],
    );
  }
});

after(async () => {
  if (context) {
    await callApi(context, '/platform/billing/settings', {
      method: 'PATCH',
      token: platformToken,
      body: { graceDays: 3, autoBlock: true },
    });
  }

  await stopContext(context);
});

describe('напоминание о сроке оплаты', () => {
  it('счёт с далёким сроком напоминание не вызывает', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const invoice = await issueInvoice(context);

    await setDue(context, invoice.id, -20);

    const result = await runCheck(context);

    assert.equal(result.reminded.includes(invoice.id), false);

    await callApi(context, `/platform/invoices/cancel/${invoice.id}`, {
      method: 'PATCH',
      token: platformToken,
    });
  });

  it('за три дня до срока владелец получает напоминание один раз', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const invoice = await issueInvoice(context);

    await setDue(context, invoice.id, -2);

    const first = await runCheck(context);

    assert.ok(first.reminded.includes(invoice.id));

    const list = await callApi(context, '/notifications/search', { token: ownerToken });
    const found = (list.body.data as { items: { title: string; text: string }[] }).items
      .filter((item) => item.title === 'Скоро срок оплаты тарифа');

    assert.equal(found.length, 1);
    assert.match(found[0].text, new RegExp(invoice.number));

    const second = await runCheck(context);

    assert.equal(second.reminded.includes(invoice.id), false);

    await callApi(context, `/platform/invoices/cancel/${invoice.id}`, {
      method: 'PATCH',
      token: platformToken,
    });
  });

  it('срок напоминания настраивается', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const saved = await callApi(context, '/platform/billing/settings', {
      method: 'PATCH',
      token: platformToken,
      body: { graceDays: 3, autoBlock: true, remindDays: 7 },
    });

    assert.equal((saved.body.data as { remindDays: number }).remindDays, 7);

    const invoice = await issueInvoice(context);

    await setDue(context, invoice.id, -6);

    const result = await runCheck(context);

    assert.ok(result.reminded.includes(invoice.id));

    await callApi(context, '/platform/billing/settings', {
      method: 'PATCH',
      token: platformToken,
      body: { graceDays: 3, autoBlock: true, remindDays: 3 },
    });
    await callApi(context, `/platform/invoices/cancel/${invoice.id}`, {
      method: 'PATCH',
      token: platformToken,
    });
  });
});

describe('автоблокировка за неоплату', () => {
  it('счёт в пределах отсрочки магазин не блокирует', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await setDue(context, invoiceId, 1);

    const result = await runCheck(context);

    assert.equal(result.blocked.includes(context.tenant.id), false);
  });

  it('просрочка сверх отсрочки блокирует магазин', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await setDue(context, invoiceId, 10);

    const result = await runCheck(context);

    assert.ok(result.blocked.includes(context.tenant.id));

    const blocked = await callApi(context, '/platform/billing/blocked', { token: platformToken });
    const found = (blocked.body.data as IBlockedList).items
      .find((item) => item.id === context?.tenant.id);

    assert.ok(found);
    assert.equal(found?.overdueCount, 1);
    assert.equal(found?.overdueAmount, 490);
  });

  it('заблокированный магазин не создаёт товары, но читает каталог', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await setDue(context, invoiceId, 10);
    await runCheck(context);

    const created = await callApi(context, '/products/create', {
      method: 'POST',
      token: ownerToken,
      body: { name: 'Товар после блокировки', basePrice: 100 },
    });

    assert.equal(created.status, HttpStatus.forbidden);
    assert.match(String(created.body.message), /временно не принимает/i);

    const list = await callApi(context, '/products/manage/search', { token: ownerToken });

    assert.equal(list.status, HttpStatus.ok);
  });

  it('оплата счёта остаётся доступной под блокировкой', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await setDue(context, invoiceId, 10);
    await runCheck(context);

    const invoices = await callApi(context, '/invoices/search', { token: ownerToken });

    assert.equal(invoices.status, HttpStatus.ok);

    const receipt = await callApi(context, `/invoices/receipt/${invoiceId}`, {
      method: 'POST',
      token: ownerToken,
      body: { imageUrl: RECEIPT },
    });

    assert.equal(receipt.status, HttpStatus.ok);
  });

  it('обращение в поддержку под блокировкой проходит', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await setDue(context, invoiceId, 10);
    await runCheck(context);

    const ticket = await callApi(context, '/tickets/create', {
      method: 'POST',
      token: ownerToken,
      body: { subject: 'Заблокировали магазин', text: 'Оплату отправили, проверьте' },
    });

    assert.equal(ticket.status, HttpStatus.created);
  });

  it('подтверждение оплаты снимает блокировку сразу', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    await setDue(context, invoiceId, 10);
    await runCheck(context);

    await callApi(context, `/invoices/receipt/${invoiceId}`, {
      method: 'POST',
      token: ownerToken,
      body: { imageUrl: RECEIPT },
    });
    await callApi(context, `/platform/invoices/review/${invoiceId}`, {
      method: 'PATCH',
      token: platformToken,
      body: { accepted: true },
    });

    const created = await callApi(context, '/products/create', {
      method: 'POST',
      token: ownerToken,
      body: { name: 'Товар после оплаты', basePrice: 100 },
    });

    assert.equal(created.status, HttpStatus.created);

    const blocked = await callApi(context, '/platform/billing/blocked', { token: platformToken });

    assert.equal(
      (blocked.body.data as IBlockedList).items.some((item) => item.id === context?.tenant.id),
      false,
    );
  });

  it('выключенный автоблок снимает все блокировки', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const second = await issueInvoice(context);

    await setDue(context, second.id, 10);
    await runCheck(context);

    const off = await callApi(context, '/platform/billing/settings', {
      method: 'PATCH',
      token: platformToken,
      body: { graceDays: 3, autoBlock: false, remindDays: 3 },
    });

    assert.equal((off.body.data as { autoBlock: boolean }).autoBlock, false);

    const result = await runCheck(context);

    assert.ok(result.unblocked.includes(context.tenant.id));

    await callApi(context, '/platform/billing/settings', {
      method: 'PATCH',
      token: platformToken,
      body: { graceDays: 3, autoBlock: true },
    });

    await callApi(context, `/platform/invoices/cancel/${second.id}`, {
      method: 'PATCH',
      token: platformToken,
    });
  });

  it('платформа снимает блокировку вручную', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const third = await issueInvoice(context);

    await setDue(context, third.id, 10);
    await runCheck(context);

    const released = await callApi(context, '/platform/billing/blocked', {
      method: 'PATCH',
      token: platformToken,
      body: { tenantId: context.tenant.id },
    });

    assert.equal(
      (released.body.data as IBlockedList).items.some((item) => item.id === context?.tenant.id),
      false,
    );

    await callApi(context, `/platform/invoices/cancel/${third.id}`, {
      method: 'PATCH',
      token: platformToken,
    });
  });

  it('настройки биллинга закрыты без токена платформы', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/platform/billing/settings');

    assert.equal(response.status, HttpStatus.unauthorized);
  });
});

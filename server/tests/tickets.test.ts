import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import { TicketStatus } from '@/modules/tickets';
import {
  ITestContext,
  SKIP_REASON,
  callApi,
  createStaffToken,
  startContext,
  stopContext,
} from './helpers';

interface ITicket {
  id: string;
  subject: string;
  topic: string;
  status: string;
  tenantId: string;
  tenantName: string;
  unreadForPlatform: number;
  unreadForShop: number;
  lastText: string | null;
}

interface IThread {
  ticket: ITicket;
  messages: { author: string; text: string; unread: boolean }[];
}

interface IList {
  items: ITicket[];
  total: number;
}

let context: ITestContext | null = null;
let ownerToken = '';
let foreignToken = '';
let managerToken = '';
let platformToken = '';

const createTicket = async (
  ctx: ITestContext,
  token: string,
  subject = 'Не приходит выплата',
  tenantKey?: string,
) => callApi(ctx, '/tickets/create', {
  method: 'POST',
  token,
  tenantKey,
  body: { subject, topic: 'billing', text: 'Деньги за прошлую неделю не пришли' },
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

describe('обращения магазина к платформе', () => {
  it('магазин создаёт обращение и видит его в своём списке', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const created = await createTicket(context, ownerToken);

    assert.equal(created.status, HttpStatus.created);

    const thread = created.body.data as IThread;

    assert.equal(thread.ticket.status, TicketStatus.open);
    assert.equal(thread.ticket.topic, 'billing');
    assert.equal(thread.messages.length, 1);
    assert.equal(thread.messages[0].author, 'shop');

    const list = await callApi(context, '/tickets/search', { token: ownerToken });
    const items = (list.body.data as IList).items;

    assert.ok(items.some((item) => item.id === thread.ticket.id));
  });

  it('магазин не видит обращения чужого магазина', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const created = await createTicket(context, ownerToken, 'Только для нашего магазина');
    const id = (created.body.data as IThread).ticket.id;

    const foreign = await callApi(context, `/tickets/get/${id}`, {
      token: foreignToken,
      tenantKey: context.other.key,
    });

    assert.equal(foreign.status, HttpStatus.notFound);

    const list = await callApi(context, '/tickets/search', {
      token: foreignToken,
      tenantKey: context.other.key,
    });

    assert.equal((list.body.data as IList).items.some((item) => item.id === id), false);
  });

  it('менеджеру магазина ручка обращений недоступна', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/tickets/search', { token: managerToken });

    assert.equal(response.status, HttpStatus.forbidden);
  });

  it('без токена платформы список всех обращений закрыт', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/platform/tickets/search');

    assert.equal(response.status, HttpStatus.unauthorized);
  });
});

describe('ответ платформы', () => {
  it('платформа видит обращение, отвечает и меняет статус', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const created = await createTicket(context, ownerToken, 'Вопрос по тарифу');
    const id = (created.body.data as IThread).ticket.id;

    const inbox = await callApi(context, '/platform/tickets/search', { token: platformToken });
    const found = (inbox.body.data as IList).items.find((item) => item.id === id);

    assert.ok(found);
    assert.equal(found?.tenantId, context.tenant.id);

    const answered = await callApi(context, `/platform/tickets/reply/${id}`, {
      method: 'POST',
      token: platformToken,
      body: { text: 'Проверяем, ответим в течение дня' },
    });

    assert.equal(answered.status, HttpStatus.ok);

    const thread = answered.body.data as IThread;

    assert.equal(thread.ticket.status, TicketStatus.answered);
    assert.equal(thread.messages.length, 2);
    assert.equal(thread.messages[1].author, 'platform');
  });

  it('открытие обращения магазином гасит непрочитанные ответы платформы', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const created = await createTicket(context, ownerToken, 'Непрочитанные');
    const id = (created.body.data as IThread).ticket.id;

    await callApi(context, `/platform/tickets/reply/${id}`, {
      method: 'POST',
      token: platformToken,
      body: { text: 'Ответ платформы' },
    });

    const list = await callApi(context, '/tickets/search', { token: ownerToken });
    const before = (list.body.data as IList).items.find((item) => item.id === id);

    assert.equal(before?.unreadForShop, 1);

    await callApi(context, `/tickets/get/${id}`, { token: ownerToken });

    const after = await callApi(context, '/tickets/search', { token: ownerToken });
    const updated = (after.body.data as IList).items.find((item) => item.id === id);

    assert.equal(updated?.unreadForShop, 0);
  });

  it('в закрытое обращение писать нельзя', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const created = await createTicket(context, ownerToken, 'Закрываем');
    const id = (created.body.data as IThread).ticket.id;

    const closed = await callApi(context, `/platform/tickets/close/${id}`, {
      method: 'PATCH',
      token: platformToken,
    });

    assert.equal(closed.status, HttpStatus.ok);
    assert.equal((closed.body.data as IThread).ticket.status, TicketStatus.closed);

    const reply = await callApi(context, `/tickets/reply/${id}`, {
      method: 'POST',
      token: ownerToken,
      body: { text: 'Ещё вопрос' },
    });

    assert.equal(reply.status, HttpStatus.conflict);
  });

  it('обращение без темы не создаётся', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/tickets/create', {
      method: 'POST',
      token: ownerToken,
      body: { text: 'Текст без темы' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });
});

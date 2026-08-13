import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import { ConversationStatus } from '@/modules/support';
import {
  ITestContext,
  SKIP_REASON,
  callApi,
  createStaffToken,
  startContext,
  stopContext,
} from './helpers';

interface IConversation {
  id: string;
  subject: string;
  status: string;
  customerName: string;
  unreadForShop: number;
  unreadForCustomer: number;
  lastText: string | null;
}

interface IThread {
  conversation: IConversation;
  messages: { author: string; text: string; unread: boolean }[];
}

interface IList {
  items: IConversation[];
  total: number;
}

let context: ITestContext | null = null;
let staffToken = '';

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

const startThread = async (ctx: ITestContext, token: string, subject = 'Где мой заказ?') => {
  const response = await callApi(ctx, '/support/create', {
    method: 'POST',
    token,
    body: { subject, text: 'Заказ оформлен вчера, статус не меняется' },
  });

  return response;
};

before(async () => {
  context = await startContext();

  if (context) {
    staffToken = await createStaffToken(context, UserRoles.owner);
  }
});

after(async () => {
  await stopContext(context);
});

describe('покупатель пишет магазину', () => {
  it('создаёт обращение и видит своё сообщение', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);
    const response = await startThread(context, token);
    const thread = response.body.data as IThread;

    assert.equal(response.status, HttpStatus.created);
    assert.equal(thread.conversation.subject, 'Где мой заказ?');
    assert.equal(thread.conversation.status, ConversationStatus.open);
    assert.equal(thread.messages.length, 1);
    assert.equal(thread.messages[0].author, 'customer');
  });

  it('без темы и без текста не создаётся', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);

    assert.equal((await callApi(context, '/support/create', {
      method: 'POST',
      token,
      body: { text: 'Только текст' },
    })).status, HttpStatus.badRequest);

    assert.equal((await callApi(context, '/support/create', {
      method: 'POST',
      token,
      body: { subject: 'Только тема' },
    })).status, HttpStatus.badRequest);
  });

  it('чужое обращение не открывается', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const owner = await signInCustomer(context);
    const stranger = await signInCustomer(context);
    const thread = (await startThread(context, owner)).body.data as IThread;

    const response = await callApi(context, `/support/get/${thread.conversation.id}`, {
      token: stranger,
    });

    assert.equal(response.status, HttpStatus.notFound);
    assert.equal((await callApi(context, '/support/search', { token: stranger }))
      .body.data && ((await callApi(context, '/support/search', { token: stranger }))
      .body.data as IList).total, 0);
  });

  it('обращения закрыты без токена', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    assert.equal((await callApi(context, '/support/search')).status, HttpStatus.unauthorized);
  });
});

describe('магазин отвечает покупателю', () => {
  it('видит обращение и непрочитанное', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);
    const thread = (await startThread(context, token, 'Вопрос по размеру')).body.data as IThread;

    const response = await callApi(context, '/support/manage/search?limit=50', { token: staffToken });
    const list = response.body.data as IList;
    const found = list.items.find((item) => item.id === thread.conversation.id);

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(found?.unreadForShop, 1);
    assert.ok(found?.customerName);
  });

  it('открытие обращения снимает непрочитанное', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);
    const thread = (await startThread(context, token)).body.data as IThread;

    await callApi(context, `/support/manage/get/${thread.conversation.id}`, { token: staffToken });

    const list = (await callApi(context, '/support/manage/search?limit=50', { token: staffToken }))
      .body.data as IList;
    const found = list.items.find((item) => item.id === thread.conversation.id);

    assert.equal(found?.unreadForShop, 0);
  });

  it('ответ магазина виден покупателю и создаёт уведомление', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);
    const thread = (await startThread(context, token)).body.data as IThread;

    const replied = await callApi(context, `/support/manage/reply/${thread.conversation.id}`, {
      method: 'POST',
      token: staffToken,
      body: { text: 'Заказ уже собран, завтра отправим' },
    });

    assert.equal(replied.status, HttpStatus.ok);

    const own = (await callApi(context, `/support/get/${thread.conversation.id}`, { token }))
      .body.data as IThread;

    assert.equal(own.messages.length, 2);
    assert.equal(own.messages[1].author, 'shop');
    assert.equal(own.conversation.unreadForCustomer, 1);

    const notifications = await callApi(context, '/notifications/search', { token });
    const items = (notifications.body.data as { items: { title: string }[] }).items;

    assert.ok(items.some((item) => item.title.includes('ответил')));
  });

  it('покупатель может отметить ответ прочитанным', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);
    const thread = (await startThread(context, token)).body.data as IThread;

    await callApi(context, `/support/manage/reply/${thread.conversation.id}`, {
      method: 'POST',
      token: staffToken,
      body: { text: 'Ответ' },
    });
    await callApi(context, `/support/read/${thread.conversation.id}`, { method: 'PATCH', token });

    const own = (await callApi(context, `/support/get/${thread.conversation.id}`, { token }))
      .body.data as IThread;

    assert.equal(own.conversation.unreadForCustomer, 0);
  });

  it('закрытое обращение больше не принимает сообщения', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);
    const thread = (await startThread(context, token)).body.data as IThread;

    const closed = await callApi(context, `/support/manage/close/${thread.conversation.id}`, {
      method: 'PATCH',
      token: staffToken,
    });

    assert.equal((closed.body.data as IThread).conversation.status, ConversationStatus.closed);

    const reply = await callApi(context, `/support/reply/${thread.conversation.id}`, {
      method: 'POST',
      token,
      body: { text: 'Ещё вопрос' },
    });

    assert.equal(reply.status, HttpStatus.conflict);
  });

  it('покупателю кабинет обращений закрыт', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);

    assert.equal((await callApi(context, '/support/manage/search', { token })).status,
      HttpStatus.forbidden);
  });

  it('обращения чужого магазина не видны', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signInCustomer(context);

    await startThread(context, token);

    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const response = await callApi(context, '/support/manage/search', {
      token: foreignToken,
      tenantKey: context.other.key,
    });

    assert.equal((response.body.data as IList).total, 0);
  });
});

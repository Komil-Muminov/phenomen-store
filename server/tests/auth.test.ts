import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus } from '@/shared/config';
import { OtpSettings, normalizeEmail } from '@/modules/auth';
import {
  ITestContext,
  SKIP_REASON,
  callApi,
  startContext,
  stopContext,
} from './helpers';

interface ICodeResponse {
  email: string;
  delivered: boolean;
  expiresIn: number;
  code: string | null;
}

interface ISessionResponse {
  token: string;
  user: { id: string; email: string | null };
}

let context: ITestContext | null = null;

const uniqueEmail = (prefix: string): string => (
  `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1000)}@test.local`
);

const requestCode = (ctx: ITestContext, email: string) => callApi(ctx, '/auth/code', {
  method: 'POST',
  body: { email },
});

const verifyCode = (ctx: ITestContext, email: string, code: string) => callApi(ctx, '/auth/verify', {
  method: 'POST',
  body: { email, code },
});

before(async () => {
  context = await startContext();
});

after(async () => {
  await stopContext(context);
});

describe('нормализация адреса', () => {
  it('приводит регистр и обрезает пробелы', () => {
    assert.equal(normalizeEmail('  Ivan@Shop.RU '), 'ivan@shop.ru');
  });

  it('отклоняет мусор', () => {
    assert.equal(normalizeEmail('ivan'), null);
    assert.equal(normalizeEmail('ivan@'), null);
    assert.equal(normalizeEmail('ivan@shop'), null);
    assert.equal(normalizeEmail('ivan @shop.ru'), null);
    assert.equal(normalizeEmail(undefined), null);
  });
});

describe('запрос кода на почту', () => {
  it('выдаёт код и срок жизни', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('code');
    const response = await requestCode(context, email);
    const data = response.body.data as ICodeResponse;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(data.email, email);
    assert.equal(data.expiresIn, OtpSettings.ttlSeconds);
    assert.equal(data.code?.length, OtpSettings.length);
  });

  it('без настроенного SMTP письмо не считается доставленным', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await requestCode(context, uniqueEmail('nosmtp'));

    assert.equal((response.body.data as ICodeResponse).delivered, false);
  });

  it('некорректный адрес отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await requestCode(context, 'просто-текст');

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('ограничивает число запросов подряд', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('limit');

    for (let attempt = 0; attempt < OtpSettings.maxRequestsPerWindow; attempt += 1) {
      const allowed = await requestCode(context, email);

      assert.equal(allowed.status, HttpStatus.ok);
    }

    const blocked = await requestCode(context, email);

    assert.equal(blocked.status, HttpStatus.conflict);
  });
});

describe('проверка кода', () => {
  it('создаёт профиль при первом входе', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('signup');
    const code = (await requestCode(context, email)).body.data as ICodeResponse;
    const response = await verifyCode(context, email, code.code ?? '');
    const session = response.body.data as ISessionResponse;

    assert.equal(response.status, HttpStatus.ok);
    assert.ok(session.token.length > 0);
    assert.equal(session.user.email, email);
  });

  it('второй вход попадает в тот же профиль', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('repeat');
    const first = (await requestCode(context, email)).body.data as ICodeResponse;
    const firstSession = (await verifyCode(context, email, first.code ?? '')).body
      .data as ISessionResponse;

    const second = (await requestCode(context, email)).body.data as ICodeResponse;
    const secondSession = (await verifyCode(context, email, second.code ?? '')).body
      .data as ISessionResponse;

    assert.equal(firstSession.user.id, secondSession.user.id);
  });

  it('регистр адреса не создаёт второй профиль', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('case');
    const lower = (await requestCode(context, email)).body.data as ICodeResponse;
    const lowerSession = (await verifyCode(context, email, lower.code ?? '')).body
      .data as ISessionResponse;

    const upper = (await requestCode(context, email.toUpperCase())).body.data as ICodeResponse;
    const upperSession = (await verifyCode(context, email.toUpperCase(), upper.code ?? '')).body
      .data as ISessionResponse;

    assert.equal(lowerSession.user.id, upperSession.user.id);
  });

  it('неверный код не пускает', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('wrong');

    await requestCode(context, email);

    const response = await verifyCode(context, email, '0000000');

    assert.equal(response.status, HttpStatus.unauthorized);
  });

  it('код без запроса не проходит', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await verifyCode(context, uniqueEmail('never'), '1234');

    assert.equal(response.status, HttpStatus.notFound);
  });

  it('код нельзя использовать дважды', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('twice');
    const code = (await requestCode(context, email)).body.data as ICodeResponse;

    await verifyCode(context, email, code.code ?? '');

    const second = await verifyCode(context, email, code.code ?? '');

    assert.equal(second.status, HttpStatus.notFound);
  });

  it('после лишних попыток код блокируется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('attempts');
    const issued = (await requestCode(context, email)).body.data as ICodeResponse;

    for (let attempt = 0; attempt < OtpSettings.maxAttempts; attempt += 1) {
      await verifyCode(context, email, '9999999');
    }

    const blocked = await verifyCode(context, email, issued.code ?? '');

    assert.equal(blocked.status, HttpStatus.conflict);
  });

  it('код одного магазина не подходит другому', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('tenant');
    const issued = (await requestCode(context, email)).body.data as ICodeResponse;

    const response = await callApi(context, '/auth/verify', {
      method: 'POST',
      tenantKey: context.other.key,
      body: { email, code: issued.code },
    });

    assert.equal(response.status, HttpStatus.notFound);
  });
});

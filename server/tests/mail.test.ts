import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus } from '@/shared/config';
import {
  ITestContext,
  SKIP_REASON,
  callApi,
  startContext,
  stopContext,
} from './helpers';

interface IMailStatus {
  configured: boolean;
  ready: boolean;
  reason: string | null;
  message: string;
}

let context: ITestContext | null = null;
let platformToken = '';

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  const signin = await callApi(context, '/platform/auth/signin', {
    method: 'POST',
    body: { login: 'km', password: '123' },
  });

  platformToken = (signin.body.data as { token?: string })?.token ?? '';
});

after(async () => {
  await stopContext(context);
});

describe('состояние почты', () => {
  it('без токена платформы состояние закрыто', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/platform/mail/status');

    assert.equal(response.status, HttpStatus.unauthorized);
  });

  it('ненастроенная почта честно про это говорит', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/platform/mail/status', { token: platformToken });
    const status = response.body.data as IMailStatus;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(status.configured, false);
    assert.equal(status.ready, false);
    assert.match(status.message, /не настроен/i);
  });

  it('проверочное письмо без настроенной почты не отправляется', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/platform/mail/test', {
      method: 'POST',
      token: platformToken,
      body: { email: 'check@example.com' },
    });

    assert.equal(response.status, HttpStatus.conflict);
    assert.match(String(response.body.message), /не настроена/i);
  });

  it('адрес для проверки обязателен', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/platform/mail/test', {
      method: 'POST',
      token: platformToken,
      body: { email: 'не-почта' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });
});

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

interface IProfile {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  lastName: string | null;
  profileComplete: boolean;
}

interface ICodeResponse {
  email: string;
  code: string | null;
}

let context: ITestContext | null = null;

const uniqueEmail = (prefix: string): string => (
  `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1000)}@test.local`
);

const uniquePhone = (): string => {
  const tail = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

  return `900${tail}`;
};

const signIn = async (ctx: ITestContext, email: string): Promise<string> => {
  const issued = (await callApi(ctx, '/auth/code', { method: 'POST', body: { email } }))
    .body.data as ICodeResponse;
  const session = await callApi(ctx, '/auth/verify', {
    method: 'POST',
    body: { email, code: issued.code },
  });

  return (session.body.data as { token: string }).token;
};

const saveProfile = (ctx: ITestContext, token: string, body: Record<string, unknown>) => callApi(
  ctx,
  '/auth/update',
  { method: 'PATCH', token, body },
);

const readProfile = async (ctx: ITestContext, token: string): Promise<IProfile> => {
  const response = await callApi(ctx, '/auth/profile', { token });

  return response.body.data as IProfile;
};

before(async () => {
  context = await startContext();
});

after(async () => {
  await stopContext(context);
});

describe('анкета покупателя', () => {
  it('после первого входа профиль не заполнен', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signIn(context, uniqueEmail('fresh'));
    const profile = await readProfile(context, token);

    assert.equal(profile.profileComplete, false);
    assert.equal(profile.name, null);
    assert.equal(profile.lastName, null);
    assert.equal(profile.phone, null);
  });

  it('сохраняет имя, фамилию и телефон', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signIn(context, uniqueEmail('filled'));
    const phone = uniquePhone();
    const response = await saveProfile(context, token, {
      name: 'Иван',
      lastName: 'Петров',
      phone,
    });
    const profile = response.body.data as IProfile;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(profile.name, 'Иван');
    assert.equal(profile.lastName, 'Петров');
    assert.equal(profile.phone, `+992${phone}`);
    assert.equal(profile.profileComplete, true);
  });

  it('отклоняет непохожий на номер телефон', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const token = await signIn(context, uniqueEmail('badphone'));
    const response = await saveProfile(context, token, { name: 'Иван', phone: '123' });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('не даёт занять номер другого покупателя магазина', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const phone = uniquePhone();
    const first = await signIn(context, uniqueEmail('owner'));

    await saveProfile(context, first, { name: 'Первый', lastName: 'Покупатель', phone });

    const second = await signIn(context, uniqueEmail('rival'));
    const response = await saveProfile(context, second, { name: 'Второй', phone });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('почту через обычное сохранение сменить нельзя', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('keep');
    const token = await signIn(context, email);

    await saveProfile(context, token, { name: 'Иван', email: uniqueEmail('hack') });

    const profile = await readProfile(context, token);

    assert.equal(profile.email, email);
  });

  it('анкета закрыта без токена', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/auth/update', {
      method: 'PATCH',
      body: { name: 'Никто' },
    });

    assert.equal(response.status, HttpStatus.unauthorized);
  });
});

describe('смена почты', () => {
  it('меняет адрес только после кода с нового адреса', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const oldEmail = uniqueEmail('before');
    const newEmail = uniqueEmail('after');
    const token = await signIn(context, oldEmail);

    const requested = await callApi(context, '/auth/email/code', {
      method: 'POST',
      token,
      body: { email: newEmail },
    });
    const issued = requested.body.data as ICodeResponse;

    assert.equal(requested.status, HttpStatus.ok);
    assert.equal(issued.email, newEmail);
    assert.equal((await readProfile(context, token)).email, oldEmail);

    const confirmed = await callApi(context, '/auth/email/update', {
      method: 'PATCH',
      token,
      body: { email: newEmail, code: issued.code },
    });

    assert.equal(confirmed.status, HttpStatus.ok);
    assert.equal((await readProfile(context, token)).email, newEmail);
  });

  it('без кода адрес не меняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const oldEmail = uniqueEmail('nocode');
    const token = await signIn(context, oldEmail);
    const response = await callApi(context, '/auth/email/update', {
      method: 'PATCH',
      token,
      body: { email: uniqueEmail('target'), code: '1234' },
    });

    assert.equal(response.status, HttpStatus.notFound);
    assert.equal((await readProfile(context, token)).email, oldEmail);
  });

  it('неверный код не меняет адрес', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const oldEmail = uniqueEmail('wrongcode');
    const newEmail = uniqueEmail('wrongtarget');
    const token = await signIn(context, oldEmail);

    await callApi(context, '/auth/email/code', { method: 'POST', token, body: { email: newEmail } });

    const response = await callApi(context, '/auth/email/update', {
      method: 'PATCH',
      token,
      body: { email: newEmail, code: '0000000' },
    });

    assert.equal(response.status, HttpStatus.unauthorized);
    assert.equal((await readProfile(context, token)).email, oldEmail);
  });

  it('занятый адрес отклоняется до отправки письма', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const taken = uniqueEmail('taken');

    await signIn(context, taken);

    const token = await signIn(context, uniqueEmail('mover'));
    const response = await callApi(context, '/auth/email/code', {
      method: 'POST',
      token,
      body: { email: taken },
    });

    assert.equal(response.status, HttpStatus.conflict);
  });

  it('текущий адрес менять не на что', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('same');
    const token = await signIn(context, email);
    const response = await callApi(context, '/auth/email/code', {
      method: 'POST',
      token,
      body: { email },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('после смены вход работает по новому адресу', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const oldEmail = uniqueEmail('login-old');
    const newEmail = uniqueEmail('login-new');
    const token = await signIn(context, oldEmail);
    const issued = (await callApi(context, '/auth/email/code', {
      method: 'POST',
      token,
      body: { email: newEmail },
    })).body.data as ICodeResponse;

    await callApi(context, '/auth/email/update', {
      method: 'PATCH',
      token,
      body: { email: newEmail, code: issued.code },
    });

    const profileId = (await readProfile(context, token)).id;
    const freshToken = await signIn(context, newEmail);
    const freshProfile = await readProfile(context, freshToken);

    assert.equal(freshProfile.id, profileId);
  });

  it('смена почты закрыта без токена', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/auth/email/code', {
      method: 'POST',
      body: { email: uniqueEmail('anon') },
    });

    assert.equal(response.status, HttpStatus.unauthorized);
  });
});

describe('уникальность в пределах магазина', () => {
  it('та же почта заводит отдельный профиль в другом магазине', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const email = uniqueEmail('shared');
    const ownToken = await signIn(context, email);
    const own = await readProfile(context, ownToken);

    const issued = (await callApi(context, '/auth/code', {
      method: 'POST',
      tenantKey: context.other.key,
      body: { email },
    })).body.data as ICodeResponse;
    const session = await callApi(context, '/auth/verify', {
      method: 'POST',
      tenantKey: context.other.key,
      body: { email, code: issued.code },
    });
    const other = (session.body.data as { user: IProfile }).user;

    assert.notEqual(own.id, other.id);
    assert.equal(other.email, email);
  });

  it('тот же номер не мешает покупателю другого магазина', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const phone = uniquePhone();
    const ownToken = await signIn(context, uniqueEmail('phone-own'));

    await saveProfile(context, ownToken, { name: 'Свой', lastName: 'Покупатель', phone });

    const issued = (await callApi(context, '/auth/code', {
      method: 'POST',
      tenantKey: context.other.key,
      body: { email: uniqueEmail('phone-other') },
    })).body.data as ICodeResponse;
    const session = await callApi(context, '/auth/verify', {
      method: 'POST',
      tenantKey: context.other.key,
      body: { email: issued.email, code: issued.code },
    });
    const otherToken = (session.body.data as { token: string }).token;

    const response = await callApi(context, '/auth/update', {
      method: 'PATCH',
      token: otherToken,
      tenantKey: context.other.key,
      body: { name: 'Чужой', lastName: 'Покупатель', phone },
    });

    assert.equal(response.status, HttpStatus.ok);
  });
});

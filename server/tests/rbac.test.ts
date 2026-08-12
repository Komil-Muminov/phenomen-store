import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import {
  ITestContext,
  SKIP_REASON,
  callApi,
  createStaffToken,
  startContext,
  stopContext,
} from './helpers';

let context: ITestContext | null = null;
let ownerToken = '';
let managerToken = '';
let customerToken = '';
let foreignToken = '';
let platformToken = '';

const STAFF_ENDPOINTS = [
  { method: 'POST', path: '/products/create' },
  { method: 'GET', path: '/products/manage/search' },
  { method: 'GET', path: '/products/stock/search' },
  { method: 'POST', path: '/categories/create' },
  { method: 'POST', path: '/attributes/create' },
  { method: 'POST', path: '/banners/create' },
  { method: 'GET', path: '/orders/manage/search' },
];

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  ownerToken = await createStaffToken(context, UserRoles.owner);
  managerToken = await createStaffToken(context, UserRoles.manager);
  customerToken = await createStaffToken(context, UserRoles.customer);
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

describe('доступ к ручкам кабинета', () => {
  it('без токена отвечает 401', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    for (const endpoint of STAFF_ENDPOINTS) {
      const response = await callApi(context, endpoint.path, { method: endpoint.method, body: {} });

      assert.equal(
        response.status,
        HttpStatus.unauthorized,
        `${endpoint.method} ${endpoint.path} пустил без токена`,
      );
    }
  });

  it('покупателю отвечает 403', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    for (const endpoint of STAFF_ENDPOINTS) {
      const response = await callApi(context, endpoint.path, {
        method: endpoint.method,
        token: customerToken,
        body: {},
      });

      assert.equal(
        response.status,
        HttpStatus.forbidden,
        `${endpoint.method} ${endpoint.path} пустил покупателя`,
      );
    }
  });

  it('сотрудника магазина пускает к спискам', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/products/manage/search', { token: managerToken });

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(response.body.success, true);
  });
});

describe('изоляция по магазину', () => {
  it('токен чужого магазина отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/products/manage/search', { token: foreignToken });

    assert.equal(response.status, HttpStatus.unauthorized);
  });

  it('неизвестный ключ магазина не даёт доступа', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/products/manage/search', {
      token: ownerToken,
      tenantKey: 'no-such-tenant',
    });

    assert.notEqual(response.status, HttpStatus.ok);
  });
});

describe('разделение платформы и магазина', () => {
  it('токен магазина не пускает в платформенные ручки', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/platform/tenants/search', { token: ownerToken });

    assert.equal(response.status, HttpStatus.unauthorized);
  });

  it('платформенные ручки закрыты без токена', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/platform/audit/search');

    assert.equal(response.status, HttpStatus.unauthorized);
  });
});

describe('админ магазина заводится только вместе с магазином', () => {
  it('без почты и пароля админа магазин не создаётся', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/platform/tenants/create', {
      method: 'POST',
      token: platformToken,
      body: { key: `no-owner-${Date.now()}`, name: 'Без админа' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('магазин создаётся вместе с админом, и админ сразу входит', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const key = `with-owner-${Date.now()}`;
    const login = `${key}@test.local`;
    const created = await callApi(context, '/platform/tenants/create', {
      method: 'POST',
      token: platformToken,
      body: {
        key,
        name: 'Магазин с админом',
        ownerName: 'Админ',
        ownerLogin: login,
        ownerPassword: 'secret123',
      },
    });

    assert.equal(created.status, HttpStatus.created);

    const session = await callApi(context, '/auth/login', {
      method: 'POST',
      tenantKey: key,
      body: { login, password: 'secret123' },
    });

    assert.equal(session.status, HttpStatus.ok);
  });

  it('добавить второго админа уже нельзя', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, `/platform/tenants/owner/create/${context.tenant.id}`, {
      method: 'POST',
      token: platformToken,
      body: { name: 'Второй', password: 'secret123', email: 'second@test.local' },
    });

    assert.equal(response.status, HttpStatus.notFound);
  });
});

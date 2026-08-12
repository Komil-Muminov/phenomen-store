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

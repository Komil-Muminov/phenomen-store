import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import { PlanCodes, Plans } from '@/modules/plans';
import {
  ITestContext,
  SKIP_REASON,
  callApi,
  createStaffToken,
  startContext,
  stopContext,
} from './helpers';

interface IPlanState {
  plan: { code: string; name: string; limits: Record<string, number | null> };
  usage: { resource: string; used: number; limit: number | null }[];
}

let context: ITestContext | null = null;
let ownerToken = '';

const startPlan = Plans.find((plan) => plan.code === PlanCodes.start);

const promotionLimit = startPlan?.limits.promotions ?? 0;

const createPromotion = (ctx: ITestContext, index: number) => callApi(
  ctx,
  '/promotions/create',
  {
    method: 'POST',
    token: ownerToken,
    body: { name: `Акция ${index}`, kind: 'cart_percent', percent: 10 },
  },
);

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  ownerToken = await createStaffToken(context, UserRoles.owner);
});

after(async () => {
  await stopContext(context);
});

describe('тарифы', () => {
  it('каталог тарифов доступен без авторизации', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/plans/catalog');
    const items = (response.body.data as { items: { code: string }[] }).items;

    assert.equal(response.status, HttpStatus.ok);
    assert.deepEqual(items.map((item) => item.code), Plans.map((plan) => plan.code));
  });

  it('новый магазин на тарифе «Старт» с нулевым расходом', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/plans/current', { token: ownerToken });
    const state = response.body.data as IPlanState;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(state.plan.code, PlanCodes.start);
    assert.equal(state.usage.length, 4);
    assert.ok(state.usage.every((item) => item.used === 0));
  });

  it('тариф «Максимум» не ограничивает ресурсы', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const max = Plans.find((plan) => plan.code === PlanCodes.max);

    assert.ok(max);
    assert.ok(Object.values(max?.limits ?? {}).every((limit) => limit === null));
  });

  it('превышение лимита акций даёт понятную ошибку', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    for (let index = 0; index < promotionLimit; index += 1) {
      const allowed = await createPromotion(context, index);

      assert.equal(allowed.status, HttpStatus.created);
    }

    const blocked = await createPromotion(context, promotionLimit);

    assert.equal(blocked.status, HttpStatus.conflict);
    assert.match(String(blocked.body.message), /тариф/i);
  });

  it('расход тарифа считает созданные акции', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/plans/current', { token: ownerToken });
    const state = response.body.data as IPlanState;
    const promotions = state.usage.find((item) => item.resource === 'promotions');

    assert.equal(promotions?.used, promotionLimit);
    assert.equal(promotions?.limit, promotionLimit);
  });

  it('неизвестный тариф отклоняется, а не понижает магазин молча', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const signin = await callApi(context, '/platform/auth/signin', {
      method: 'POST',
      body: { login: 'km', password: '123' },
    });
    const token = (signin.body.data as { token?: string })?.token ?? '';
    const response = await callApi(context, `/platform/tenants/update/${context.tenant.id}`, {
      method: 'PATCH',
      token,
      body: { plan: 'enterprise' },
    });

    assert.equal(response.status, HttpStatus.badRequest);

    const state = await callApi(context, '/plans/current', { token: ownerToken });

    assert.equal((state.body.data as IPlanState).plan.code, PlanCodes.start);
  });

  it('покупателю расход тарифа недоступен', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const customerToken = await createStaffToken(context, UserRoles.customer);
    const response = await callApi(context, '/plans/current', { token: customerToken });

    assert.equal(response.status, HttpStatus.forbidden);
  });
});

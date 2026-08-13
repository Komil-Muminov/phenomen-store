import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import {
  ITestContext,
  ITestProduct,
  SKIP_REASON,
  callApi,
  createStaffToken,
  seedProduct,
  startContext,
  stopContext,
} from './helpers';

interface IReview {
  id: string;
  rating: number;
  text: string;
  reply: string | null;
  replyAuthor: string | null;
  replyAt: string | null;
  productName?: string;
}

interface ISummary {
  averageRating: number;
  totalCount: number;
  reviews: IReview[];
}

interface IManagedList {
  items: IReview[];
  total: number;
}

let context: ITestContext | null = null;
let staffToken = '';
let customerToken = '';
let product: ITestProduct | null = null;
let reviewId = '';

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

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  staffToken = await createStaffToken(context, UserRoles.owner);
  customerToken = await signInCustomer(context);
  product = await seedProduct(context, context.tenant.id, 900);

  const created = await callApi(context, '/reviews/add', {
    method: 'POST',
    token: customerToken,
    body: { productId: product.productId, rating: 4, text: 'Хороший товар, но упаковка помялась' },
  });

  reviewId = (created.body.data as IReview).id;
});

after(async () => {
  await stopContext(context);
});

describe('ответ магазина на отзыв', () => {
  it('магазин видит отзыв в своём списке', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const list = await callApi(context, '/reviews/manage/search', { token: staffToken });
    const items = (list.body.data as IManagedList).items;

    assert.equal(list.status, HttpStatus.ok);
    assert.ok(items.some((item) => item.id === reviewId));
  });

  it('покупателю список отзывов магазина недоступен', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, '/reviews/manage/search', { token: customerToken });

    assert.equal(response.status, HttpStatus.forbidden);
  });

  it('пустой ответ не публикуется', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const response = await callApi(context, `/reviews/reply/${reviewId}`, {
      method: 'POST',
      token: staffToken,
      body: { text: '   ' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('ответ виден покупателям вместе с отзывом', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const replied = await callApi(context, `/reviews/reply/${reviewId}`, {
      method: 'POST',
      token: staffToken,
      body: { text: 'Спасибо, передали на склад — упаковку усилим' },
    });

    assert.equal(replied.status, HttpStatus.ok);

    const summary = await callApi(context, `/reviews/get?productId=${product?.productId}`);
    const found = (summary.body.data as ISummary).reviews.find((item) => item.id === reviewId);

    assert.equal(found?.reply, 'Спасибо, передали на склад — упаковку усилим');
    assert.ok(found?.replyAt);
  });

  it('покупатель получает уведомление об ответе', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const list = await callApi(context, '/notifications/search', { token: customerToken });
    const items = (list.body.data as { items: { title: string }[] }).items;

    assert.ok(items.some((item) => item.title === 'Магазин ответил на ваш отзыв'));
  });

  it('фильтр по наличию ответа работает', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const answered = await callApi(context, '/reviews/manage/search?answered=answered', {
      token: staffToken,
    });
    const pending = await callApi(context, '/reviews/manage/search?answered=pending', {
      token: staffToken,
    });

    assert.ok((answered.body.data as IManagedList).items.some((item) => item.id === reviewId));
    assert.equal(
      (pending.body.data as IManagedList).items.some((item) => item.id === reviewId),
      false,
    );
  });

  it('ответ на чужой отзыв не проходит', async (t: TestContext) => {
    if (!context) {
      return t.skip(SKIP_REASON);
    }

    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const response = await callApi(context, `/reviews/reply/${reviewId}`, {
      method: 'POST',
      token: foreignToken,
      tenantKey: context.other.key,
      body: { text: 'Чужой ответ' },
    });

    assert.equal(response.status, HttpStatus.notFound);
  });
});

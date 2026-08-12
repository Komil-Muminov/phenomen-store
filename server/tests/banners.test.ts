import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import { HttpStatus, UserRoles } from '@/shared/config';
import { BannerActionTypes } from '@/modules/banner/types';
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

interface IBanner {
  id: string;
  title: string | null;
  position: number;
  isActive: boolean;
  actionType: string;
  actionValue: string | null;
}

interface IBannerList {
  items: IBanner[];
  total: number;
}

const IMAGE = 'https://example.com/banner.jpg';
const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

let context: ITestContext | null = null;
let staffToken = '';
let product: ITestProduct | null = null;

const createBanner = (ctx: ITestContext, body: Record<string, unknown>) => callApi(
  ctx,
  '/banners/create',
  { method: 'POST', token: staffToken, body: { imageUrl: IMAGE, ...body } },
);

const listBanners = async (ctx: ITestContext): Promise<IBanner[]> => {
  const response = await callApi(ctx, '/banners/manage/search?limit=100', { token: staffToken });

  return (response.body.data as IBannerList).items;
};

const titlesInOrder = async (ctx: ITestContext): Promise<(string | null)[]> => (
  (await listBanners(ctx)).map((banner) => banner.title)
);

const reorder = (ctx: ITestContext, body: Record<string, unknown>) => callApi(ctx, '/banners/reorder', {
  method: 'POST',
  token: staffToken,
  body,
});

const clearBanners = async (ctx: ITestContext): Promise<void> => {
  const banners = await listBanners(ctx);

  for (const banner of banners) {
    await callApi(ctx, `/banners/delete/${banner.id}`, { method: 'DELETE', token: staffToken });
  }
};

const seedThree = async (ctx: ITestContext): Promise<IBanner[]> => {
  await clearBanners(ctx);

  const titles = ['А', 'Б', 'В'];

  for (let index = 0; index < titles.length; index += 1) {
    await createBanner(ctx, { title: titles[index], position: (index + 1) * 10 });
  }

  return listBanners(ctx);
};

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  staffToken = await createStaffToken(context, UserRoles.owner);
  product = await seedProduct(context, context.tenant.id);
});

after(async () => {
  await stopContext(context);
});

describe('создание баннера', () => {
  it('создаёт баннер с картинкой', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await createBanner(context, { title: 'Новый баннер' });
    const banner = response.body.data as IBanner;

    assert.equal(response.status, HttpStatus.created);
    assert.equal(banner.title, 'Новый баннер');
    assert.equal(banner.isActive, true);
  });

  it('новый баннер встаёт первым', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    await seedThree(context);
    await createBanner(context, { title: 'Свежий' });

    assert.deepEqual(await titlesInOrder(context), ['Свежий', 'А', 'Б', 'В']);
  });

  it('несколько новых подряд идут от самого свежего', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    await clearBanners(context);
    await createBanner(context, { title: 'Первый' });
    await createBanner(context, { title: 'Второй' });
    await createBanner(context, { title: 'Третий' });

    assert.deepEqual(await titlesInOrder(context), ['Третий', 'Второй', 'Первый']);
  });

  it('явная позиция сильнее автоматической', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    await seedThree(context);
    await createBanner(context, { title: 'В конец', position: 999 });

    assert.deepEqual(await titlesInOrder(context), ['А', 'Б', 'В', 'В конец']);
  });

  it('требует картинку', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await callApi(context, '/banners/create', {
      method: 'POST',
      token: staffToken,
      body: { title: 'Без картинки' },
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('не принимает картинку не по ссылке', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await createBanner(context, { imageUrl: 'просто текст' });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('переход на товар требует существующий товар', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const good = await createBanner(context, {
      title: 'На товар',
      actionType: BannerActionTypes.product,
      actionValue: product?.productId,
    });
    const bad = await createBanner(context, {
      title: 'На чужой товар',
      actionType: BannerActionTypes.product,
      actionValue: UNKNOWN_ID,
    });

    assert.equal(good.status, HttpStatus.created);
    assert.equal(bad.status, HttpStatus.badRequest);
  });

  it('внешняя ссылка проверяется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await createBanner(context, {
      title: 'Ссылка',
      actionType: BannerActionTypes.link,
      actionValue: 'не-ссылка',
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('дата окончания раньше начала отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await createBanner(context, {
      title: 'Период',
      startsAt: '2026-05-10T00:00:00.000Z',
      endsAt: '2026-05-01T00:00:00.000Z',
    });

    assert.equal(response.status, HttpStatus.badRequest);
  });
});

describe('порядок баннеров', () => {
  it('перемещает баннер перед указанным', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const [first, , third] = await seedThree(context);
    const response = await reorder(context, { id: third.id, beforeId: first.id });

    assert.equal(response.status, HttpStatus.ok);
    assert.deepEqual(await titlesInOrder(context), ['В', 'А', 'Б']);
  });

  it('перемещает баннер после указанного', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const [first, second] = await seedThree(context);

    await reorder(context, { id: first.id, afterId: second.id });

    assert.deepEqual(await titlesInOrder(context), ['Б', 'А', 'В']);
  });

  it('без якоря уводит баннер в конец', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const [first] = await seedThree(context);

    await reorder(context, { id: first.id });

    assert.deepEqual(await titlesInOrder(context), ['Б', 'В', 'А']);
  });

  it('позиции пересчитываются с шагом', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const [, second] = await seedThree(context);

    await reorder(context, { id: second.id });

    const positions = (await listBanners(context)).map((banner) => banner.position);

    assert.deepEqual(positions, [10, 20, 30]);
  });

  it('чужой баннер в качестве якоря отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const [first] = await seedThree(context);
    const response = await reorder(context, { id: first.id, beforeId: UNKNOWN_ID });

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('битый идентификатор отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await reorder(context, { id: 'не-uuid' });

    assert.equal(response.status, HttpStatus.badRequest);
  });
});

describe('видимость и удаление', () => {
  it('скрытый баннер пропадает из витрины, но остаётся в кабинете', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    await clearBanners(context);

    const created = (await createBanner(context, { title: 'Скрываемый' })).body.data as IBanner;

    await callApi(context, `/banners/deactivate/${created.id}`, {
      method: 'PATCH',
      token: staffToken,
      body: {},
    });

    const manage = await listBanners(context);
    const storefront = await callApi(context, '/banners/manage/search?isActive=true', {
      token: staffToken,
    });
    const visible = (storefront.body.data as IBannerList).items;

    assert.ok(manage.some((banner) => banner.id === created.id));
    assert.ok(!visible.some((banner) => banner.id === created.id));
  });

  it('удаление убирает баннер насовсем', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = (await createBanner(context, { title: 'Удаляемый' })).body.data as IBanner;
    const response = await callApi(context, `/banners/delete/${created.id}`, {
      method: 'DELETE',
      token: staffToken,
    });

    assert.equal(response.status, HttpStatus.ok);
    assert.ok(!(await listBanners(context)).some((banner) => banner.id === created.id));
  });

  it('баннеры одного магазина не видны другому', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const created = (await createBanner(context, { title: 'Только наш' })).body.data as IBanner;
    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const response = await callApi(context, '/banners/manage/search?limit=100', {
      token: foreignToken,
      tenantKey: context.other.key,
    });
    const items = (response.body.data as IBannerList).items;

    assert.ok(!items.some((banner) => banner.id === created.id));
  });
});

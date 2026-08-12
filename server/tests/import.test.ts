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

interface IImportResult {
  created: number;
  updated: number;
  failed: { row: number; name: string; reason: string }[];
}

interface IProductList {
  items: { id: string; slug: string; name: string; price: number; categoryId: string | null }[];
  total: number;
}

let context: ITestContext | null = null;
let staffToken = '';
let categoryId = '';

const CATEGORY_NAME = 'Женщинам';

const runImport = (ctx: ITestContext, rows: Record<string, unknown>[]) => callApi(
  ctx,
  '/products/import',
  { method: 'POST', token: staffToken, body: { rows } },
);

const findProduct = async (ctx: ITestContext, slug: string) => {
  const response = await callApi(ctx, `/products/manage/search?search=${slug}&limit=50`, {
    token: staffToken,
  });
  const list = response.body.data as IProductList;

  return list.items.find((item) => item.slug === slug) ?? null;
};

before(async () => {
  context = await startContext();

  if (!context) {
    return;
  }

  staffToken = await createStaffToken(context, UserRoles.owner);

  const created = await callApi(context, '/categories/create', {
    method: 'POST',
    token: staffToken,
    body: { name: CATEGORY_NAME },
  });

  categoryId = (created.body.data as { id: string }).id;
});

after(async () => {
  await stopContext(context);
});

describe('импорт товаров', () => {
  it('создаёт товары из строк', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const slug = `import-basic-${Date.now()}`;
    const response = await runImport(context, [
      { name: 'Импортный товар', basePrice: 1200, slug },
    ]);
    const result = response.body.data as IImportResult;

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(result.created, 1);
    assert.equal(result.updated, 0);
    assert.equal(result.failed.length, 0);

    const stored = await findProduct(context, slug);

    assert.equal(stored?.name, 'Импортный товар');
    assert.equal(stored?.price, 1200);
  });

  it('повторный импорт того же ключа обновляет, а не дублирует', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const slug = `import-update-${Date.now()}`;

    await runImport(context, [{ name: 'Первая версия', basePrice: 100, slug }]);

    const response = await runImport(context, [{ name: 'Вторая версия', basePrice: 250, slug }]);
    const result = response.body.data as IImportResult;

    assert.equal(result.created, 0);
    assert.equal(result.updated, 1);

    const stored = await findProduct(context, slug);

    assert.equal(stored?.name, 'Вторая версия');
    assert.equal(stored?.price, 250);
  });

  it('привязывает товар к категории по названию', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const slug = `import-category-${Date.now()}`;

    await runImport(context, [
      { name: 'Товар в категории', basePrice: 300, slug, category: ' женщинам ' },
    ]);

    const stored = await findProduct(context, slug);

    assert.equal(stored?.categoryId, categoryId);
  });

  it('неизвестная категория не роняет строку', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const slug = `import-nocategory-${Date.now()}`;
    const response = await runImport(context, [
      { name: 'Без категории', basePrice: 300, slug, category: 'Такой нет' },
    ]);
    const result = response.body.data as IImportResult;

    assert.equal(result.created, 1);
    assert.equal(result.failed.length, 0);

    const stored = await findProduct(context, slug);

    assert.equal(stored?.categoryId, null);
  });
});

describe('импорт сообщает об ошибках построчно', () => {
  it('плохая строка не мешает хорошим', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const goodSlug = `import-good-${Date.now()}`;
    const response = await runImport(context, [
      { name: '', basePrice: 100 },
      { name: 'Нормальный товар', basePrice: 500, slug: goodSlug },
      { name: 'Без цены', basePrice: 'дорого' },
    ]);
    const result = response.body.data as IImportResult;

    assert.equal(result.created, 1);
    assert.equal(result.failed.length, 2);
    assert.deepEqual(result.failed.map((item) => item.row), [1, 3]);
    assert.equal(result.failed[1].name, 'Без цены');
    assert.ok(await findProduct(context, goodSlug));
  });

  it('пустой список отклоняется', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const response = await runImport(context, []);

    assert.equal(response.status, HttpStatus.badRequest);
  });

  it('импорт закрыт для покупателя', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const customerToken = await createStaffToken(context, UserRoles.customer);
    const response = await callApi(context, '/products/import', {
      method: 'POST',
      token: customerToken,
      body: { rows: [{ name: 'Чужой', basePrice: 1 }] },
    });

    assert.equal(response.status, HttpStatus.forbidden);
  });

  it('импорт одного магазина не виден другому', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const slug = `import-isolated-${Date.now()}`;

    await runImport(context, [{ name: 'Только наш', basePrice: 700, slug }]);

    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const response = await callApi(context, `/products/manage/search?search=${slug}`, {
      token: foreignToken,
      tenantKey: context.other.key,
    });
    const list = response.body.data as IProductList;

    assert.equal(list.total, 0);
  });
});

describe('массовые действия и выгрузка', () => {
  const seedForBulk = async (ctx: ITestContext, prefix: string) => {
    const slugs = [1, 2, 3].map((index) => `${prefix}-${Date.now()}-${index}`);

    await runImport(ctx, slugs.map((slug, index) => ({
      name: `Пакетный ${index + 1}`,
      basePrice: 100 * (index + 1),
      slug,
    })));

    const ids: string[] = [];

    for (const slug of slugs) {
      const stored = await findProduct(ctx, slug);

      if (stored) {
        ids.push((stored as unknown as { id: string }).id);
      }
    }

    return { slugs, ids };
  };

  it('скрывает выбранные товары пачкой', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const { slugs, ids } = await seedForBulk(context, 'bulk-hide');
    const response = await callApi(context, '/products/bulk/update', {
      method: 'POST',
      token: staffToken,
      body: { ids, isActive: false },
    });

    assert.equal(response.status, HttpStatus.ok);
    assert.equal((response.body.data as { changed: number }).changed, 3);

    const visible = await callApi(context, '/products/manage/search?isActive=true&limit=100', {
      token: staffToken,
    });
    const items = (visible.body.data as IProductList).items;

    assert.ok(!items.some((item) => slugs.includes(item.slug)));
  });

  it('переносит выбранные товары в категорию', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const { slugs, ids } = await seedForBulk(context, 'bulk-move');

    await callApi(context, '/products/bulk/update', {
      method: 'POST',
      token: staffToken,
      body: { ids, categoryId },
    });

    const moved = await findProduct(context, slugs[0]);

    assert.equal(moved?.categoryId, categoryId);
  });

  it('пустой список и лишние изменения отклоняются', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const { ids } = await seedForBulk(context, 'bulk-bad');

    assert.equal((await callApi(context, '/products/bulk/update', {
      method: 'POST',
      token: staffToken,
      body: { ids: [] },
    })).status, HttpStatus.badRequest);

    assert.equal((await callApi(context, '/products/bulk/update', {
      method: 'POST',
      token: staffToken,
      body: { ids },
    })).status, HttpStatus.badRequest);
  });

  it('чужие товары пачкой не изменить', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const { ids } = await seedForBulk(context, 'bulk-foreign');
    const foreignToken = await createStaffToken(context, UserRoles.owner, context.other.id);
    const response = await callApi(context, '/products/bulk/update', {
      method: 'POST',
      token: foreignToken,
      tenantKey: context.other.key,
      body: { ids, isActive: false },
    });

    assert.equal((response.body.data as { changed: number }).changed, 0);
  });

  it('выгрузка отдаёт товары в том же виде, что принимает загрузка', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const slug = `export-${Date.now()}`;

    await runImport(context, [{
      name: 'Товар на выгрузку',
      basePrice: 777,
      slug,
      category: CATEGORY_NAME,
      brand: 'PHENOMEN',
    }]);

    const response = await callApi(context, '/products/export', { token: staffToken });
    const rows = (response.body.data as { rows: Record<string, unknown>[] }).rows;
    const exported = rows.find((row) => row.slug === slug);

    assert.equal(response.status, HttpStatus.ok);
    assert.equal(exported?.name, 'Товар на выгрузку');
    assert.equal(exported?.price, 777);
    assert.equal(exported?.category, CATEGORY_NAME);
    assert.equal(exported?.brand, 'PHENOMEN');
  });

  it('выгрузка закрыта от покупателя', async (t: TestContext) => {
    if (!context) {
      t.skip(SKIP_REASON);

      return;
    }

    const customerToken = await createStaffToken(context, UserRoles.customer);

    assert.equal((await callApi(context, '/products/export')).status, HttpStatus.unauthorized);
    assert.equal(
      (await callApi(context, '/products/export', { token: customerToken })).status,
      HttpStatus.forbidden,
    );
  });
});

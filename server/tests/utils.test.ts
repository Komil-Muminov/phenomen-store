import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Pagination } from '@/shared/config';
import {
  AppError,
  parsePagination,
  pickFlag,
  pickSearch,
  pickString,
  pickUuid,
  requireFields,
} from '@/shared/utils';

const SAMPLE_UUID = '0f1b2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d';

describe('parsePagination', () => {
  it('подставляет значения по умолчанию', () => {
    assert.deepEqual(parsePagination({}), {
      page: Pagination.defaultPage,
      limit: Pagination.defaultLimit,
      offset: 0,
    });
  });

  it('считает смещение по странице', () => {
    assert.deepEqual(parsePagination({ page: '3', limit: '10' }), {
      page: 3,
      limit: 10,
      offset: 20,
    });
  });

  it('обрезает лимит по потолку', () => {
    assert.equal(parsePagination({ limit: '100000' }).limit, Pagination.maxLimit);
  });

  it('игнорирует мусор и отрицательные значения', () => {
    assert.equal(parsePagination({ page: 'abc', limit: '-5' }).page, Pagination.defaultPage);
    assert.equal(parsePagination({ page: 'abc', limit: '-5' }).limit, Pagination.defaultLimit);
  });
});

describe('pickSearch', () => {
  it('оборачивает строку в шаблон ILIKE', () => {
    assert.equal(pickSearch('  футболка '), '%футболка%');
  });

  it('возвращает null для пустого запроса', () => {
    assert.equal(pickSearch('   '), null);
    assert.equal(pickSearch(undefined), null);
    assert.equal(pickSearch(42), null);
  });
});

describe('pickFlag', () => {
  it('понимает строковые и булевы значения', () => {
    assert.equal(pickFlag('true'), true);
    assert.equal(pickFlag(false), false);
  });

  it('считает всё остальное отсутствием фильтра', () => {
    assert.equal(pickFlag('all'), null);
    assert.equal(pickFlag(undefined), null);
  });
});

describe('pickUuid', () => {
  it('пропускает корректный идентификатор', () => {
    assert.equal(pickUuid(SAMPLE_UUID, 'categoryId'), SAMPLE_UUID);
  });

  it('возвращает null, если фильтр не задан', () => {
    assert.equal(pickUuid('', 'categoryId'), null);
    assert.equal(pickUuid(undefined, 'categoryId'), null);
  });

  it('отклоняет мусор вместо похода в базу', () => {
    assert.throws(() => pickUuid("1 OR 1=1", 'categoryId'), AppError);
  });
});

describe('requireFields и pickString', () => {
  it('сообщает обо всех незаполненных полях сразу', () => {
    assert.throws(
      () => requireFields({ name: '', price: 10 }, ['name', 'slug']),
      (error: unknown) => error instanceof AppError && error.message.includes('name, slug'),
    );
  });

  it('подставляет запасное значение', () => {
    assert.equal(pickString('  ok  '), 'ok');
    assert.equal(pickString(null, 'fallback'), 'fallback');
  });
});

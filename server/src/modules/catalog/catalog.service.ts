import { ErrorMessages, HttpStatus, Pagination } from '@/shared/config';
import { ITenantContext, IListResult } from '@/shared/types';
import { AppError } from '@/shared/utils';
import {
  selectCategories,
  selectOptionFacets,
  selectProductById,
  selectProducts,
} from '@/modules/catalog/catalog.db';
import { ICategoryRow, IProductRow, IProductSearchParams, ProductSort, ProductSortSql } from '@/modules/catalog/types';

const toNumber = (value: string | null): number | null => (value === null ? null : Number(value));

const mapVariant = (variant: IProductRow['variants'][number]) => ({
  id: variant.id,
  sku: variant.sku,
  options: variant.options,
  price: Number(variant.price),
  oldPrice: toNumber(variant.old_price),
  stock: variant.stock,
});

const mapProduct = (row: IProductRow) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description,
  brand: row.brand,
  categoryId: row.category_id,
  productType: row.product_type,
  unit: row.unit,
  price: Number(row.min_price ?? row.base_price),
  oldPrice: toNumber(row.old_price),
  currency: row.currency,
  attributes: row.attributes,
  rating: Number(row.rating),
  reviewsCount: row.reviews_count,
  media: row.media,
  inStock: row.in_stock,
  variants: (row.variants ?? []).map(mapVariant),
});

const mapCategory = (row: ICategoryRow) => ({
  id: row.id,
  parentId: row.parent_id,
  slug: row.slug,
  name: row.name,
  imageUrl: row.image_url,
  position: row.position,
});

const parseOptions = (raw: unknown): Record<string, string[]> => {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return {};
  }

  return raw.split(';').reduce<Record<string, string[]>>((acc, chunk) => {
    const [code, values] = chunk.split(':');

    if (code && values) {
      acc[code] = values.split(',').filter(Boolean);
    }

    return acc;
  }, {});
};

const parsePrice = (raw: unknown): number | null => {
  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const buildSearchParams = (
  query: Record<string, unknown>,
  page: number,
  limit: number,
): IProductSearchParams => ({
  query: typeof query.query === 'string' && query.query.trim().length > 1 ? query.query.trim() : null,
  categoryId: typeof query.categoryId === 'string' && query.categoryId.length > 0 ? query.categoryId : null,
  sort: typeof query.sort === 'string' && ProductSortSql[query.sort] ? query.sort : ProductSort.popular,
  minPrice: parsePrice(query.minPrice),
  maxPrice: parsePrice(query.maxPrice),
  options: parseOptions(query.options),
  limit: Math.min(limit, Pagination.maxLimit),
  offset: (page - 1) * limit,
});

export const searchProducts = async (
  tenant: ITenantContext,
  params: IProductSearchParams,
  page: number,
): Promise<IListResult<ReturnType<typeof mapProduct>>> => {
  const { items, total } = await selectProducts(tenant.id, params);

  return { items: items.map(mapProduct), total, page, limit: params.limit };
};

export const getProduct = async (tenant: ITenantContext, id: string) => {
  const row = await selectProductById(tenant.id, id);

  if (!row) {
    throw new AppError(ErrorMessages.notFound, HttpStatus.notFound);
  }

  return mapProduct(row);
};

export const getCategories = async (tenant: ITenantContext) => {
  const rows = await selectCategories(tenant.id);

  return rows.map(mapCategory);
};

export const getFacets = async (tenant: ITenantContext, categoryId: string | null) => {
  const rows = await selectOptionFacets(tenant.id, categoryId);

  return rows.reduce<Record<string, { value: string; total: number }[]>>((acc, row) => {
    const bucket = acc[row.code] ?? [];

    bucket.push({ value: row.value, total: Number(row.total) });
    acc[row.code] = bucket;

    return acc;
  }, {});
};

import { ErrorMessages, HttpStatus, Pagination } from '@/shared/config';
import { ITenantContext, IListResult } from '@/shared/types';
import { AppError } from '@/shared/utils';
import {
  existsProductSlug,
  insertProduct,
  selectCategories,
  selectManagedProductById,
  selectManagedProducts,
  selectOptionFacets,
  selectProductById,
  selectProducts,
  updateProductFields,
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

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const PRODUCT_EDITABLE_FIELDS = [
  'name',
  'description',
  'brand',
  'basePrice',
  'oldPrice',
  'categoryId',
  'isActive',
] as const;

const requireProduct = async (tenant: ITenantContext, id: string) => {
  const row = await selectManagedProductById(tenant.id, id);

  if (!row) {
    throw new AppError(ErrorMessages.notFound, HttpStatus.notFound);
  }

  return row;
};

export const listManagedProducts = async (
  tenant: ITenantContext,
  page: number,
  limit: number,
  offset: number,
): Promise<IListResult<ReturnType<typeof mapProduct>>> => {
  const { items, total } = await selectManagedProducts(tenant.id, limit, offset);

  return { items: items.map(mapProduct), total, page, limit };
};

export const createProduct = async (tenant: ITenantContext, payload: Record<string, unknown>) => {
  const slug = String(payload.slug ?? '').trim().toLowerCase();
  const name = String(payload.name ?? '').trim();
  const basePrice = Number(payload.basePrice);

  if (!SLUG_PATTERN.test(slug) || !name || !Number.isFinite(basePrice) || basePrice < 0) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  if (await existsProductSlug(tenant.id, slug)) {
    throw new AppError('Товар с таким ключом уже существует', HttpStatus.conflict);
  }

  const created = await insertProduct(
    tenant.id,
    slug,
    name,
    basePrice,
    typeof payload.categoryId === 'string' && payload.categoryId ? payload.categoryId : null,
    typeof payload.description === 'string' ? payload.description : null,
    typeof payload.brand === 'string' ? payload.brand : null,
  );

  return mapProduct(await requireProduct(tenant, created.id));
};

export const updateProduct = async (
  tenant: ITenantContext,
  id: string,
  payload: Record<string, unknown>,
) => {
  await requireProduct(tenant, id);

  const patch: Record<string, unknown> = {};

  PRODUCT_EDITABLE_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      patch[field] = payload[field];
    }
  });

  if (Object.keys(patch).length === 0) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  await updateProductFields(tenant.id, id, patch);

  return mapProduct(await requireProduct(tenant, id));
};

export const deactivateProduct = async (tenant: ITenantContext, id: string) => {
  await requireProduct(tenant, id);
  await updateProductFields(tenant.id, id, { isActive: false });

  return mapProduct(await requireProduct(tenant, id));
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

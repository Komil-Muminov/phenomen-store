import { ErrorMessages, HttpStatus, Pagination } from '@/shared/config';
import { ITenantContext, IListResult } from '@/shared/types';
import { AppError, isPlainObject, pickString } from '@/shared/utils';
import { rememberValue } from '@/modules/attributes';
import {
  existsProductSlug,
  insertProduct,
  selectCategories,
  selectManagedProductById,
  selectManagedProducts,
  selectOptionFacets,
  replaceVariants,
  updateProductAttributes,
  selectProductVariants,
  selectStockRows,
  updateVariantStock,
  IVariantInput,
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

const SLUG_TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
};

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

const buildSlug = (source: string): string => {
  const base = source
    .toLowerCase()
    .split('')
    .map((char) => SLUG_TRANSLIT[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || `item-${Date.now()}`;
};

const buildUniqueSlug = async (tenantId: string, name: string): Promise<string> => {
  const base = buildSlug(name);
  let candidate = base;
  let suffix = 2;

  while (await existsProductSlug(tenantId, candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const buildSku = (slug: string, options: Record<string, string>): string => {
  const parts = Object.keys(options)
    .sort()
    .map((key) => buildSlug(String(options[key])))
    .filter(Boolean);

  return [slug, ...parts].join('-').toUpperCase();
};

const readAttributes = (payload: Record<string, unknown>): Record<string, string> => {
  const source = isPlainObject(payload.attributes) ? payload.attributes : {};
  const result: Record<string, string> = {};

  Object.entries(source).forEach(([code, value]) => {
    const text = pickString(value);

    if (text) {
      result[code] = text;
    }
  });

  return result;
};

const readVariants = (
  payload: Record<string, unknown>,
  slug: string,
  basePrice: number,
): IVariantInput[] => {
  const source = Array.isArray(payload.variants) ? payload.variants : [];

  return source.filter(isPlainObject).map((raw) => {
    const options: Record<string, string> = {};

    if (isPlainObject(raw.options)) {
      Object.entries(raw.options).forEach(([code, value]) => {
        const text = pickString(value);

        if (text) {
          options[code] = text;
        }
      });
    }

    const price = Number(raw.price);
    const stock = Number(raw.stock);

    return {
      sku: pickString(raw.sku) || buildSku(slug, options),
      options,
      price: Number.isFinite(price) && price > 0 ? price : basePrice,
      oldPrice: Number.isFinite(Number(raw.oldPrice)) ? Number(raw.oldPrice) : null,
      stock: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
    };
  });
};

const rememberUsedValues = async (
  tenantId: string,
  attributes: Record<string, string>,
  variants: IVariantInput[],
): Promise<void> => {
  for (const [code, value] of Object.entries(attributes)) {
    await rememberValue(tenantId, code, value);
  }

  for (const variant of variants) {
    for (const [code, value] of Object.entries(variant.options)) {
      await rememberValue(tenantId, code, value);
    }
  }
};

export const createProduct = async (tenant: ITenantContext, payload: Record<string, unknown>) => {
  const name = pickString(payload.name);
  const basePrice = Number(payload.basePrice);

  if (!name || !Number.isFinite(basePrice) || basePrice < 0) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  const requested = pickString(payload.slug).toLowerCase();
  const slug = SLUG_PATTERN.test(requested)
    ? requested
    : await buildUniqueSlug(tenant.id, name);

  if (await existsProductSlug(tenant.id, slug)) {
    throw new AppError('Товар с таким ключом уже существует', HttpStatus.conflict);
  }

  const attributes = readAttributes(payload);
  const variants = readVariants(payload, slug, basePrice);
  const created = await insertProduct(
    tenant.id,
    slug,
    name,
    basePrice,
    pickString(payload.categoryId) || null,
    pickString(payload.description) || null,
    pickString(payload.brand) || null,
    attributes,
  );

  if (variants.length > 0) {
    await replaceVariants(tenant.id, created.id, variants);
  }

  await rememberUsedValues(tenant.id, attributes, variants);

  return mapProduct(await requireProduct(tenant, created.id));
};

export const updateProduct = async (
  tenant: ITenantContext,
  id: string,
  payload: Record<string, unknown>,
) => {
  const existing = await requireProduct(tenant, id);
  const patch: Record<string, unknown> = {};

  PRODUCT_EDITABLE_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      patch[field] = payload[field];
    }
  });

  const hasAttributes = isPlainObject(payload.attributes);
  const hasVariants = Array.isArray(payload.variants);

  if (Object.keys(patch).length === 0 && !hasAttributes && !hasVariants) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  if (Object.keys(patch).length > 0) {
    await updateProductFields(tenant.id, id, patch);
  }

  const attributes = hasAttributes ? readAttributes(payload) : {};

  if (hasAttributes) {
    await updateProductAttributes(tenant.id, id, attributes);
  }

  const basePrice = Number(patch.basePrice ?? existing.base_price);
  const variants = hasVariants ? readVariants(payload, existing.slug, basePrice) : [];

  if (hasVariants) {
    await replaceVariants(tenant.id, id, variants);
  }

  await rememberUsedValues(tenant.id, attributes, variants);

  return mapProduct(await requireProduct(tenant, id));
};

export const listStock = async (
  tenant: ITenantContext,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectStockRows(tenant.id, limit, offset);

  return {
    items: items.map((row) => ({
      id: row.id,
      sku: row.sku,
      options: row.options ?? {},
      stock: row.stock,
      price: Number(row.price),
      productId: row.product_id,
      productName: row.product_name,
      isActive: row.is_active,
    })),
    total,
    page,
    limit,
  };
};

export const changeStock = async (
  tenant: ITenantContext,
  variantId: string,
  rawStock: unknown,
) => {
  const stock = Number(rawStock);

  if (!Number.isFinite(stock) || stock < 0) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  await updateVariantStock(tenant.id, variantId, Math.floor(stock));

  return { id: variantId, stock: Math.floor(stock) };
};

export const duplicateProduct = async (tenant: ITenantContext, id: string) => {
  const source = await requireProduct(tenant, id);
  const name = `${source.name} (копия)`;
  const slug = await buildUniqueSlug(tenant.id, name);
  const created = await insertProduct(
    tenant.id,
    slug,
    name,
    Number(source.base_price),
    source.category_id,
    source.description,
    source.brand,
    source.attributes ?? {},
  );
  const variants = (await selectProductVariants(tenant.id, id)).map((variant) => ({
    ...variant,
    sku: buildSku(slug, variant.options),
  }));

  if (variants.length > 0) {
    await replaceVariants(tenant.id, created.id, variants);
  }

  return mapProduct(await requireProduct(tenant, created.id));
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

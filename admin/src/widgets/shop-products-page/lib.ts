import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { IAttributePayload } from '@/features/attribute-value-picker';
import type { ICategoryPayload } from '@/features/category-picker';
import type { IProductPayload } from '@/features/product-form';
import type { IImportResult, IImportRow } from '@/features/product-import';
import type { IShopAttribute, IShopCategory, IShopProduct } from '@/entities/shop';

const INVALIDATE = [[QueryKeys.shopProducts], [QueryKeys.shopStock]];

const CATEGORY_INVALIDATE = [[QueryKeys.shopCategories], [QueryKeys.shopProducts]];

const ATTRIBUTE_INVALIDATE = [[QueryKeys.shopAttributes], [QueryKeys.shopProducts]];

export const useProductMutations = () => ({
  create: useMutationQuery<IProductPayload, IShopProduct>(
    ApiRoutes.shopProductCreate,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  update: useMutationQuery<IProductPayload & { id: string }, IShopProduct>(
    (body) => `${ApiRoutes.shopProductUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: INVALIDATE },
  ),
  bulk: useMutationQuery<
    { ids: string[]; isActive?: boolean; categoryId?: string },
    { changed: number }
  >(ApiRoutes.shopProductsBulk, { scope: 'shop', invalidate: INVALIDATE }),
  toggle: useMutationQuery<{ id: string; isActive: boolean }, IShopProduct>(
    (body) => `${ApiRoutes.shopProductUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: INVALIDATE },
  ),
  duplicate: useMutationQuery<{ id: string }, IShopProduct>(
    (body) => `${ApiRoutes.shopProductDuplicate}/${body.id}`,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  importRows: useMutationQuery<{ rows: IImportRow[] }, IImportResult>(
    ApiRoutes.shopProductImport,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  createCategory: useMutationQuery<ICategoryPayload, IShopCategory>(
    ApiRoutes.shopCategoryCreate,
    { scope: 'shop', invalidate: CATEGORY_INVALIDATE },
  ),
  renameCategory: useMutationQuery<ICategoryPayload & { id: string }, IShopCategory>(
    (body) => `${ApiRoutes.shopCategoryUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: CATEGORY_INVALIDATE },
  ),
  removeCategory: useMutationQuery<{ id: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.shopCategoryDelete}/${body.id}`,
    { scope: 'shop', method: 'delete', invalidate: CATEGORY_INVALIDATE },
  ),
  createAttribute: useMutationQuery<IAttributePayload, IShopAttribute>(
    ApiRoutes.shopAttributeCreate,
    { scope: 'shop', invalidate: ATTRIBUTE_INVALIDATE },
  ),
  updateAttribute: useMutationQuery<
    Partial<IAttributePayload> & { id: string; values?: string[] },
    IShopAttribute
  >(
    (body) => `${ApiRoutes.shopAttributeUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: ATTRIBUTE_INVALIDATE },
  ),
  removeAttribute: useMutationQuery<{ id: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.shopAttributeDelete}/${body.id}`,
    { scope: 'shop', method: 'delete', invalidate: ATTRIBUTE_INVALIDATE },
  ),
});

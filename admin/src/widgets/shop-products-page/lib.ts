import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { IProductPayload } from '@/features/product-form';
import type { IImportResult, IImportRow } from '@/features/product-import';
import type { IShopProduct } from '@/entities/shop';

const INVALIDATE = [[QueryKeys.shopProducts], [QueryKeys.shopStock]];

export const useProductMutations = () => ({
  create: useMutationQuery<IProductPayload, IShopProduct>(
    ApiRoutes.shopProductCreate,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  update: useMutationQuery<IProductPayload & { id: string }, IShopProduct>(
    (body) => `${ApiRoutes.shopProductUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: INVALIDATE },
  ),
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
});

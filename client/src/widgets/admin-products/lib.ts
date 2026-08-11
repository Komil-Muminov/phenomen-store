import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import { IImportResult, IImportRow } from '@/features/product-import';
import { IAdminCategory, IAdminProduct } from '@/widgets/admin-products/model';

const INVALIDATE = [[QueryKeys.adminProducts], [QueryKeys.adminStock]];

const CATEGORY_INVALIDATE = [[QueryKeys.categories], [QueryKeys.adminProducts]];

export const useProductMutations = () => ({
  create: useMutationQuery<Record<string, unknown>, IAdminProduct>(
    ApiRoutes.manageProductCreate,
    { invalidate: INVALIDATE },
  ),
  update: useMutationQuery<Record<string, unknown> & { id: string }, IAdminProduct>(
    (body) => `${ApiRoutes.manageProductUpdate}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  hide: useMutationQuery<{ id: string }, IAdminProduct>(
    (body) => `${ApiRoutes.manageProductDeactivate}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  duplicate: useMutationQuery<{ id: string }, IAdminProduct>(
    (body) => `${ApiRoutes.manageProductDuplicate}/${body.id}`,
    { invalidate: INVALIDATE },
  ),
  importRows: useMutationQuery<{ rows: IImportRow[] }, IImportResult>(
    ApiRoutes.manageProductImport,
    { invalidate: INVALIDATE },
  ),
  createCategory: useMutationQuery<{ name: string }, IAdminCategory>(
    ApiRoutes.manageCategoryCreate,
    { invalidate: CATEGORY_INVALIDATE },
  ),
});

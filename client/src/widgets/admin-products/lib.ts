import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import { ICategoryPayload } from '@/features/category-editor';
import { IAdminAttribute, IAttributePayload } from '@/features/product-options';
import { IImportResult, IImportRow } from '@/features/product-import';
import { IAdminCategory, IAdminProduct } from '@/widgets/admin-products/model';

const INVALIDATE = [[QueryKeys.adminProducts], [QueryKeys.adminStock]];

const CATEGORY_INVALIDATE = [[QueryKeys.categories], [QueryKeys.adminProducts]];

const ATTRIBUTE_INVALIDATE = [[QueryKeys.adminAttributes], [QueryKeys.adminProducts]];

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
  createCategory: useMutationQuery<ICategoryPayload, IAdminCategory>(
    ApiRoutes.manageCategoryCreate,
    { invalidate: CATEGORY_INVALIDATE },
  ),
  updateCategory: useMutationQuery<ICategoryPayload & { id: string }, IAdminCategory>(
    (body) => `${ApiRoutes.manageCategoryUpdate}/${body.id}`,
    { method: 'patch', invalidate: CATEGORY_INVALIDATE },
  ),
  removeCategory: useMutationQuery<{ id: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.manageCategoryDelete}/${body.id}`,
    { method: 'delete', invalidate: CATEGORY_INVALIDATE },
  ),
  createAttribute: useMutationQuery<IAttributePayload, IAdminAttribute>(
    ApiRoutes.manageAttributeCreate,
    { invalidate: ATTRIBUTE_INVALIDATE },
  ),
  updateAttribute: useMutationQuery<IAttributePayload & { id: string }, IAdminAttribute>(
    (body) => `${ApiRoutes.manageAttributeUpdate}/${body.id}`,
    { method: 'patch', invalidate: ATTRIBUTE_INVALIDATE },
  ),
  removeAttribute: useMutationQuery<{ id: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.manageAttributeDelete}/${body.id}`,
    { method: 'delete', invalidate: ATTRIBUTE_INVALIDATE },
  ),
});

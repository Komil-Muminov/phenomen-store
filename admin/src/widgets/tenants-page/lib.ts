import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { ITenantFormValues } from '@/features/tenant-form';
import type { ITenantCardValues } from '@/features/tenant-card';
import type { IOwnerFormValues } from '@/features/owner-form';
import { buildStaffUrl, buildUpdateUrl } from '@/widgets/tenants-page/model';
import type { ITenant, ITenantStaff } from '@/entities/tenant';

type TWithId = { id: string };

type TWithStaff = TWithId & { staffId: string };

const TENANTS_KEY = [[QueryKeys.tenants]];

const STAFF_KEY = [[QueryKeys.tenantStaff]];

const BOTH_KEYS = [[QueryKeys.tenants], [QueryKeys.tenantStaff]];

export const useTenantMutations = () => ({
  create: useMutationQuery<ITenantFormValues, ITenant>(
    ApiRoutes.tenantsCreate,
    { invalidate: TENANTS_KEY },
  ),
  update: useMutationQuery<ITenantCardValues & TWithId, ITenant>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsUpdate, body.id),
    { method: 'patch', invalidate: TENANTS_KEY },
  ),
  deactivate: useMutationQuery<TWithId, ITenant>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsDeactivate, body.id),
    { method: 'patch', invalidate: TENANTS_KEY },
  ),
  activate: useMutationQuery<TWithId, ITenant>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsActivate, body.id),
    { method: 'patch', invalidate: TENANTS_KEY },
  ),
  remove: useMutationQuery<TWithId & { key: string }, { deleted: boolean }>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsDelete, body.id),
    { method: 'delete', invalidate: TENANTS_KEY },
  ),
  createStaff: useMutationQuery<IOwnerFormValues & TWithId, { id: string }>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsOwnerCreate, body.id),
    { invalidate: BOTH_KEYS },
  ),
  updateStaff: useMutationQuery<IOwnerFormValues & TWithStaff, ITenantStaff>(
    (body) => buildStaffUrl(ApiRoutes.tenantsStaffUpdate, body.id, body.staffId),
    { method: 'patch', invalidate: STAFF_KEY },
  ),
  removeStaff: useMutationQuery<TWithStaff, { deleted: boolean }>(
    (body) => buildStaffUrl(ApiRoutes.tenantsStaffDelete, body.id, body.staffId),
    { method: 'delete', invalidate: STAFF_KEY },
  ),
});

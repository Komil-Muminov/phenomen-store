import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import { ITenant, ITenantStaff } from '@/widgets/admin-tenants/model';

const INVALIDATE = [[QueryKeys.adminTenants]];

const STAFF_INVALIDATE = [[QueryKeys.adminStaff]];

export const useTenantMutations = () => ({
  create: useMutationQuery<Record<string, unknown>, ITenant>(
    ApiRoutes.tenantsCreate,
    { invalidate: INVALIDATE },
  ),
  update: useMutationQuery<Record<string, unknown> & { id: string }, ITenant>(
    (body) => `${ApiRoutes.tenantsUpdate}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  status: useMutationQuery<{ id: string; activate: boolean }, ITenant>(
    (body) => `${body.activate ? ApiRoutes.tenantsActivate : ApiRoutes.tenantsDeactivate}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  remove: useMutationQuery<{ id: string; key: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.tenantsDelete}/${body.id}`,
    { method: 'delete', invalidate: INVALIDATE },
  ),
  updateStaff: useMutationQuery<
    Record<string, unknown> & { id: string; staffId: string },
    ITenantStaff
  >(
    (body) => `${ApiRoutes.tenantsStaffUpdate}/${body.id}/${body.staffId}`,
    { method: 'patch', invalidate: STAFF_INVALIDATE },
  ),
});

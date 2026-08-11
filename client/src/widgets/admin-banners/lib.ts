import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import { IAdminBanner, IBannerMove } from '@/widgets/admin-banners/model';

const INVALIDATE = [[QueryKeys.adminBanners]];

export const useBannerMutations = () => ({
  create: useMutationQuery<Record<string, unknown>, IAdminBanner>(
    ApiRoutes.manageBannerCreate,
    { invalidate: INVALIDATE },
  ),
  update: useMutationQuery<Record<string, unknown> & { id: string }, IAdminBanner>(
    (body) => `${ApiRoutes.manageBannerUpdate}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  remove: useMutationQuery<{ id: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.manageBannerDelete}/${body.id}`,
    { method: 'delete', invalidate: INVALIDATE },
  ),
  reorder: useMutationQuery<IBannerMove, IAdminBanner[]>(
    ApiRoutes.manageBannerReorder,
    { invalidate: INVALIDATE },
  ),
});

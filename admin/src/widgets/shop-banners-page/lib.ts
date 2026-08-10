import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { IBannerFormValues } from '@/features/banner-form';
import type { IShopBanner } from '@/entities/shop';

const INVALIDATE = [[QueryKeys.shopBanners]];

export const useBannerMutations = () => ({
  create: useMutationQuery<IBannerFormValues, IShopBanner>(
    ApiRoutes.shopBannerCreate,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  update: useMutationQuery<IBannerFormValues & { id: string }, IShopBanner>(
    (body) => `${ApiRoutes.shopBannerUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: INVALIDATE },
  ),
  deactivate: useMutationQuery<{ id: string }, IShopBanner>(
    (body) => `${ApiRoutes.shopBannerDeactivate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: INVALIDATE },
  ),
  remove: useMutationQuery<{ id: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.shopBannerDelete}/${body.id}`,
    { scope: 'shop', method: 'delete', invalidate: INVALIDATE },
  ),
  reorder: useMutationQuery<{ ids: string[] }, IShopBanner[]>(
    ApiRoutes.shopBannerReorder,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
});

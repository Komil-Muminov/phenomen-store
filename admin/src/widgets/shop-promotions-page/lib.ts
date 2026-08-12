import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { IPromotion } from '@/features/promotions-table';
import type { IPromotionFormValues } from '@/features/promotion-form';

const INVALIDATE = [[QueryKeys.shopPromotions]];

type TWithId = { id: string };

export const usePromotionMutations = () => ({
  create: useMutationQuery<IPromotionFormValues, IPromotion>(
    ApiRoutes.shopPromotionCreate,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  update: useMutationQuery<IPromotionFormValues & TWithId, IPromotion>(
    (body) => `${ApiRoutes.shopPromotionUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: INVALIDATE },
  ),
  remove: useMutationQuery<TWithId, { removed: boolean }>(
    (body) => `${ApiRoutes.shopPromotionDelete}/${body.id}`,
    { scope: 'shop', method: 'delete', invalidate: INVALIDATE },
  ),
});

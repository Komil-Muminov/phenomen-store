import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { IThread } from '@/widgets/shop-support-page/model';

const INVALIDATE = [[QueryKeys.shopSupport]];

export const useSupportMutations = () => ({
  reply: useMutationQuery<{ id: string; text: string }, IThread>(
    (body) => `${ApiRoutes.shopSupportReply}/${body.id}`,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  close: useMutationQuery<{ id: string }, IThread>(
    (body) => `${ApiRoutes.shopSupportClose}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: INVALIDATE },
  ),
});

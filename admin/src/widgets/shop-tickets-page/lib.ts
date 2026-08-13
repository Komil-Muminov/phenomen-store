import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { ITicketThread } from '@/entities/ticket';
import type { ITicketValues } from '@/features/ticket-form';

const INVALIDATE = [[QueryKeys.shopTickets]];

export const useShopTicketMutations = () => ({
  create: useMutationQuery<ITicketValues, ITicketThread>(
    () => ApiRoutes.shopTicketCreate,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
  reply: useMutationQuery<{ id: string; text: string }, ITicketThread>(
    (body) => `${ApiRoutes.shopTicketReply}/${body.id}`,
    { scope: 'shop', invalidate: INVALIDATE },
  ),
});

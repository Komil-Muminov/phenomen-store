import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { ITicketThread } from '@/entities/ticket';

const INVALIDATE = [[QueryKeys.platformTickets]];

export const usePlatformTicketMutations = () => ({
  reply: useMutationQuery<{ id: string; text: string }, ITicketThread>(
    (body) => `${ApiRoutes.platformTicketReply}/${body.id}`,
    { invalidate: INVALIDATE },
  ),
  close: useMutationQuery<{ id: string }, ITicketThread>(
    (body) => `${ApiRoutes.platformTicketClose}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
});

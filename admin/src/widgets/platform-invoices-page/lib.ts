import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { IInvoice } from '@/entities/invoice';
import type { IInvoiceValues } from '@/features/invoice-form';
import type { IPlatformSettings } from '@/widgets/platform-invoices-page/model';

const INVALIDATE = [[QueryKeys.platformInvoices]];

export const useInvoiceMutations = () => ({
  create: useMutationQuery<IInvoiceValues, IInvoice>(
    () => ApiRoutes.platformInvoiceCreate,
    { invalidate: INVALIDATE },
  ),
  review: useMutationQuery<{ id: string; accepted: boolean; note: string }, IInvoice>(
    (body) => `${ApiRoutes.platformInvoiceReview}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  cancel: useMutationQuery<{ id: string }, IInvoice>(
    (body) => `${ApiRoutes.platformInvoiceCancel}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  saveCard: useMutationQuery<IPlatformSettings['card'], IPlatformSettings>(
    () => ApiRoutes.platformInvoiceSettings,
    { method: 'patch', invalidate: [[QueryKeys.platformCard]] },
  ),
});

import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import type { IAddress, IAddressList, IAddressValues } from '@/entities/address';

const INVALIDATE = [[QueryKeys.addresses]];

export interface IAddressPatch extends IAddressValues {
  id: string;
}

export const useAddressMutations = () => ({
  create: useMutationQuery<IAddressValues, IAddress>(
    () => ApiRoutes.addressesCreate,
    { invalidate: INVALIDATE },
  ),
  update: useMutationQuery<IAddressPatch, IAddress>(
    (body) => `${ApiRoutes.addressesUpdate}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
  remove: useMutationQuery<{ id: string }, IAddressList>(
    (body) => `${ApiRoutes.addressesDelete}/${body.id}`,
    { method: 'delete', invalidate: INVALIDATE },
  ),
  makeDefault: useMutationQuery<{ id: string }, IAddressList>(
    (body) => `${ApiRoutes.addressesDefault}/${body.id}`,
    { method: 'patch', invalidate: INVALIDATE },
  ),
});

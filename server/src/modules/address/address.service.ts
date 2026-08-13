import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import {
  countAddresses,
  deleteAddressRow,
  insertAddress,
  selectAddressById,
  selectAddresses,
  setDefaultAddress,
  updateAddressRow,
} from '@/modules/address/address.db';
import {
  AddressErrors,
  AddressLimits,
  IAddressInput,
  IAddressRow,
  formatAddressLine,
} from '@/modules/address/types';

const mapAddress = (row: IAddressRow) => ({
  id: row.id,
  title: row.title,
  city: row.city,
  street: row.street,
  house: row.house,
  apartment: row.apartment,
  postalCode: row.postal_code,
  comment: row.comment,
  isDefault: row.is_default,
  line: formatAddressLine(row),
  createdAt: row.created_at,
});

const optional = (value: unknown, max: number): string | null => (
  pickString(value).slice(0, max) || null
);

const buildInput = (payload: Record<string, unknown>): IAddressInput => {
  const city = pickString(payload.city).slice(0, AddressLimits.cityMax);
  const street = pickString(payload.street).slice(0, AddressLimits.streetMax);

  if (!city) {
    throw new AppError(AddressErrors.cityRequired, HttpStatus.badRequest);
  }

  if (!street) {
    throw new AppError(AddressErrors.streetRequired, HttpStatus.badRequest);
  }

  return {
    title: optional(payload.title, AddressLimits.titleMax),
    city,
    street,
    house: optional(payload.house, AddressLimits.houseMax),
    apartment: optional(payload.apartment, AddressLimits.apartmentMax),
    postalCode: optional(payload.postalCode, AddressLimits.postalCodeMax),
    comment: optional(payload.comment, AddressLimits.commentMax),
    isDefault: payload.isDefault === true,
  };
};

export const listAddresses = async (tenant: ITenantContext, userId: string) => ({
  items: (await selectAddresses(tenant.id, userId)).map(mapAddress),
});

export const resolveAddressLine = async (
  tenant: ITenantContext,
  userId: string,
  id: string,
): Promise<string> => {
  const row = await selectAddressById(tenant.id, userId, id);

  if (!row) {
    throw new AppError(AddressErrors.notFound, HttpStatus.notFound);
  }

  return formatAddressLine(row);
};

export const addAddress = async (
  tenant: ITenantContext,
  userId: string,
  payload: Record<string, unknown>,
) => {
  const input = buildInput(payload);
  const stored = await countAddresses(tenant.id, userId);

  if (stored >= AddressLimits.perUser) {
    throw new AppError(AddressErrors.tooMany, HttpStatus.conflict);
  }

  return mapAddress(await insertAddress(tenant.id, userId, {
    ...input,
    isDefault: input.isDefault || stored === 0,
  }));
};

export const editAddress = async (
  tenant: ITenantContext,
  userId: string,
  id: string,
  payload: Record<string, unknown>,
) => {
  const updated = await updateAddressRow(tenant.id, userId, id, buildInput(payload));

  if (!updated) {
    throw new AppError(AddressErrors.notFound, HttpStatus.notFound);
  }

  return mapAddress(updated);
};

export const removeAddress = async (tenant: ITenantContext, userId: string, id: string) => {
  if (await deleteAddressRow(tenant.id, userId, id) === 0) {
    throw new AppError(AddressErrors.notFound, HttpStatus.notFound);
  }

  const rest = await selectAddresses(tenant.id, userId);

  if (rest.length > 0 && !rest.some((row) => row.is_default)) {
    await setDefaultAddress(tenant.id, userId, rest[0].id);
  }

  return listAddresses(tenant, userId);
};

export const makeAddressDefault = async (
  tenant: ITenantContext,
  userId: string,
  id: string,
) => {
  if (await setDefaultAddress(tenant.id, userId, id) === 0) {
    throw new AppError(AddressErrors.notFound, HttpStatus.notFound);
  }

  return listAddresses(tenant, userId);
};

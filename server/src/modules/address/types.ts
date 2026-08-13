export const AddressPaths = {
  search: '/search',
  create: '/create',
  update: '/update/:id',
  delete: '/delete/:id',
  makeDefault: '/default/:id',
} as const;

export const AddressLimits = {
  titleMax: 60,
  cityMax: 80,
  streetMax: 160,
  houseMax: 20,
  apartmentMax: 20,
  postalCodeMax: 20,
  commentMax: 300,
  perUser: 10,
} as const;

export const AddressErrors = {
  cityRequired: 'Укажите город',
  streetRequired: 'Укажите улицу',
  notFound: 'Адрес не найден',
  tooMany: `Можно сохранить не больше ${AddressLimits.perUser} адресов`,
} as const;

export interface IAddressRow {
  id: string;
  title: string | null;
  city: string;
  street: string;
  house: string | null;
  apartment: string | null;
  postal_code: string | null;
  comment: string | null;
  is_default: boolean;
  created_at: string;
}

export interface IAddressInput {
  title: string | null;
  city: string;
  street: string;
  house: string | null;
  apartment: string | null;
  postalCode: string | null;
  comment: string | null;
  isDefault: boolean;
}

export const formatAddressLine = (row: IAddressRow): string => [
  row.city,
  row.street,
  row.house ? `д. ${row.house}` : '',
  row.apartment ? `кв. ${row.apartment}` : '',
].filter(Boolean).join(', ');

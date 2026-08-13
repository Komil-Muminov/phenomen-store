export interface IAddress {
  id: string;
  title: string | null;
  city: string;
  street: string;
  house: string | null;
  apartment: string | null;
  postalCode: string | null;
  comment: string | null;
  isDefault: boolean;
  line: string;
  createdAt: string;
}

export interface IAddressList {
  items: IAddress[];
}

export interface IAddressValues {
  title: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  comment: string;
}

export const EMPTY_ADDRESS: IAddressValues = {
  title: '',
  city: '',
  street: '',
  house: '',
  apartment: '',
  comment: '',
};

export const AddressLabels = {
  title: 'Название (дом, работа)',
  city: 'Город',
  street: 'Улица',
  house: 'Дом',
  apartment: 'Квартира',
  comment: 'Как добраться',
} as const;

export const toValues = (address: IAddress): IAddressValues => ({
  title: address.title ?? '',
  city: address.city,
  street: address.street,
  house: address.house ?? '',
  apartment: address.apartment ?? '',
  comment: address.comment ?? '',
});

export const validateAddress = (
  values: IAddressValues,
): Partial<Record<keyof IAddressValues, string>> => {
  const errors: Partial<Record<keyof IAddressValues, string>> = {};

  if (values.city.trim().length < 2) {
    errors.city = 'Укажите город';
  }

  if (values.street.trim().length < 2) {
    errors.street = 'Укажите улицу';
  }

  return errors;
};

export const formatAddressTitle = (address: IAddress): string => (
  address.title?.trim() || address.line
);

export interface IProfileValues {
  name: string;
  lastName: string;
  phone: string;
}

export const EMPTY_PROFILE: IProfileValues = { name: '', lastName: '', phone: '' };

export const ProfileFormTexts = {
  welcomeTitle: 'Расскажите о себе',
  welcomeSubtitle: 'Продавец свяжется с вами по этим данным, когда заказ будет готов',
  editTitle: 'Личные данные',
  nameLabel: 'Имя',
  namePlaceholder: 'Иван',
  lastNameLabel: 'Фамилия',
  lastNamePlaceholder: 'Петров',
  phoneLabel: 'Телефон',
  phonePlaceholder: '+992 900 11 22 33',
  submit: 'Сохранить',
  saved: 'Данные сохранены',
} as const;

const NATIONAL_LENGTH = 9;

const COUNTRY_CODE = '992';

export const cleanPhoneDigits = (raw: string): string => raw.replace(/\D/g, '');

export const extractNationalDigits = (raw: string): string => {
  const digits = cleanPhoneDigits(raw);
  const national = digits.startsWith(COUNTRY_CODE) ? digits.slice(COUNTRY_CODE.length) : digits;

  return national.slice(0, NATIONAL_LENGTH);
};

export const formatPhoneMask = (raw: string): string => {
  const national = extractNationalDigits(raw);

  if (national.length === 0) {
    return '';
  }

  const groups = [
    national.slice(0, 3),
    national.slice(3, 5),
    national.slice(5, 7),
    national.slice(7, 9),
  ].filter(Boolean);

  return `+${COUNTRY_CODE} ${groups.join(' ')}`;
};

export const isPhoneValid = (phone: string): boolean => (
  extractNationalDigits(phone).length === NATIONAL_LENGTH
);

export const isProfileValid = (values: IProfileValues): boolean => (
  values.name.trim().length > 0
  && values.lastName.trim().length > 0
  && isPhoneValid(values.phone)
);

export const toProfilePayload = (values: IProfileValues) => ({
  name: values.name.trim(),
  lastName: values.lastName.trim(),
  phone: `+${COUNTRY_CODE}${extractNationalDigits(values.phone)}`,
});

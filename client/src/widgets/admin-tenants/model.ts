export interface ITenant {
  id: string;
  key: string;
  name: string;
  vertical: string;
  plan: string;
  status: string;
  bundleId: string | null;
  createdAt: string;
}

export interface ITenantList {
  items: ITenant[];
  total: number;
  page: number;
  limit: number;
}

export interface IEnterResult {
  scope: 'platform' | 'shop';
  token: string;
  tenantKey: string;
  tenantName: string;
  user: { id: string; name: string | null; email: string | null; role: string };
}

export const TenantsTexts = {
  title: 'Магазины',
  empty: 'Магазинов пока нет',
  enter: 'Войти в магазин',
  activate: 'Включить',
  deactivate: 'Отключить',
  active: 'работает',
  disabled: 'отключён',
  loadMore: 'Показать ещё',
} as const;

export interface ITenantStaff {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export interface ITenantFormValues {
  key: string;
  name: string;
  vertical: string;
  plan: string;
  bundleId: string;
  ownerName: string;
  ownerLogin: string;
  ownerPassword: string;
}

export interface IStaffFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const TenantVerticals = ['fashion', 'grocery', 'electronics', 'universal'] as const;

export const TenantPlans = ['start', 'pro', 'enterprise'] as const;

export const EMPTY_TENANT: ITenantFormValues = {
  key: '',
  name: '',
  vertical: 'universal',
  plan: 'start',
  bundleId: '',
  ownerName: '',
  ownerLogin: '',
  ownerPassword: '',
};

export const EMPTY_STAFF: IStaffFormValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

export const FormTexts = {
  createTitle: 'Новый магазин',
  editTitle: 'Настройки магазина',
  keyLabel: 'Ключ магазина',
  keyHint: 'Латиница, цифры и дефис, минимум 3 символа. Потом не меняется',
  nameLabel: 'Название',
  verticalLabel: 'Вертикаль',
  planLabel: 'Тариф',
  bundleLabel: 'Bundle ID',
  ownerBlock: 'Владелец',
  ownerNameLabel: 'Имя',
  ownerLoginLabel: 'Email или телефон',
  ownerPasswordLabel: 'Пароль',
  ownerHint: 'Можно оставить пустым и добавить владельца позже',
  save: 'Сохранить',
  cancel: 'Отмена',
  staffTitle: 'Сотрудники',
  staffEmpty: 'Сотрудников пока нет',
  staffAdd: 'Добавить владельца',
  staffEditTitle: 'Сотрудник магазина',
  passwordHint: 'Пусто — пароль не меняется',
  deleteTitle: 'Удалить магазин?',
  deleteHint: 'Введите ключ магазина, чтобы подтвердить. Исчезнут товары, заказы и сотрудники.',
  deleteConfirm: 'Удалить магазин',
  keyMismatch: 'Ключ не совпадает',
} as const;

export const KEY_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export const OWNER_PASSWORD_MIN_LENGTH = 6;

export type TTenantFormField = keyof ITenantFormValues;

export const TenantFormErrors = {
  keyRequired: 'Укажите ключ магазина',
  keyInvalid: 'Минимум 3 символа: латиница, цифры и дефис',
  nameRequired: 'Укажите название магазина',
  ownerLoginRequired: 'Укажите почту владельца',
  ownerPasswordRequired: 'Придумайте пароль владельца',
  ownerPasswordShort: `Пароль не короче ${OWNER_PASSWORD_MIN_LENGTH} символов`,
} as const;

export const validateTenantForm = (
  values: ITenantFormValues,
  editing: boolean,
): Partial<Record<TTenantFormField, string>> => {
  const errors: Partial<Record<TTenantFormField, string>> = {};
  const key = values.key.trim();
  const hasOwner = Boolean(
    values.ownerName.trim() || values.ownerLogin.trim() || values.ownerPassword,
  );

  if (!values.name.trim()) {
    errors.name = TenantFormErrors.nameRequired;
  }

  if (!editing && !key) {
    errors.key = TenantFormErrors.keyRequired;
  }

  if (!editing && key && !KEY_PATTERN.test(key)) {
    errors.key = TenantFormErrors.keyInvalid;
  }

  if (!editing && hasOwner && !values.ownerLogin.trim()) {
    errors.ownerLogin = TenantFormErrors.ownerLoginRequired;
  }

  if (!editing && hasOwner && !values.ownerPassword) {
    errors.ownerPassword = TenantFormErrors.ownerPasswordRequired;
  }

  if (!editing && values.ownerPassword && values.ownerPassword.length < OWNER_PASSWORD_MIN_LENGTH) {
    errors.ownerPassword = TenantFormErrors.ownerPasswordShort;
  }

  return errors;
};

export const toTenantForm = (tenant: ITenant): ITenantFormValues => ({
  ...EMPTY_TENANT,
  key: tenant.key,
  name: tenant.name,
  vertical: tenant.vertical,
  plan: tenant.plan,
  bundleId: tenant.bundleId ?? '',
});

export const toCreatePayload = (values: ITenantFormValues) => ({
  key: values.key.trim().toLowerCase(),
  name: values.name.trim(),
  vertical: values.vertical,
  plan: values.plan,
  bundleId: values.bundleId.trim() || undefined,
  ownerName: values.ownerName.trim() || undefined,
  ownerLogin: values.ownerLogin.trim() || undefined,
  ownerPassword: values.ownerPassword || undefined,
});

export const toUpdatePayload = (values: ITenantFormValues) => ({
  name: values.name.trim(),
  vertical: values.vertical,
  plan: values.plan,
  bundleId: values.bundleId.trim(),
});

export const toStaffPayload = (values: IStaffFormValues, withPassword: boolean) => ({
  name: values.name.trim(),
  email: values.email.trim() || undefined,
  phone: values.phone.trim() || undefined,
  ...(withPassword && values.password ? { password: values.password } : {}),
});

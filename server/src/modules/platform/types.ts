export const PlatformPaths = {
  login: '/auth/login',
  tenantSearch: '/tenants/search',
  tenantCreate: '/tenants/create',
  tenantUpdate: '/tenants/update/:id',
  tenantDeactivate: '/tenants/deactivate/:id',
  ownerCreate: '/tenants/owner/create/:id',
  passwordUpdate: '/auth/password/update',
  signin: '/auth/signin',
} as const;

export const PlatformActions = {
  login: 'auth.login',
  tenantCreate: 'tenant.create',
  tenantUpdate: 'tenant.update',
  tenantDeactivate: 'tenant.deactivate',
  ownerCreate: 'tenant.owner.create',
  passwordUpdate: 'auth.password.update',
} as const;

export const PlatformErrors = {
  invalidCredentials: 'Неверный логин или пароль',
  accountDisabled: 'Учётная запись отключена',
  keyTaken: 'Магазин с таким ключом уже существует',
  loginTaken: 'Пользователь с таким логином уже существует',
  tenantMissing: 'Магазин не найден',
  currentPasswordWrong: 'Текущий пароль указан неверно',
  passwordTooShort: 'Пароль должен быть не короче 8 символов',
  passwordSame: 'Новый пароль совпадает с текущим',
} as const;

export const PASSWORD_MIN_LENGTH = 8;

export const TenantStatuses = {
  active: 'active',
  disabled: 'disabled',
} as const;

export const TENANT_UPDATABLE_FIELDS = ['name', 'vertical', 'plan', 'bundleId'] as const;

export const SALT_ROUNDS = 10;

export interface IPlatformUserRow {
  id: string;
  login: string;
  password_hash: string;
  name: string;
  role: string;
  status: string;
}

export interface ITenantSummary {
  id: string;
  key: string;
  name: string;
  vertical: string;
  plan: string;
  status: string;
  bundleId: string | null;
  createdAt: string;
}

export interface ICreateTenantPayload {
  key: string;
  name: string;
  vertical?: string;
  plan?: string;
  bundleId?: string;
}

export interface ICreateOwnerPayload {
  phone?: string;
  email?: string;
  password: string;
  name: string;
}

export interface IAuditEntry {
  actorId: string;
  actorLogin: string;
  action: string;
  tenantId?: string | null;
  payload?: Record<string, unknown>;
  ip?: string | null;
}

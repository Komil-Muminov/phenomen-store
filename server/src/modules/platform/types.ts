export const PlatformPaths = {
  login: '/auth/login',
  tenantSearch: '/tenants/search',
  tenantCreate: '/tenants/create',
  tenantUpdate: '/tenants/update/:id',
  tenantDeactivate: '/tenants/deactivate/:id',
  tenantActivate: '/tenants/activate/:id',
  tenantDelete: '/tenants/delete/:id',
  ownerCreate: '/tenants/owner/create/:id',
  ownerSearch: '/tenants/owner/search/:id',
  ownerUpdate: '/tenants/owner/update/:id/:staffId',
  ownerDelete: '/tenants/owner/delete/:id/:staffId',
  passwordUpdate: '/auth/password/update',
  signin: '/auth/signin',
  auditSearch: '/audit/search',
  auditActions: '/audit/actions',
} as const;

export const PlatformActions = {
  login: 'auth.login',
  tenantCreate: 'tenant.create',
  tenantUpdate: 'tenant.update',
  tenantDeactivate: 'tenant.deactivate',
  tenantActivate: 'tenant.activate',
  tenantDelete: 'tenant.delete',
  ownerCreate: 'tenant.owner.create',
  ownerUpdate: 'tenant.owner.update',
  ownerDelete: 'tenant.owner.delete',
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
  keyMismatch: 'Введите ключ магазина точно так, как он указан в таблице',
  staffMissing: 'Сотрудник магазина не найден',
  staffLastOwner: 'Нельзя удалить единственного владельца магазина',
  staffContactRequired: 'Нужен email или телефон для входа',
} as const;

export interface ITenantStaffRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
}

export interface IUpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: string;
}

export const PASSWORD_MIN_LENGTH = 8;

export const OWNER_PASSWORD_MIN_LENGTH = 6;

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
  ownerLogin?: string;
  ownerName?: string;
  ownerPassword?: string;
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

export const AppRoutes = {
  login: '/login',
  tenants: '/tenants',
  root: '/',
} as const;

export const ApiRoutes = {
  platformLogin: '/platform/auth/login',
  tenantsSearch: '/platform/tenants/search',
  tenantsCreate: '/platform/tenants/create',
  tenantsUpdate: '/platform/tenants/update',
  tenantsDeactivate: '/platform/tenants/deactivate',
  tenantsOwnerCreate: '/platform/tenants/owner/create',
} as const;

export const QueryKeys = {
  tenants: 'tenants',
} as const;

export const StorageKeys = {
  token: 'phenomen_platform_token',
  admin: 'phenomen_platform_admin',
} as const;

export const StaleTimeMs = {
  short: 30_000,
  long: 300_000,
} as const;

export const RequestTimeoutMs = 20_000;

export const AuthHeader = 'Authorization';

export const AuthScheme = 'Bearer ';

export const Pagination = {
  defaultPage: 1,
  defaultLimit: 20,
} as const;

export const TenantStatuses = {
  active: 'active',
  disabled: 'disabled',
} as const;

export const TenantPlans = ['start', 'pro', 'enterprise'] as const;

export const TenantVerticals = ['fashion', 'grocery', 'electronics', 'universal'] as const;

export const UiMessages = {
  loadError: 'Не удалось загрузить данные',
  loginError: 'Не удалось войти',
  createdTenant: 'Магазин создан',
  updatedTenant: 'Изменения сохранены',
  deactivatedTenant: 'Магазин отключён',
  createdOwner: 'Владелец добавлен',
  emptyTenants: 'Магазинов пока нет',
  required: 'Обязательное поле',
} as const;

export const Env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
} as const;

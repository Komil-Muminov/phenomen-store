export const AppRoutes = {
  login: '/login',
  tenants: '/tenants',
  shopLogin: '/shop/login',
  shopOrders: '/shop/orders',
  shopProducts: '/shop/products',
  shopStock: '/shop/stock',
  root: '/',
} as const;

export const ApiRoutes = {
  signin: '/platform/auth/signin',
  platformLogin: '/platform/auth/login',
  tenantsSearch: '/platform/tenants/search',
  tenantsCreate: '/platform/tenants/create',
  tenantsUpdate: '/platform/tenants/update',
  tenantsDeactivate: '/platform/tenants/deactivate',
  tenantsOwnerCreate: '/platform/tenants/owner/create',
  shopLogin: '/auth/login',
  shopOrdersSearch: '/orders/manage/search',
  shopOrderStatus: '/orders/status',
  shopProductsSearch: '/products/manage/search',
  shopProductCreate: '/products/create',
  shopProductUpdate: '/products/update',
  shopProductDeactivate: '/products/deactivate',
  shopCategoriesSearch: '/categories/search',
  shopAttributesSearch: '/attributes/search',
  shopStockSearch: '/products/stock/search',
  shopStockUpdate: '/products/stock/update',
  shopProductDuplicate: '/products/duplicate',
} as const;

export const QueryKeys = {
  tenants: 'tenants',
  shopOrders: 'shop-orders',
  shopProducts: 'shop-products',
  shopCategories: 'shop-categories',
  shopAttributes: 'shop-attributes',
  shopStock: 'shop-stock',
} as const;

export const StorageKeys = {
  token: 'phenomen_platform_token',
  admin: 'phenomen_platform_admin',
  shopToken: 'phenomen_shop_token',
  shopUser: 'phenomen_shop_user',
  shopTenant: 'phenomen_shop_tenant',
} as const;

export const TenantHeader = 'X-Tenant-Key';

export const OrderStatuses = [
  'created',
  'confirmed',
  'assembling',
  'delivering',
  'completed',
  'cancelled',
] as const;

export const OrderStatusLabels: Record<string, string> = {
  created: 'создан',
  confirmed: 'подтверждён',
  assembling: 'сборка',
  delivering: 'доставка',
  completed: 'выполнен',
  cancelled: 'отменён',
};

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

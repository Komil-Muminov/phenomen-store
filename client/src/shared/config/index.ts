import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const Env = {
  apiUrl: extra.apiUrl ?? 'http://localhost:4000',
  tenantKey: extra.tenantKey ?? 'demo-fashion',
} as const;

export const ApiRoutes = {
  tenantConfig: '/tenants/config',
  storefrontLayout: '/storefront/layout',
  productsSearch: '/products/search',
  productsFacets: '/products/facets',
  popularSearches: '/products/popular-searches',
  productGet: '/products/get',
  categoriesSearch: '/categories/search',
  cartGet: '/cart/get',
  cartUpdate: '/cart/update',
  cartClear: '/cart/clear',
  cartPromo: '/cart/promo',
  ordersCreate: '/orders/create',
  ordersSearch: '/orders/search',
  ordersCancel: '/orders/cancel',
  authCode: '/auth/code',
  authVerify: '/auth/verify',
  authProfile: '/auth/profile',
  authUpdate: '/auth/update',
  authEmailCode: '/auth/email/code',
  authEmailUpdate: '/auth/email/update',
  reviewsGet: '/reviews/get',
  reviewsAdd: '/reviews/add',
  wishlistGet: '/wishlist/get',
  wishlistToggle: '/wishlist/toggle',
  notificationsSearch: '/notifications/search',
  notificationsDelete: '/notifications/delete',
  notificationsClearAll: '/notifications/clear-all',
  notificationsMarkRead: '/notifications/read',
  notificationsReadAll: '/notifications/read-all',
  staffSignin: '/platform/auth/signin',
  tenantsSearch: '/platform/tenants/search',
  platformAudit: '/platform/audit/search',
  tenantsCreate: '/platform/tenants/create',
  tenantsUpdate: '/platform/tenants/update',
  tenantsActivate: '/platform/tenants/activate',
  tenantsDeactivate: '/platform/tenants/deactivate',
  tenantsDelete: '/platform/tenants/delete',
  tenantsEnter: '/platform/tenants/enter',
  tenantsStaffSearch: '/platform/tenants/owner/search',
  tenantsStaffUpdate: '/platform/tenants/owner/update',
  manageOrders: '/orders/manage/search',
  manageOrderStatus: '/orders/status',
  manageProducts: '/products/manage/search',
  manageProductCreate: '/products/create',
  manageProductUpdate: '/products/update',
  manageProductDeactivate: '/products/deactivate',
  manageProductDuplicate: '/products/duplicate',
  manageProductImport: '/products/import',
  manageStock: '/products/stock/search',
  manageStockUpdate: '/products/stock/update',
  manageBanners: '/banners/manage/search',
  manageBannerCreate: '/banners/create',
  manageBannerUpdate: '/banners/update',
  manageBannerDelete: '/banners/delete',
  manageBannerReorder: '/banners/reorder',
  manageCategoryCreate: '/categories/create',
  manageCategoryUpdate: '/categories/update',
  manageCategoryDelete: '/categories/delete',
  manageAttributeCreate: '/attributes/create',
  manageAttributeUpdate: '/attributes/update',
  manageAttributeDelete: '/attributes/delete',
  manageConfig: '/tenants/config',
  managePasswordUpdate: '/auth/password/update',
  manageMediaUpload: '/media/upload',
  manageCategories: '/categories/search',
  manageAttributes: '/attributes/search',
} as const;

export const AppRoutes = {
  home: '/',
  catalog: '/catalog',
  product: '/product',
  cart: '/cart',
  checkout: '/checkout',
  orderSuccess: '/order-success',
  profile: '/profile',
  wishlist: '/wishlist',
  notifications: '/notifications',
  admin: '/admin',
  adminTenants: '/admin/tenants',
  adminOrders: '/admin/orders',
  adminProducts: '/admin/products',
  adminStock: '/admin/stock',
  adminBanners: '/admin/banners',
  adminSettings: '/admin/settings',
  adminAudit: '/admin/audit',
  adminStaff: '/admin/staff',
} as const;

export const QueryKeys = {
  tenantConfig: 'tenant-config',
  storefrontLayout: 'storefront-layout',
  products: 'products',
  product: 'product',
  categories: 'categories',
  cart: 'cart',
  orders: 'orders',
  profile: 'profile',
  notifications: 'notifications',
  adminTenants: 'admin-tenants',
  adminStaff: 'admin-staff',
  adminAudit: 'admin-audit',
  adminOrders: 'admin-orders',
  adminProducts: 'admin-products',
  adminAttributes: 'admin-attributes',
  adminStock: 'admin-stock',
  adminBanners: 'admin-banners',
  adminConfig: 'admin-config',
} as const;

export const ManageOrderStatuses = [
  { value: 'created', label: 'создан' },
  { value: 'confirmed', label: 'подтверждён' },
  { value: 'assembling', label: 'сборка' },
  { value: 'delivering', label: 'доставка' },
  { value: 'completed', label: 'выполнен' },
  { value: 'cancelled', label: 'отменён' },
] as const;

export const ManageListLimit = 10;

export const SearchDebounceMs = 400;

export const ManageUnits = [
  { value: 'piece', label: 'шт' },
  { value: 'kg', label: 'кг' },
  { value: 'liter', label: 'л' },
  { value: 'pack', label: 'упак' },
  { value: 'meter', label: 'м' },
] as const;

export const EntityStatuses = {
  active: 'active',
  disabled: 'disabled',
} as const;

export const StaffScopes = {
  platform: 'platform',
  shop: 'shop',
} as const;

export const StaffTexts = {
  title: 'Вход в управление',
  subtitle: 'Введите пароль от учётной записи сотрудника',
  back: 'Назад',
  loginLabel: 'Логин',
  loginPlaceholder: 'km или owner@shop.ru',
  passwordLabel: 'Пароль',
  passwordPlaceholder: 'Введите пароль',
  submit: 'Войти',
  emptyFields: 'Заполните логин и пароль',
  platformTitle: 'Платформа',
  shopTitle: 'Кабинет магазина',
  logout: 'Выйти из управления',
} as const;

export const TenantHeader = 'X-Tenant-Key';

export const GuestHeader = 'X-Guest-Key';

export const IdempotencyHeader = 'X-Idempotency-Key';

export const RequestTimeoutMs = 15000;

export const StaleTimeMs = {
  short: 30000,
  medium: 300000,
  long: 3600000,
} as const;

export const UiMessages = {
  loading: 'Загружаем магазин',
  loadError: 'Не удалось загрузить данные',
  retry: 'Повторить',
  emptyList: 'Пока пусто',
  networkError: 'Нет связи с интернетом. Проверьте подключение и повторите',
  timeoutError: 'Сервер долго не отвечает. Попробуйте ещё раз',
  authError: 'Нужно войти в аккаунт, чтобы продолжить',
  forbiddenError: 'Этот раздел вам недоступен',
  notFoundError: 'Мы не нашли эти данные',
  serverError: 'На сервере неполадки. Попробуйте позже',
} as const;

export const HttpStatus = {
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500,
} as const;

export const TimeoutCodes: string[] = ['ECONNABORTED', 'ETIMEDOUT'];

export const StatusMessages: Record<number, string> = {
  [HttpStatus.unauthorized]: UiMessages.authError,
  [HttpStatus.forbidden]: UiMessages.forbiddenError,
  [HttpStatus.notFound]: UiMessages.notFoundError,
};

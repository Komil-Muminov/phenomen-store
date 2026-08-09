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
  reviewsGet: '/reviews/get',
  reviewsAdd: '/reviews/add',
  wishlistGet: '/wishlist/get',
  wishlistToggle: '/wishlist/toggle',
  notificationsGet: '/notifications/get',
  notificationsDelete: '/notifications/delete',
  notificationsClearAll: '/notifications/clear-all',
  notificationsMarkRead: '/notifications/read',
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

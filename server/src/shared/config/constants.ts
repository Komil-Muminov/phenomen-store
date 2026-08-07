export const ApiRoutes = {
  platform: '/platform',
  tenants: '/tenants',
  storefront: '/storefront',
  catalog: '/products',
  categories: '/categories',
  attributes: '/attributes',
  media: '/media',
  cart: '/cart',
  orders: '/orders',
  auth: '/auth',
  reviews: '/reviews',
  wishlist: '/wishlist',
  notifications: '/notifications',
  health: '/health',
} as const;

export const ApiActions = {
  search: '/search',
  get: '/get/:id',
  create: '/create',
  update: '/update/:id',
  delete: '/delete/:id',
  deactivate: '/deactivate/:id',
  config: '/config',
  layout: '/layout',
} as const;

export const HttpStatus = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  serverError: 500,
} as const;

export const TenantHeader = 'x-tenant-key';

export const GuestHeader = 'x-guest-key';

export const IdempotencyHeader = 'x-idempotency-key';

export const AuthHeader = 'authorization';

export const AuthScheme = 'Bearer ';

export const UserRoles = {
  customer: 'customer',
  manager: 'manager',
  admin: 'admin',
  owner: 'owner',
  platform: 'platform',
} as const;

export const PlatformRoles = {
  operator: 'operator',
  superadmin: 'superadmin',
} as const;

export const ErrorMessages = {
  tenantRequired: 'Магазин не определён',
  tenantNotFound: 'Магазин не найден или отключён',
  unauthorized: 'Требуется авторизация',
  forbidden: 'Недостаточно прав',
  notFound: 'Ресурс не найден',
  invalidPayload: 'Некорректные данные запроса',
  internal: 'Внутренняя ошибка сервера',
} as const;

export const Pagination = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
} as const;

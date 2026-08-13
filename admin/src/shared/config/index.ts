export const AppRoutes = {
  login: '/login',
  tenants: '/tenants',
  audit: '/audit',
  shopLogin: '/shop/login',
  shopStats: '/shop/stats',
  shopOrders: '/shop/orders',
  shopProducts: '/shop/products',
  shopStock: '/shop/stock',
  shopBanners: '/shop/banners',
  shopPromotions: '/shop/promotions',
  shopSupport: '/shop/support',
  shopSettings: '/shop/settings',
  root: '/',
} as const;

export const ApiRoutes = {
  signin: '/platform/auth/signin',
  platformLogin: '/platform/auth/login',
  tenantsSearch: '/platform/tenants/search',
  tenantsCreate: '/platform/tenants/create',
  tenantsUpdate: '/platform/tenants/update',
  tenantsDeactivate: '/platform/tenants/deactivate',
  tenantsActivate: '/platform/tenants/activate',
  tenantsDelete: '/platform/tenants/delete',
  tenantsEnter: '/platform/tenants/enter',
  tenantsStaffSearch: '/platform/tenants/owner/search',
  tenantsStaffUpdate: '/platform/tenants/owner/update',
  platformAudit: '/platform/audit/search',
  platformAuditActions: '/platform/audit/actions',
  shopLogin: '/auth/login',
  shopStatsOverview: '/stats/overview',
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
  shopProductImport: '/products/import',
  shopProductsBulk: '/products/bulk/update',
  shopProductsExport: '/products/export',
  shopAttributeCreate: '/attributes/create',
  shopAttributeUpdate: '/attributes/update',
  shopCategoryCreate: '/categories/create',
  shopCategoryUpdate: '/categories/update',
  shopCategoryDelete: '/categories/delete',
  shopPromotionsSearch: '/promotions/manage/search',
  shopPromotionCreate: '/promotions/create',
  shopPromotionUpdate: '/promotions/update',
  shopPromotionDelete: '/promotions/delete',
  shopBannersManage: '/banners/manage/search',
  shopBannerCreate: '/banners/create',
  shopBannerUpdate: '/banners/update',
  shopBannerDeactivate: '/banners/deactivate',
  shopBannerDelete: '/banners/delete',
  shopBannerReorder: '/banners/reorder',
  shopSupportSearch: '/support/manage/search',
  shopSupportGet: '/support/manage/get',
  shopSupportReply: '/support/manage/reply',
  shopSupportClose: '/support/manage/close',
  shopConfig: '/tenants/config',
  shopPasswordUpdate: '/auth/password/update',
  shopAttributeDelete: '/attributes/delete',
  shopMediaUpload: '/media/upload',
} as const;

export const QueryKeys = {
  tenants: 'tenants',
  tenantStaff: 'tenant-staff',
  audit: 'audit',
  shopStats: 'shop-stats',
  shopOrders: 'shop-orders',
  shopProducts: 'shop-products',
  shopCategories: 'shop-categories',
  shopBanners: 'shop-banners',
  shopPromotions: 'shop-promotions',
  shopAttributes: 'shop-attributes',
  shopStock: 'shop-stock',
  shopConfig: 'shop-config',
  shopSupport: 'shop-support',
} as const;

export const ProductUnits = [
  { value: 'piece', label: 'штука', short: 'шт' },
  { value: 'kg', label: 'килограмм', short: 'кг' },
  { value: 'liter', label: 'литр', short: 'л' },
  { value: 'pack', label: 'упаковка', short: 'упак' },
  { value: 'meter', label: 'метр', short: 'м' },
] as const;

export const ImportColumns = [
  'name',
  'price',
  'oldPrice',
  'category',
  'brand',
  'description',
  'unit',
  'slug',
  'media',
] as const;

export const DeliveryMethods = [
  { value: 'courier', label: 'Курьером' },
  { value: 'pickup', label: 'Самовывоз' },
] as const;

export const PaymentMethods = [
  { value: 'card_online', label: 'Картой онлайн' },
  { value: 'cash_on_delivery', label: 'Наличными при получении' },
] as const;

export const BannerActionTypes = {
  none: 'none',
  category: 'category',
  product: 'product',
  link: 'link',
} as const;

export const BannerActionOptions = [
  { value: BannerActionTypes.none, label: 'Без перехода' },
  { value: BannerActionTypes.category, label: 'В категорию' },
  { value: BannerActionTypes.product, label: 'На товар' },
  { value: BannerActionTypes.link, label: 'На внешнюю ссылку' },
] as const;

export const BannerActionLabels: Record<string, string> = {
  none: 'без перехода',
  category: 'в категорию',
  product: 'на товар',
  link: 'внешняя ссылка',
};

export const BannerDefaults = {
  position: 100,
  positionStep: 10,
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

export const MediaAccept = '.jpg,.jpeg,.png,.webp,.gif';

export const MediaMaxSizeLabel = '5 МБ';

export const SearchDebounceMs = 400;

export const VisibilityOptions = [
  { value: 'all', label: 'Все' },
  { value: 'true', label: 'Показанные' },
  { value: 'false', label: 'Скрытые' },
];

export const ListLimits = {
  default: 10,
  stock: 10,
  banners: 10,
} as const;

export const AuthHeader = 'Authorization';

export const AuthScheme = 'Bearer ';

export const Pagination = {
  defaultPage: 1,
  defaultLimit: 20,
  auditLimit: 10,
} as const;

export const AuditActionLabels: Record<string, string> = {
  'auth.login': 'вход',
  'auth.password.update': 'смена пароля',
  'tenant.create': 'создан магазин',
  'tenant.update': 'изменён магазин',
  'tenant.deactivate': 'магазин отключён',
  'tenant.activate': 'магазин включён',
  'tenant.owner.create': 'добавлен владелец',
  'tenant.delete': 'магазин удалён',
  'tenant.enter': 'вход в кабинет магазина',
  'tenant.owner.update': 'изменён сотрудник',
  'shop.product.create': 'создан товар',
  'shop.product.update': 'изменён товар',
  'shop.product.deactivate': 'товар скрыт',
  'shop.product.duplicate': 'товар продублирован',
  'shop.product.import': 'импорт товаров',
  'shop.product.bulk': 'массовое изменение товаров',
  'shop.stock.update': 'изменён остаток',
  'shop.category.create': 'создана категория',
  'shop.category.update': 'изменена категория',
  'shop.category.delete': 'удалена категория',
  'shop.attribute.create': 'создана характеристика',
  'shop.attribute.update': 'изменена характеристика',
  'shop.attribute.delete': 'удалена характеристика',
  'shop.banner.create': 'создан баннер',
  'shop.banner.update': 'изменён баннер',
  'shop.banner.deactivate': 'баннер скрыт',
  'shop.banner.delete': 'удалён баннер',
  'shop.banner.reorder': 'изменён порядок баннеров',
  'shop.promotion.create': 'создана акция',
  'shop.promotion.update': 'изменена акция',
  'shop.promotion.delete': 'удалена акция',
  'shop.order.status': 'изменён статус заказа',
  'shop.config.update': 'изменены настройки магазина',
  'shop.support.reply': 'ответ на обращение',
  'shop.support.close': 'обращение закрыто',
};

export const StaffRoles = {
  owner: 'owner',
  admin: 'admin',
  manager: 'manager',
} as const;

export const StaffRoleLabels: Record<string, string> = {
  owner: 'владелец',
  admin: 'администратор',
  manager: 'менеджер',
};

export const EntityStatuses = {
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
  activatedTenant: 'Магазин включён',
  deletedTenant: 'Магазин удалён вместе со всеми данными',
  enteredShop: 'Вы в кабинете магазина',
  updatedStaff: 'Данные сотрудника обновлены',
  emptyStaff: 'Админ магазина не найден',
  emptyTenants: 'Магазинов пока нет',
  required: 'Обязательное поле',
  sessionExpired: 'Сессия истекла, войдите заново',
  networkError: 'Нет связи с сервером — проверьте интернет и адрес API',
  timeoutError: 'Сервер не ответил вовремя, попробуйте снова',
  forbiddenError: 'Недостаточно прав для этого действия',
  notFoundError: 'Данные не найдены',
  serverError: 'Ошибка на сервере, попробуйте позже',
  createdBanner: 'Баннер создан',
  updatedBanner: 'Баннер обновлён',
  hiddenBanner: 'Баннер скрыт',
  deletedBanner: 'Баннер удалён',
  reorderedBanners: 'Порядок баннеров сохранён',
  emptyBanners: 'Баннеров пока нет',
} as const;

export const HttpStatus = {
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500,
} as const;

export const TimeoutCodes: string[] = ['ECONNABORTED', 'ETIMEDOUT'];

export const StatusMessages: Record<number, string> = {
  [HttpStatus.unauthorized]: UiMessages.sessionExpired,
  [HttpStatus.forbidden]: UiMessages.forbiddenError,
  [HttpStatus.notFound]: UiMessages.notFoundError,
};

export const Env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
} as const;

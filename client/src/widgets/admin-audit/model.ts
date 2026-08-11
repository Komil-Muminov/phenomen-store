export interface IAuditEntry {
  id: string;
  actorLogin: string;
  action: string;
  tenantKey: string | null;
  payload: Record<string, unknown>;
  ip: string | null;
  createdAt: string;
}

export interface IAuditList {
  items: IAuditEntry[];
  total: number;
  page: number;
  limit: number;
}

export const AuditActionLabels: Record<string, string> = {
  'auth.login': 'вход',
  'auth.password.update': 'смена пароля',
  'tenant.create': 'создан магазин',
  'tenant.update': 'изменён магазин',
  'tenant.deactivate': 'магазин отключён',
  'tenant.activate': 'магазин включён',
  'tenant.delete': 'магазин удалён',
  'tenant.enter': 'вход в кабинет магазина',
  'tenant.owner.create': 'добавлен владелец',
  'tenant.owner.update': 'изменён сотрудник',
  'tenant.owner.delete': 'удалён сотрудник',
  'shop.product.create': 'создан товар',
  'shop.product.update': 'изменён товар',
  'shop.product.deactivate': 'товар скрыт',
  'shop.product.duplicate': 'товар продублирован',
  'shop.product.import': 'импорт товаров',
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
  'shop.order.status': 'изменён статус заказа',
  'shop.config.update': 'изменены настройки магазина',
};

export const AuditTexts = {
  title: 'Журнал действий',
  searchPlaceholder: 'Логин или магазин',
  empty: 'Записей пока нет',
  emptyFiltered: 'Ничего не найдено',
  loadMore: 'Показать ещё',
} as const;

export const formatMoment = (value: string): string => {
  if (!value) return '—';

  const isoStr = typeof value === 'string' ? value.replace(' ', 'T') : String(value);
  const date = new Date(isoStr);

  if (isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

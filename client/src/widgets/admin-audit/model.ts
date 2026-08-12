export { formatMoment } from '@/shared/lib';

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

export interface IAuditCategoryFilter {
  id: string;
  label: string;
  icon: string;
  actionPrefix?: string;
}

export const AuditCategoryFilters: IAuditCategoryFilter[] = [
  { id: 'all', label: 'Все события', icon: 'grid' },
  { id: 'auth', label: 'Авторизация', icon: 'shield', actionPrefix: 'auth' },
  { id: 'tenant', label: 'Магазины', icon: 'store', actionPrefix: 'tenant' },
  { id: 'product', label: 'Товары', icon: 'package', actionPrefix: 'shop.product' },
  { id: 'category', label: 'Категории', icon: 'list', actionPrefix: 'shop.category' },
  { id: 'banner', label: 'Баннеры', icon: 'zap', actionPrefix: 'shop.banner' },
  { id: 'config', label: 'Настройки', icon: 'sliders', actionPrefix: 'shop.config' },
];

export const AuditActionLabels: Record<string, string> = {
  'auth.login': 'Вход в систему',
  'auth.password.update': 'Смена пароля',
  'tenant.create': 'Создан магазин',
  'tenant.update': 'Обновлён магазин',
  'tenant.deactivate': 'Магазин отключён',
  'tenant.activate': 'Магазин включён',
  'tenant.delete': 'Магазин удалён',
  'tenant.enter': 'Вход в кабинет магазина',
  'tenant.owner.create': 'Добавлен владелец',
  'tenant.owner.update': 'Изменён сотрудник',
  'tenant.owner.delete': 'Удалён сотрудник',
  'shop.product.create': 'Создан товар',
  'shop.product.update': 'Изменён товар',
  'shop.product.deactivate': 'Товар скрыт',
  'shop.product.duplicate': 'Дублирован товар',
  'shop.product.import': 'Импорт товаров',
  'shop.stock.update': 'Изменён остаток',
  'shop.category.create': 'Создана категория',
  'shop.category.update': 'Изменена категория',
  'shop.category.delete': 'Удалена категория',
  'shop.attribute.create': 'Создана характеристика',
  'shop.attribute.update': 'Изменена характеристика',
  'shop.attribute.delete': 'Удалена характеристика',
  'shop.banner.create': 'Создан баннер',
  'shop.banner.update': 'Изменён баннер',
  'shop.banner.deactivate': 'Баннер скрыт',
  'shop.banner.delete': 'Удалён баннер',
  'shop.banner.reorder': 'Порядок баннеров',
  'shop.order.status': 'Статус заказа',
  'shop.config.update': 'Настройки магазина',
};

export const getActionStyle = (action: string) => {
  if (action.includes('delete') || action.includes('deactivate')) {
    return {
      icon: 'trash',
      iconBg: '#ffe4e6',
      iconColor: '#e11d48',
      badgeBg: '#fff1f2',
      badgeText: '#be123c',
      tag: 'Удаление',
    };
  }

  if (action.includes('create') || action.includes('activate')) {
    return {
      icon: 'plus',
      iconBg: '#d1fae5',
      iconColor: '#059669',
      badgeBg: '#ecfdf5',
      badgeText: '#047857',
      tag: 'Создание',
    };
  }

  if (action.includes('login') || action.includes('auth') || action.includes('enter')) {
    return {
      icon: 'shield',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeText: '#1d4ed8',
      tag: 'Доступ',
    };
  }

  if (action.includes('tenant') || action.includes('owner')) {
    return {
      icon: 'store',
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
      badgeBg: '#faf5ff',
      badgeText: '#7e22ce',
      tag: 'Магазин',
    };
  }

  if (action.includes('product') || action.includes('stock')) {
    return {
      icon: 'package',
      iconBg: '#e0e7ff',
      iconColor: '#4f46e5',
      badgeBg: '#eef2ff',
      badgeText: '#4338ca',
      tag: 'Товар',
    };
  }

  return {
    icon: 'edit',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    badgeBg: '#fffbeb',
    badgeText: '#b45309',
    tag: 'Изменение',
  };
};

export const AuditTexts = {
  title: 'Журнал действий',
  searchPlaceholder: 'Поиск по логину, магазину, IP...',
  empty: 'Записей пока нет',
  emptyFiltered: 'События не найдены',
  loadMore: 'Показать ещё',
  resetFilters: 'Сбросить фильтры',
} as const;



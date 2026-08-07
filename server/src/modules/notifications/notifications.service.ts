export interface INotificationItem {
  id: string;
  tenantId: string;
  title: string;
  text: string;
  time: string;
  kind: 'promo' | 'order' | 'system';
  unread: boolean;
  actionUrl?: string;
  createdAt: string;
}

const INITIAL_NOTIFICATIONS: Omit<INotificationItem, 'tenantId'>[] = [
  {
    id: 'n1',
    title: 'Закрытая распродажа PHENOMEN',
    text: 'Эксклюзивная скидка 15% на всю новую осеннюю коллекцию оверсайз курток и худи. Промокод: PHENOMEN15',
    time: '15 минут назад',
    kind: 'promo',
    unread: true,
    actionUrl: '/catalog',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Статус заказа #9821 обновлен',
    text: 'Ваш заказ передан в курьерскую службу доставки. Ожидайте звонка курьера за 30 минут.',
    time: '2 часа назад',
    kind: 'order',
    unread: true,
    actionUrl: '/profile',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'n3',
    title: 'Безопасный вход в профиль',
    text: 'Вы успешно авторизовались с нового устройства. Если это были не вы, немедленно свяжитесь с поддержкой.',
    time: 'Вчера, 18:40',
    kind: 'system',
    unread: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n4',
    title: 'Новое поступление: Кроссовки Street',
    text: 'Ограниченная серия премиальных кожаных кроссовок уже в наличии в каталоге.',
    time: '3 дня назад',
    kind: 'promo',
    unread: false,
    actionUrl: '/catalog',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const tenantStore: Record<string, INotificationItem[]> = {};

const getTenantNotifications = (tenantId: string): INotificationItem[] => {
  if (!tenantStore[tenantId]) {
    tenantStore[tenantId] = INITIAL_NOTIFICATIONS.map((item) => ({
      ...item,
      tenantId,
    }));
  }
  return tenantStore[tenantId];
};

export const getNotifications = async (
  tenantId: string,
  kind?: string,
  page: number = 1,
  limit: number = 20,
) => {
  const all = getTenantNotifications(tenantId);
  const filtered = (kind && kind !== 'all')
    ? all.filter((n) => n.kind === kind)
    : all;

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    items: paginated,
    total: filtered.length,
    unreadCount: all.filter((n) => n.unread).length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
};

export const deleteNotification = async (tenantId: string, id: string) => {
  const all = getTenantNotifications(tenantId);
  tenantStore[tenantId] = all.filter((n) => n.id !== id);
  return { success: true };
};

export const clearAllNotifications = async (tenantId: string) => {
  tenantStore[tenantId] = [];
  return { success: true };
};

export const markNotificationRead = async (tenantId: string, id: string) => {
  const all = getTenantNotifications(tenantId);
  const item = all.find((n) => n.id === id);
  if (item) {
    item.unread = false;
  }
  return { success: true };
};

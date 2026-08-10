export interface ITenant {
  id: string;
  key: string;
  name: string;
  vertical: string;
  plan: string;
  status: string;
  bundleId: string | null;
  createdAt: string;
}

export interface ITenantList {
  items: ITenant[];
  total: number;
  page: number;
  limit: number;
}

export interface IEnterResult {
  scope: 'platform' | 'shop';
  token: string;
  tenantKey: string;
  tenantName: string;
  user: { id: string; name: string | null; email: string | null; role: string };
}

export const TenantsTexts = {
  title: 'Магазины',
  empty: 'Магазинов пока нет',
  enter: 'Войти в магазин',
  activate: 'Включить',
  deactivate: 'Отключить',
  active: 'работает',
  disabled: 'отключён',
  loadMore: 'Показать ещё',
} as const;

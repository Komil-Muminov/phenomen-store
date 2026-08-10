export interface IAdminSection {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

export const AdminTexts = {
  platformTitle: 'Платформа',
  shopTitle: 'Кабинет магазина',
  platformSubtitle: 'Все магазины и их сотрудники',
  logout: 'Выйти из управления',
  soonTitle: 'Раздел готовится',
  soonHint: 'Пока доступен в браузерной версии админки',
} as const;

import { AppRoutes, StaffScopes } from '@/shared/config';
import { IAdminSection } from '@/widgets/admin-home/model';

const PLATFORM_SECTIONS: IAdminSection[] = [
  {
    key: 'tenants',
    title: 'Магазины',
    subtitle: 'Создание, настройка, владельцы',
    icon: 'bag',
    route: AppRoutes.adminTenants,
  },
  {
    key: 'audit',
    title: 'Журнал действий',
    subtitle: 'Кто и что менял на платформе',
    icon: 'shield',
    route: AppRoutes.adminAudit,
  },
];

const SHOP_SECTIONS: IAdminSection[] = [
  {
    key: 'products',
    title: 'Товары',
    subtitle: 'Карточки, цены, фото, категории',
    icon: 'bag',
    route: AppRoutes.adminProducts,
  },
  {
    key: 'stock',
    title: 'Остатки',
    subtitle: 'Наличие по позициям',
    icon: 'bag',
    route: AppRoutes.adminStock,
  },
  {
    key: 'banners',
    title: 'Баннеры',
    subtitle: 'Карусель на главной',
    icon: 'sparkles',
    route: AppRoutes.adminBanners,
  },
  {
    key: 'orders',
    title: 'Заказы',
    subtitle: 'Статусы и состав заказов',
    icon: 'bag',
    route: AppRoutes.adminOrders,
  },
  {
    key: 'settings',
    title: 'Настройки',
    subtitle: 'Бренд, доставка, оплата, контакты',
    icon: 'shield',
    route: AppRoutes.adminSettings,
  },
];

export const pickSections = (scope: string): IAdminSection[] => (
  scope === StaffScopes.platform ? PLATFORM_SECTIONS : SHOP_SECTIONS
);

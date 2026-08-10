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
    key: 'orders',
    title: 'Заказы',
    subtitle: 'Статусы и состав заказов',
    icon: 'bag',
    route: AppRoutes.adminOrders,
  },
];

export const pickSections = (scope: string): IAdminSection[] => (
  scope === StaffScopes.platform ? PLATFORM_SECTIONS : SHOP_SECTIONS
);

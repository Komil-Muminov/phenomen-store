import { ReactNode } from 'react';
import {
  BarChartOutlined,
  DatabaseOutlined,
  GiftOutlined,
  MessageOutlined,
  PictureOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { AppRoutes } from '@/shared/config';
import { NavLinkBases, buildNavLinkClass } from '@/shared/lib';

export interface INavItem {
  to: string;
  label: string;
  icon: ReactNode;
  match?: string[];
}

export const buildLinkClass = buildNavLinkClass(NavLinkBases.compact);

export const buildMenuLinkClass = buildNavLinkClass(NavLinkBases.menu);

export const CatalogNavItems: INavItem[] = [
  { to: AppRoutes.shopProducts, label: 'Товары', icon: <TagsOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopStock, label: 'Остатки', icon: <DatabaseOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopBanners, label: 'Баннеры', icon: <PictureOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopPromotions, label: 'Акции', icon: <GiftOutlined aria-hidden="true" /> },
];

const CatalogRoutes = CatalogNavItems.map((item) => item.to);

export const ShopNavItems: INavItem[] = [
  { to: AppRoutes.shopStats, label: 'Сводка', icon: <BarChartOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopOrders, label: 'Заказы', icon: <ShoppingOutlined aria-hidden="true" /> },
  {
    to: AppRoutes.shopProducts,
    label: 'Товары',
    icon: <TagsOutlined aria-hidden="true" />,
    match: CatalogRoutes,
  },
  { to: AppRoutes.shopSupport, label: 'Обращения', icon: <MessageOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopSettings, label: 'Настройки', icon: <SettingOutlined aria-hidden="true" /> },
];

export const isCatalogRoute = (pathname: string): boolean => CatalogRoutes.includes(pathname);

export const isNavItemActive = (item: INavItem, pathname: string): boolean => (
  pathname === item.to || (item.match ?? []).includes(pathname)
);

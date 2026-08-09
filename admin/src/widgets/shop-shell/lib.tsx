import { ReactNode } from 'react';
import {
  ApartmentOutlined,
  DatabaseOutlined,
  FolderOutlined,
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
}

export const buildLinkClass = buildNavLinkClass(NavLinkBases.compact);

export const buildMenuLinkClass = buildNavLinkClass(NavLinkBases.menu);

export const ShopNavItems: INavItem[] = [
  { to: AppRoutes.shopOrders, label: 'Заказы', icon: <ShoppingOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopProducts, label: 'Товары', icon: <TagsOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopCategories, label: 'Категории', icon: <FolderOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopStock, label: 'Остатки', icon: <DatabaseOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopAttributes, label: 'Характеристики', icon: <ApartmentOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopBanners, label: 'Баннеры', icon: <PictureOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopSettings, label: 'Настройки', icon: <SettingOutlined aria-hidden="true" /> },
];

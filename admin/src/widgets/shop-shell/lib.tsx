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

export interface INavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const LINK_BASE = 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200';

const MENU_LINK_BASE = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors duration-200';

const buildClass = (base: string) => ({ isActive }: { isActive: boolean }): string => (
  isActive
    ? `${base} bg-violet-100 font-medium text-violet-800`
    : `${base} text-slate-600 hover:bg-violet-50 hover:text-violet-700`
);

export const buildLinkClass = buildClass(LINK_BASE);

export const buildMenuLinkClass = buildClass(MENU_LINK_BASE);

export const ShopNavItems: INavItem[] = [
  { to: AppRoutes.shopOrders, label: 'Заказы', icon: <ShoppingOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopProducts, label: 'Товары', icon: <TagsOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopCategories, label: 'Категории', icon: <FolderOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopStock, label: 'Остатки', icon: <DatabaseOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopAttributes, label: 'Характеристики', icon: <ApartmentOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopBanners, label: 'Баннеры', icon: <PictureOutlined aria-hidden="true" /> },
  { to: AppRoutes.shopSettings, label: 'Настройки', icon: <SettingOutlined aria-hidden="true" /> },
];

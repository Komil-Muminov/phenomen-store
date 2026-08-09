import { ReactNode } from 'react';
import { HistoryOutlined, ShopOutlined } from '@ant-design/icons';
import { AppRoutes } from '@/shared/config';
import { NavLinkBases, buildNavLinkClass } from '@/shared/lib';

export interface INavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export const buildLinkClass = buildNavLinkClass(NavLinkBases.compact);

export const buildMenuLinkClass = buildNavLinkClass(NavLinkBases.menu);

export const PlatformNavItems: INavItem[] = [
  { to: AppRoutes.tenants, label: 'Магазины', icon: <ShopOutlined aria-hidden="true" /> },
  { to: AppRoutes.audit, label: 'Журнал', icon: <HistoryOutlined aria-hidden="true" /> },
];

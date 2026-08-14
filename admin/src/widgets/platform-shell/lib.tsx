import { ReactNode } from 'react';
import {
  CreditCardOutlined,
  CustomerServiceOutlined,
  HistoryOutlined,
  ShopOutlined,
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

export const PlatformNavItems: INavItem[] = [
  { to: AppRoutes.tenants, label: 'Магазины', icon: <ShopOutlined aria-hidden="true" /> },
  { to: AppRoutes.tickets, label: 'Обращения', icon: <CustomerServiceOutlined aria-hidden="true" /> },
  { to: AppRoutes.invoices, label: 'Счета', icon: <CreditCardOutlined aria-hidden="true" /> },
  { to: AppRoutes.audit, label: 'Журнал', icon: <HistoryOutlined aria-hidden="true" /> },
];

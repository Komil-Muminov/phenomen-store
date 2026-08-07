import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Typography } from 'antd';
import {
  ApartmentOutlined,
  DatabaseOutlined,
  FolderOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import { AppRoutes } from '@/shared/config';
import { useShopAuth } from '@/shared/shop-auth';

interface IProps {
  children: ReactNode;
}

const LINK_BASE = 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200';

const buildLinkClass = ({ isActive }: { isActive: boolean }): string => (
  isActive
    ? `${LINK_BASE} bg-violet-100 font-medium text-violet-800`
    : `${LINK_BASE} text-slate-600 hover:bg-violet-50 hover:text-violet-700`
);

export const ShopShell = ({ children }: IProps) => {
  const { user, tenantKey, signOut } = useShopAuth();

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="border-b border-violet-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div>
              <Typography.Text strong className="text-brand-text!">
                Кабинет магазина
              </Typography.Text>
              <div className="font-mono text-xs text-violet-500">{tenantKey}</div>
            </div>

            <nav className="flex items-center gap-1">
              <NavLink to={AppRoutes.shopOrders} className={buildLinkClass}>
                <ShoppingOutlined aria-hidden="true" />
                Заказы
              </NavLink>
              <NavLink to={AppRoutes.shopProducts} className={buildLinkClass}>
                <TagsOutlined aria-hidden="true" />
                Товары
              </NavLink>
              <NavLink to={AppRoutes.shopCategories} className={buildLinkClass}>
                <FolderOutlined aria-hidden="true" />
                Категории
              </NavLink>
              <NavLink to={AppRoutes.shopStock} className={buildLinkClass}>
                <DatabaseOutlined aria-hidden="true" />
                Остатки
              </NavLink>
              <NavLink to={AppRoutes.shopAttributes} className={buildLinkClass}>
                <ApartmentOutlined aria-hidden="true" />
                Характеристики
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Typography.Text type="secondary" className="text-sm!">
              {user?.name ?? user?.email}
            </Typography.Text>
            <Tooltip title="Выйти">
              <Button
                aria-label="Выйти"
                icon={<LogoutOutlined />}
                onClick={signOut}
                className="cursor-pointer!"
              />
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

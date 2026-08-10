import { ReactNode, useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button, Drawer, Typography } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { useShopAuth } from '@/shared/shop-auth';
import {
  CatalogNavItems,
  ShopNavItems,
  buildLinkClass,
  buildMenuLinkClass,
  isCatalogRoute,
  isNavItemActive,
} from '@/widgets/shop-shell/lib';
import { RenderSubNav } from '@/widgets/shop-shell/ui/renderSubNav';

interface IProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 272;

export const ShopShell = ({ children }: IProps) => {
  const { user, tenantKey, signOut } = useShopAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = useCallback(() => setMenuOpen(true), []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="border-b border-violet-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:gap-6">
            <span className="lg:hidden">
              <Tooltip title="Меню">
                <Button
                  aria-label="Открыть меню"
                  icon={<MenuOutlined />}
                  onClick={openMenu}
                  className="cursor-pointer!"
                />
              </Tooltip>
            </span>

            <div className="min-w-0">
              <Typography.Text strong className="text-brand-text!">
                Кабинет магазина
              </Typography.Text>
              <div className="truncate font-mono text-xs text-violet-500">{tenantKey}</div>
            </div>

            <nav className="hidden items-center gap-1 lg:flex">
              {ShopNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={buildLinkClass({ isActive: isNavItemActive(item, pathname) })}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden sm:inline">
              <Typography.Text type="secondary" className="text-sm!">
                {user?.name ?? user?.email}
              </Typography.Text>
            </span>
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

      <Drawer
        open={menuOpen}
        placement="left"
        width={DRAWER_WIDTH}
        title="Кабинет магазина"
        onClose={closeMenu}
        classNames={{ body: 'p-3!' }}
      >
        <nav className="flex flex-col gap-1">
          {ShopNavItems.map((item) => (
            <div key={item.to} className="flex flex-col gap-1">
              <NavLink
                to={item.to}
                className={buildMenuLinkClass({ isActive: isNavItemActive(item, pathname) })}
                onClick={closeMenu}
              >
                {item.icon}
                {item.label}
              </NavLink>

              <If condition={Boolean(item.match) && isCatalogRoute(pathname)}>
                <div className="ml-4 flex flex-col gap-1 border-l border-violet-100 pl-2">
                  {CatalogNavItems.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={buildMenuLinkClass}
                      onClick={closeMenu}
                    >
                      {child.icon}
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </If>
            </div>
          ))}
        </nav>

        <div className="mt-4 border-t border-violet-100 pt-4">
          <Typography.Text type="secondary" className="text-sm!">
            {user?.name ?? user?.email}
          </Typography.Text>
          <div className="font-mono text-xs text-violet-500">{tenantKey}</div>
        </div>
      </Drawer>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <If condition={isCatalogRoute(pathname)}>
          <RenderSubNav />
        </If>

        {children}
      </main>
    </div>
  );
};

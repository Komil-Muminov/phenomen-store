import { ReactNode, useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar, Button, Drawer, Typography } from 'antd';
import { LogoutOutlined, MenuOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
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

  const userName = user?.name && !user.name.includes('?') ? user.name : (user?.email ?? 'Магазин Demo');
  const userInitial = userName.trim()[0]?.toUpperCase() ?? 'M';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
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

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <ShopOutlined className="text-lg" />
              </div>
              <div className="min-w-0">
                <Typography.Text strong className="block leading-tight text-slate-900!">
                  Кабинет магазина
                </Typography.Text>
                <div className="truncate font-mono text-xs text-indigo-600 font-medium">{tenantKey || 'demo-fashion'}</div>
              </div>
            </div>

            <nav className="hidden items-center gap-1.5 lg:flex ml-2">
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
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-slate-50/80 py-1 pl-1.5 pr-3">
              <Avatar
                size={28}
                className="bg-indigo-600 text-white font-medium text-xs flex items-center justify-center shrink-0"
                icon={!userInitial ? <UserOutlined /> : undefined}
              >
                {userInitial}
              </Avatar>
              <Typography.Text className="text-xs! font-medium! text-slate-700!">
                {userName}
              </Typography.Text>
            </div>
            <Tooltip title="Выйти">
              <Button
                aria-label="Выйти"
                icon={<LogoutOutlined />}
                onClick={signOut}
                className="cursor-pointer! border-slate-200/80 hover:text-red-600!"
              />
            </Tooltip>
          </div>
        </div>
      </header>

      <Drawer
        open={menuOpen}
        placement="left"
        width={DRAWER_WIDTH}
        title={(
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShopOutlined />
            </div>
            <span>Кабинет магазина</span>
          </div>
        )}
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
                <div className="ml-4 flex flex-col gap-1 border-l border-indigo-100 pl-2">
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

        <div className="mt-6 border-t border-slate-200 pt-4 flex items-center gap-3">
          <Avatar size={32} className="bg-indigo-600 text-white font-medium">
            {userInitial}
          </Avatar>
          <div className="min-w-0">
            <Typography.Text className="block truncate text-sm font-medium text-slate-800">
              {userName}
            </Typography.Text>
            <div className="font-mono text-xs text-indigo-600">{tenantKey}</div>
          </div>
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

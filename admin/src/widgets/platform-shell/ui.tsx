import { ReactNode, useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Drawer, Typography } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import { useAuth } from '@/shared/auth';
import { PlatformNavItems, buildLinkClass, buildMenuLinkClass } from '@/widgets/platform-shell/lib';

interface IProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 272;

export const PlatformShell = ({ children }: IProps) => {
  const { admin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = useCallback(() => setMenuOpen(true), []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="border-b border-violet-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <span className="sm:hidden">
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
                Панель платформы
              </Typography.Text>
              <div className="text-xs text-violet-500">PHENOMEN</div>
            </div>

            <nav className="hidden items-center gap-1 sm:flex">
              {PlatformNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={buildLinkClass}>
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden sm:inline">
              <Typography.Text type="secondary" className="text-sm!">
                {admin?.name}
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
        title="Панель платформы"
        onClose={closeMenu}
        classNames={{ body: 'p-3!' }}
      >
        <nav className="flex flex-col gap-1">
          {PlatformNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={buildMenuLinkClass}
              onClick={closeMenu}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-violet-100 pt-4">
          <Typography.Text type="secondary" className="text-sm!">
            {admin?.name}
          </Typography.Text>
        </div>
      </Drawer>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

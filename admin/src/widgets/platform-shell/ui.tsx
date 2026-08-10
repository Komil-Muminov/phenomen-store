import { ReactNode, useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Avatar, Button, Drawer, Typography } from 'antd';
import { LogoutOutlined, MenuOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
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

  const adminName = admin?.name && !admin.name.includes('?') ? admin.name : 'Администратор';
  const adminInitial = adminName.trim()[0]?.toUpperCase() ?? 'A';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
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

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <SafetyCertificateOutlined className="text-lg" />
              </div>
              <div className="min-w-0">
                <Typography.Text strong className="block leading-tight text-slate-900!">
                  Панель платформы
                </Typography.Text>
                <div className="font-mono text-xs text-indigo-600 font-medium">PHENOMEN</div>
              </div>
            </div>

            <nav className="hidden items-center gap-1.5 sm:flex ml-2">
              {PlatformNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={buildLinkClass}>
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
                icon={!adminInitial ? <UserOutlined /> : undefined}
              >
                {adminInitial}
              </Avatar>
              <Typography.Text className="text-xs! font-medium! text-slate-700!">
                {adminName}
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
              <SafetyCertificateOutlined />
            </div>
            <span>Панель платформы</span>
          </div>
        )}
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

        <div className="mt-6 border-t border-slate-200 pt-4 flex items-center gap-3">
          <Avatar size={32} className="bg-indigo-600 text-white font-medium">
            {adminInitial}
          </Avatar>
          <div className="min-w-0">
            <Typography.Text className="block truncate text-sm font-medium text-slate-800">
              {adminName}
            </Typography.Text>
            <div className="font-mono text-xs text-indigo-600">PHENOMEN Admin</div>
          </div>
        </div>
      </Drawer>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

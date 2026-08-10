import { NavLink } from 'react-router-dom';
import { CatalogNavItems } from '@/widgets/shop-shell/lib';

const ITEM_BASE = 'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200';

const ITEM_ACTIVE = 'bg-white text-indigo-600 font-semibold shadow-xs border border-slate-200/80';

const ITEM_IDLE = 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-200/40 border border-transparent';

export const RenderSubNav = () => (
  <nav
    aria-label="Разделы товаров"
    className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5 shadow-2xs"
  >
    {CatalogNavItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) => `${ITEM_BASE} ${isActive ? ITEM_ACTIVE : ITEM_IDLE}`}
      >
        {item.icon}
        {item.label}
      </NavLink>
    ))}
  </nav>
);

import { NavLink } from 'react-router-dom';
import { CatalogNavItems } from '@/widgets/shop-shell/lib';

const ITEM_BASE = 'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200';

const ITEM_ACTIVE = 'bg-violet-600 font-medium text-white';

const ITEM_IDLE = 'text-slate-600 hover:bg-violet-100 hover:text-violet-700';

export const RenderSubNav = () => (
  <nav
    aria-label="Разделы товаров"
    className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-violet-200 bg-white p-1 shadow-sm"
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

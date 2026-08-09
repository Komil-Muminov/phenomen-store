export const NavLinkBases = {
  compact: 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
  menu: 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors duration-200',
} as const;

export const buildNavLinkClass = (base: string) => ({ isActive }: { isActive: boolean }): string => (
  isActive
    ? `${base} bg-violet-100 font-medium text-violet-800`
    : `${base} text-slate-600 hover:bg-violet-50 hover:text-violet-700`
);

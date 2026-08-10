export const NavLinkBases = {
  compact: 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200',
  menu: 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors duration-200',
} as const;

export const buildNavLinkClass = (base: string) => ({ isActive }: { isActive: boolean }): string => (
  isActive
    ? `${base} bg-violet-100 font-medium text-violet-800`
    : `${base} text-slate-600 hover:bg-violet-50 hover:text-violet-700`
);

export const buildListParams = <T extends object>(
  state: T,
  limit: number,
): Record<string, unknown> => {
  const params: Record<string, unknown> = { limit };

  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  return params;
};

export const buildListKey = <T extends object>(state: T): (string | number | boolean | null)[] => (
  Object.keys(state)
    .sort()
    .map((key) => {
      const value = (state as Record<string, unknown>)[key];

      return value === undefined || value === '' ? null : (value as string | number | boolean);
    })
);

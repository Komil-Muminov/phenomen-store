export const NavLinkBases = {
  compact: 'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-all duration-200',
  menu: 'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-base transition-all duration-200',
} as const;

export const buildNavLinkClass = (base: string) => ({ isActive }: { isActive: boolean }): string => (
  isActive
    ? `${base} bg-indigo-50 font-semibold text-indigo-600 shadow-xs border border-indigo-100`
    : `${base} text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900 border border-transparent`
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

export const VisibilityValues = {
  all: 'all',
  visible: 'true',
  hidden: 'false',
} as const;

export const parseVisibility = (value: string): boolean | undefined => (
  value === VisibilityValues.all ? undefined : value === VisibilityValues.visible
);

export const formatVisibility = (isActive?: boolean): string => (
  isActive === undefined ? VisibilityValues.all : String(isActive)
);

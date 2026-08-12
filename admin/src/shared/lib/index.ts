import { ApiRoutes, Env, ListLimits, Pagination, QueryKeys } from '@/shared/config';

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

const UPLOADS_MARK = '/uploads/';

export const resolveMediaUrl = (value: string | null | undefined): string => {
  const url = typeof value === 'string' ? value.trim() : '';
  const markIndex = url.indexOf(UPLOADS_MARK);

  return markIndex < 0 ? url : `${Env.apiUrl}${url.slice(markIndex)}`;
};

export interface IPrefetchList {
  key: (string | number | boolean | null)[];
  url: string;
  params: Record<string, unknown>;
}

const buildPrefetchList = <T extends object>(
  prefix: (string | number | boolean | null)[],
  url: string,
  filters: T,
  limit: number,
): IPrefetchList => {
  const state = { ...filters, page: Pagination.defaultPage, search: '' };

  return {
    key: [...prefix, ...buildListKey(state)],
    url,
    params: buildListParams(state, limit),
  };
};

export const ShopPrefetchLists: IPrefetchList[] = [
  buildPrefetchList(
    [QueryKeys.shopOrders],
    ApiRoutes.shopOrdersSearch,
    { status: undefined },
    ListLimits.default,
  ),
  buildPrefetchList(
    [QueryKeys.shopProducts, 'manage'],
    ApiRoutes.shopProductsSearch,
    { categoryId: undefined, isActive: undefined },
    ListLimits.default,
  ),
  buildPrefetchList(
    [QueryKeys.shopStock],
    ApiRoutes.shopStockSearch,
    { onlyEmpty: undefined },
    ListLimits.stock,
  ),
  buildPrefetchList(
    [QueryKeys.shopBanners],
    ApiRoutes.shopBannersManage,
    { isActive: undefined },
    ListLimits.banners,
  ),
];

const CSV_MIME = 'text/csv;charset=utf-8;';

const BOM = '\uFEFF';

export const downloadCsv = (content: string, name: string): void => {
  const blob = new Blob([BOM, content], { type: CSV_MIME });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

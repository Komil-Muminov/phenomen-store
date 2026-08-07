export interface IAuditQuery {
  page: number;
  search: string;
  action: string | undefined;
  tenantKey: string | undefined;
}

export const INITIAL_QUERY: IAuditQuery = {
  page: 1,
  search: '',
  action: undefined,
  tenantKey: undefined,
};

export const SEARCH_DEBOUNCE_MS = 400;

export const buildParams = (query: IAuditQuery, limit: number): Record<string, unknown> => ({
  page: query.page,
  limit,
  search: query.search.trim() || undefined,
  action: query.action,
  tenantKey: query.tenantKey,
});

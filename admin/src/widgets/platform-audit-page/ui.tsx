import { useCallback, useEffect, useState } from 'react';
import { Alert, Pagination as AntPagination, Typography } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, Pagination, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { AuditTable } from '@/features/audit-table';
import { PlatformShell } from '@/widgets/platform-shell';
import { RenderFilters } from '@/widgets/platform-audit-page/ui/renderFilters';
import {
  buildParams,
  IAuditQuery,
  INITIAL_QUERY,
  SEARCH_DEBOUNCE_MS,
} from '@/widgets/platform-audit-page/model';
import type { IAuditList, ITenantList } from '@/entities/tenant';

export const PlatformAuditPage = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<IAuditQuery>(INITIAL_QUERY);
  const [applied, setApplied] = useState<IAuditQuery>(INITIAL_QUERY);

  useEffect(() => {
    const timer = setTimeout(() => setApplied(query), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const auditQuery = useGetQuery<IAuditList>(
    [QueryKeys.audit, applied.page, applied.search, applied.action ?? null, applied.tenantKey ?? null],
    ApiRoutes.platformAudit,
    { params: buildParams(applied, Pagination.auditLimit) },
  );
  const actionsQuery = useGetQuery<string[]>(
    [QueryKeys.audit, 'actions'],
    ApiRoutes.platformAuditActions,
    { staleTime: StaleTimeMs.long },
  );
  const tenantsQuery = useGetQuery<ITenantList>([QueryKeys.tenants], ApiRoutes.tenantsSearch);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.audit] });
  }, [queryClient]);

  const handleSearch = useCallback((search: string) => {
    setQuery((current) => ({ ...current, search, page: 1 }));
  }, []);

  const handleAction = useCallback((action: string | undefined) => {
    setQuery((current) => ({ ...current, action, page: 1 }));
  }, []);

  const handleTenant = useCallback((tenantKey: string | undefined) => {
    setQuery((current) => ({ ...current, tenantKey, page: 1 }));
  }, []);

  const handlePage = useCallback((page: number) => {
    setQuery((current) => ({ ...current, page }));
    setApplied((current) => ({ ...current, page }));
  }, []);

  const total = auditQuery.data?.total ?? 0;

  return (
    <PlatformShell>
      <header className="mb-4">
        <Typography.Title level={3} className="mb-0! text-brand-text!">
          Журнал действий
        </Typography.Title>
        <Typography.Text type="secondary">Найдено записей: {total}</Typography.Text>
      </header>

      <RenderFilters
        search={query.search}
        action={query.action}
        tenantKey={query.tenantKey}
        actions={actionsQuery.data ?? []}
        tenants={tenantsQuery.data?.items ?? []}
        isFetching={auditQuery.isFetching}
        onSearch={handleSearch}
        onAction={handleAction}
        onTenant={handleTenant}
        onRefresh={handleRefresh}
      />

      <If condition={Boolean(auditQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(auditQuery.error)}
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <AuditTable items={auditQuery.data?.items ?? []} isLoading={auditQuery.isLoading} />
      </section>

      <If condition={total > Pagination.auditLimit}>
        <div className="mt-4 flex justify-end">
          <AntPagination
            current={applied.page}
            pageSize={Pagination.auditLimit}
            total={total}
            showSizeChanger={false}
            onChange={handlePage}
          />
        </div>
      </If>
    </PlatformShell>
  );
};

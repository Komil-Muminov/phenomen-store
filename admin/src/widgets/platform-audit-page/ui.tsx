import { useCallback } from 'react';
import { Alert, Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { AuditTable } from '@/features/audit-table';
import { PlatformShell } from '@/widgets/platform-shell';
import type { IAuditList } from '@/entities/tenant';

const AUDIT_LIMIT = 100;

export const PlatformAuditPage = () => {
  const queryClient = useQueryClient();

  const auditQuery = useGetQuery<IAuditList>(
    [QueryKeys.audit],
    ApiRoutes.platformAudit,
    { params: { limit: AUDIT_LIMIT } },
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.audit] });
  }, [queryClient]);

  return (
    <PlatformShell>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Журнал действий
          </Typography.Title>
          <Typography.Text type="secondary">
            Записей: {auditQuery.data?.total ?? 0} · показаны последние {AUDIT_LIMIT}
          </Typography.Text>
        </div>

        <Tooltip title="Обновить">
          <Button
            aria-label="Обновить журнал"
            icon={<ReloadOutlined />}
            loading={auditQuery.isFetching}
            onClick={handleRefresh}
            className="cursor-pointer!"
          />
        </Tooltip>
      </header>

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
    </PlatformShell>
  );
};

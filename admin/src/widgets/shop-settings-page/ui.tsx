import { useCallback } from 'react';
import { Alert, App as AntApp, Spin, Typography } from 'antd';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { SettingsForm } from '@/features/settings-form';
import { ShopShell } from '@/widgets/shop-shell';
import type { ITenantConfig, ITenantConfigPatch } from '@/entities/tenant-config';

export const ShopSettingsPage = () => {
  const { message } = AntApp.useApp();

  const configQuery = useGetQuery<ITenantConfig>(
    [QueryKeys.shopConfig],
    ApiRoutes.shopConfig,
    { scope: 'shop', staleTime: StaleTimeMs.short },
  );

  const saveMutation = useMutationQuery<ITenantConfigPatch, ITenantConfig>(
    ApiRoutes.shopConfig,
    { scope: 'shop', method: 'patch', invalidate: [[QueryKeys.shopConfig]] },
  );

  const handleSubmit = useCallback((patch: ITenantConfigPatch) => {
    saveMutation.mutate(patch, {
      onSuccess: () => message.success('Настройки сохранены'),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [saveMutation, message]);

  return (
    <ShopShell>
      <header className="mb-6">
        <Typography.Title level={3} className="mb-0! text-brand-text!">
          Настройки магазина
        </Typography.Title>
        <Typography.Text type="secondary">
          Название, оформление и правила работы — сразу применяются в приложении
        </Typography.Text>
      </header>

      <If condition={Boolean(configQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(configQuery.error)}
        />
      </If>

      <If
        condition={!configQuery.isLoading}
        fallback={(
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        )}
      >
        <SettingsForm
          config={configQuery.data ?? null}
          isSaving={saveMutation.isPending}
          onSubmit={handleSubmit}
        />
      </If>
    </ShopShell>
  );
};

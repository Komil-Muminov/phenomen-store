import { useCallback } from 'react';
import { Alert, App as AntApp, Spin, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { SettingsForm } from '@/features/settings-form';
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
    <>
      <header className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
          <SettingOutlined className="text-2xl" />
        </div>
        <div>
          <Typography.Title level={3} className="mb-1! text-slate-900! font-bold!">
            Настройки магазина
          </Typography.Title>
          <Typography.Text className="text-slate-500! text-sm!">
            Название, оформление и правила работы — изменения сразу применяются в витрине приложения
          </Typography.Text>
        </div>
      </header>

      <If condition={Boolean(configQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-6! rounded-xl!"
          message={extractErrorMessage(configQuery.error)}
        />
      </If>

      <If
        condition={!configQuery.isLoading}
        fallback={(
          <div className="flex justify-center py-20">
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
    </>
  );
};

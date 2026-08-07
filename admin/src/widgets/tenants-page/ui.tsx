import { useCallback, useState } from 'react';
import { Alert, App as AntApp } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys, UiMessages } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { useAuth } from '@/shared/auth';
import { If } from '@/shared/ui/If';
import { TenantsTable } from '@/features/tenants-table';
import { TenantForm, ITenantFormValues } from '@/features/tenant-form';
import { OwnerForm, IOwnerFormValues } from '@/features/owner-form';
import { PlatformShell } from '@/widgets/platform-shell';
import { RenderHeader } from '@/widgets/tenants-page/ui/renderHeader';
import { INITIAL_STATE, buildUpdateUrl } from '@/widgets/tenants-page/model';
import type { ITenant, ITenantList } from '@/entities/tenant';

export const TenantsPage = () => {
  const { admin, signOut } = useAuth();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [state, setState] = useState(INITIAL_STATE);

  const tenantsQuery = useGetQuery<ITenantList>([QueryKeys.tenants], ApiRoutes.tenantsSearch);
  const invalidate = [[QueryKeys.tenants]];

  const createMutation = useMutationQuery<ITenantFormValues, ITenant>(
    ApiRoutes.tenantsCreate,
    { invalidate },
  );
  const updateMutation = useMutationQuery<ITenantFormValues & { id: string }, ITenant>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsUpdate, body.id),
    { method: 'patch', invalidate },
  );
  const deactivateMutation = useMutationQuery<{ id: string }, ITenant>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsDeactivate, body.id),
    { method: 'patch', invalidate },
  );
  const ownerMutation = useMutationQuery<IOwnerFormValues & { id: string }, { id: string }>(
    (body) => buildUpdateUrl(ApiRoutes.tenantsOwnerCreate, body.id),
    { invalidate },
  );

  const closeModals = useCallback(() => setState(INITIAL_STATE), []);

  const handleCreate = useCallback(() => {
    setState({ ...INITIAL_STATE, formOpen: true });
  }, []);

  const handleEdit = useCallback((tenant: ITenant) => {
    setState({ ...INITIAL_STATE, formOpen: true, editing: tenant });
  }, []);

  const handleAddOwner = useCallback((tenant: ITenant) => {
    setState({ ...INITIAL_STATE, ownerOpen: true, target: tenant });
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.tenants] });
  }, [queryClient]);

  const handleDeactivate = useCallback((tenant: ITenant) => {
    deactivateMutation.mutate({ id: tenant.id }, {
      onSuccess: () => message.success(UiMessages.deactivatedTenant),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [deactivateMutation, message]);

  const handleFormSubmit = useCallback((values: ITenantFormValues) => {
    const onError = (error: Error) => message.error(extractErrorMessage(error));

    if (state.editing) {
      updateMutation.mutate({ ...values, id: state.editing.id }, {
        onSuccess: () => {
          message.success(UiMessages.updatedTenant);
          closeModals();
        },
        onError,
      });

      return;
    }

    createMutation.mutate(values, {
      onSuccess: () => {
        message.success(UiMessages.createdTenant);
        closeModals();
      },
      onError,
    });
  }, [state.editing, updateMutation, createMutation, message, closeModals]);

  const handleOwnerSubmit = useCallback((values: IOwnerFormValues) => {
    ownerMutation.mutate({ ...values, id: state.target?.id ?? '' }, {
      onSuccess: () => {
        message.success(UiMessages.createdOwner);
        closeModals();
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [ownerMutation, state.target, message, closeModals]);

  return (
    <PlatformShell>
      <RenderHeader
        adminName={admin?.name ?? ''}
        total={tenantsQuery.data?.total ?? 0}
        isFetching={tenantsQuery.isFetching}
        onCreate={handleCreate}
        onRefresh={handleRefresh}
        onSignOut={signOut}
      />

      <If condition={Boolean(tenantsQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(tenantsQuery.error)}
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <TenantsTable
          items={tenantsQuery.data?.items ?? []}
          isLoading={tenantsQuery.isLoading}
          onEdit={handleEdit}
          onAddOwner={handleAddOwner}
          onDeactivate={handleDeactivate}
        />
      </section>

      <TenantForm
        open={state.formOpen}
        editing={state.editing}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onCancel={closeModals}
      />

      <OwnerForm
        open={state.ownerOpen}
        tenant={state.target}
        isSaving={ownerMutation.isPending}
        onSubmit={handleOwnerSubmit}
        onCancel={closeModals}
      />
    </PlatformShell>
  );
};

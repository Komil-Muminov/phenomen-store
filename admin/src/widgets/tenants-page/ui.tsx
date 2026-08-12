import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App as AntApp } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, AppRoutes, EntityStatuses, QueryKeys, UiMessages } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { useShopAuth } from '@/shared/shop-auth';
import { If } from '@/shared/ui/If';
import { TenantsTable } from '@/features/tenants-table';
import { TenantForm, ITenantFormValues } from '@/features/tenant-form';
import { TenantCard, ITenantCardValues } from '@/features/tenant-card';
import { OwnerForm, IOwnerFormValues } from '@/features/owner-form';
import { RenderHeader } from '@/widgets/tenants-page/ui/renderHeader';
import { INITIAL_STATE, buildUpdateUrl } from '@/widgets/tenants-page/model';
import { useTenantMutations } from '@/widgets/tenants-page/lib';
import type { ITenant, ITenantList, ITenantStaff } from '@/entities/tenant';

export const TenantsPage = () => {
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const { signIn: shopSignIn } = useShopAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState(INITIAL_STATE);
  const mutations = useTenantMutations();

  const tenantsQuery = useGetQuery<ITenantList>([QueryKeys.tenants], ApiRoutes.tenantsSearch);
  const staffQuery = useGetQuery<ITenantStaff[]>(
    [QueryKeys.tenantStaff, state.target?.id ?? null],
    buildUpdateUrl(ApiRoutes.tenantsStaffSearch, state.target?.id ?? ''),
    { enabled: Boolean(state.target) },
  );

  const showError = useCallback((error: Error) => {
    message.error(extractErrorMessage(error));
  }, [message]);

  const closeAll = useCallback(() => setState(INITIAL_STATE), []);

  const closeStaffForm = useCallback(() => {
    setState((current) => ({ ...current, staffOpen: false, editingStaff: null }));
  }, []);

  const handleCreate = useCallback(() => {
    setState({ ...INITIAL_STATE, formOpen: true });
  }, []);

  const handleOpenCard = useCallback((tenant: ITenant) => {
    setState({ ...INITIAL_STATE, cardOpen: true, target: tenant });
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.tenants] });
  }, [queryClient]);

  const handleCreateSubmit = useCallback((values: ITenantFormValues) => {
    mutations.create.mutate(values, {
      onSuccess: (tenant) => {
        message.success(UiMessages.createdTenant);
        setState({ ...INITIAL_STATE, cardOpen: true, target: tenant });
      },
      onError: showError,
    });
  }, [mutations.create, message, showError]);

  const handleCardSubmit = useCallback((values: ITenantCardValues) => {
    if (!state.target) {
      return;
    }

    mutations.update.mutate({ ...values, id: state.target.id }, {
      onSuccess: (tenant) => {
        message.success(UiMessages.updatedTenant);
        setState((current) => ({ ...current, target: tenant }));
      },
      onError: showError,
    });
  }, [mutations.update, state.target, message, showError]);

  const handleToggleStatus = useCallback((tenant: ITenant) => {
    const isActive = tenant.status === EntityStatuses.active;
    const mutation = isActive ? mutations.deactivate : mutations.activate;

    mutation.mutate({ id: tenant.id }, {
      onSuccess: (updated) => {
        message.success(isActive ? UiMessages.deactivatedTenant : UiMessages.activatedTenant);
        setState((current) => ({ ...current, target: updated }));
      },
      onError: showError,
    });
  }, [mutations.deactivate, mutations.activate, message, showError]);

  const handleDeleteTenant = useCallback((key: string) => {
    if (!state.target) {
      return;
    }

    mutations.remove.mutate({ id: state.target.id, key }, {
      onSuccess: () => {
        message.success(UiMessages.deletedTenant);
        closeAll();
      },
      onError: showError,
    });
  }, [mutations.remove, state.target, message, showError, closeAll]);

  const handleEnterShop = useCallback((tenant: ITenant) => {
    mutations.enter.mutate({ id: tenant.id }, {
      onSuccess: (result) => {
        shopSignIn(result.token, result.tenantKey ?? tenant.key, {
          id: result.user?.id ?? '',
          name: result.user?.name ?? null,
          email: result.user?.email ?? null,
          role: result.user?.role ?? '',
        });
        message.success(UiMessages.enteredShop);
        navigate(AppRoutes.shopStats);
      },
      onError: showError,
    });
  }, [mutations.enter, shopSignIn, message, navigate, showError]);

  const handleEditStaff = useCallback((staff: ITenantStaff) => {
    setState((current) => ({ ...current, staffOpen: true, editingStaff: staff }));
  }, []);

  const handleStaffSubmit = useCallback((values: IOwnerFormValues) => {
    if (!state.target) {
      return;
    }

    if (!state.editingStaff) {
      return;
    }

    mutations.updateStaff.mutate(
      { ...values, id: state.target.id, staffId: state.editingStaff.id },
      {
        onSuccess: () => {
          message.success(UiMessages.updatedStaff);
          closeStaffForm();
        },
        onError: showError,
      },
    );
  }, [
    mutations.updateStaff,
    state.target,
    state.editingStaff,
    message,
    showError,
    closeStaffForm,
  ]);

  return (
    <>
      <RenderHeader
        total={tenantsQuery.data?.total ?? 0}
        isFetching={tenantsQuery.isFetching}
        onCreate={handleCreate}
        onRefresh={handleRefresh}
      />

      <If condition={Boolean(tenantsQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(tenantsQuery.error)}
        />
      </If>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-0 shadow-xs overflow-hidden">
        <TenantsTable
          items={tenantsQuery.data?.items ?? []}
          isLoading={tenantsQuery.isLoading}
          onOpen={handleOpenCard}
        />
      </section>

      <TenantForm
        open={state.formOpen}
        isSaving={mutations.create.isPending}
        onSubmit={handleCreateSubmit}
        onCancel={closeAll}
      />

      <TenantCard
        open={state.cardOpen}
        tenant={state.target}
        staff={staffQuery.data ?? []}
        isStaffLoading={staffQuery.isLoading}
        isSaving={mutations.update.isPending}
        isStatusSaving={mutations.deactivate.isPending || mutations.activate.isPending}
        isDeleting={mutations.remove.isPending}
        isEntering={mutations.enter.isPending}
        onSubmit={handleCardSubmit}
        onEnterShop={handleEnterShop}
        onEditStaff={handleEditStaff}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteTenant}
        onClose={closeAll}
      />

      <OwnerForm
        open={state.staffOpen}
        tenant={state.target}
        editing={state.editingStaff}
        isSaving={mutations.updateStaff.isPending}
        onSubmit={handleStaffSubmit}
        onCancel={closeStaffForm}
      />
    </>
  );
};

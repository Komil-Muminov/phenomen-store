import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ApiRoutes,
  AppRoutes,
  EntityStatuses,
  ManageListLimit,
  QueryKeys,
} from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { toHref } from '@/shared/lib';
import { useStaffAuth } from '@/shared/staff-auth';
import { Button, ButtonVariants, Icon, If, Screen } from '@/shared/ui';
import { useTenantMutations } from '@/widgets/admin-tenants/lib';
import {
  EMPTY_TENANT,
  FormTexts,
  IEnterResult,
  ITenant,
  ITenantFormValues,
  ITenantList,
  TenantsTexts,
  toCreatePayload,
  toTenantForm,
  toUpdatePayload,
} from '@/widgets/admin-tenants/model';
import { RenderTenantForm } from '@/widgets/admin-tenants/ui/renderForm';

export const AdminTenants = () => {
  const router = useRouter();
  const { signIn } = useStaffAuth();
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ITenant | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<ITenantFormValues>(EMPTY_TENANT);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ITenant | null>(null);
  const [deleteKey, setDeleteKey] = useState('');
  const mutations = useTenantMutations();

  const tenantsQuery = useGetQuery<ITenantList>(
    [QueryKeys.adminTenants, page],
    ApiRoutes.tenantsSearch,
    { params: { page, limit: ManageListLimit } },
  );

  const enterMutation = useMutationQuery<{ id: string }, IEnterResult>(
    (body) => `${ApiRoutes.tenantsEnter}/${body.id}`,
  );

  const handleToggle = useCallback((tenant: ITenant) => {
    setBusyId(tenant.id);

    mutations.status.mutate(
      { id: tenant.id, activate: tenant.status !== EntityStatuses.active },
      { onSettled: () => setBusyId(null) },
    );
  }, [mutations.status]);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setValues(EMPTY_TENANT);
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((tenant: ITenant) => {
    setEditing(tenant);
    setValues(toTenantForm(tenant));
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const onSuccess = () => setFormOpen(false);
    const onError = (error: Error) => setFormError(error.message);

    if (editing) {
      mutations.update.mutate(
        { ...toUpdatePayload(values), id: editing.id },
        { onSuccess, onError },
      );

      return;
    }

    mutations.create.mutate(toCreatePayload(values), { onSuccess, onError });
  }, [editing, values, mutations.update, mutations.create]);

  const handleDelete = useCallback(() => {
    if (!deleting) {
      return;
    }

    mutations.remove.mutate({ id: deleting.id, key: deleting.key }, {
      onSuccess: () => {
        setDeleting(null);
        setDeleteKey('');
      },
    });
  }, [deleting, mutations.remove]);

  const handleEnter = useCallback((tenant: ITenant) => {
    setBusyId(tenant.id);

    enterMutation.mutate({ id: tenant.id }, {
      onSuccess: (result) => {
        signIn({
          token: result.token,
          scope: result.scope,
          name: result.user?.name ?? tenant.name,
          role: result.user?.role ?? '',
          tenantKey: result.tenantKey,
          tenantName: result.tenantName,
        }).then(() => router.replace(toHref(AppRoutes.admin)));
      },
      onSettled: () => setBusyId(null),
    });
  }, [enterMutation, signIn, router]);

  const items = tenantsQuery.data?.items ?? [];
  const total = tenantsQuery.data?.total ?? 0;

  return (
    <Screen padded={false}>
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          onPress={() => router.replace(toHref(AppRoutes.admin))}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>

        <View className="flex-1">
          <Text className="text-xl font-extrabold tracking-tight text-content">
            {TenantsTexts.title}
          </Text>
          <Text className="text-xs text-muted">{`Найдено: ${total}`}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={FormTexts.createTitle}
          onPress={handleCreate}
          className="h-10 w-10 items-center justify-center rounded-xl bg-primary active:opacity-80"
        >
          <Icon name="plus" size={18} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <If
          condition={items.length > 0 || tenantsQuery.isLoading}
          fallback={(
            <View className="items-center rounded-2xl border border-line bg-surface px-4 py-10">
              <Text className="text-sm font-medium text-muted">{TenantsTexts.empty}</Text>
            </View>
          )}
        >
          {items.map((tenant) => (
            <View key={tenant.id} className="gap-3 rounded-2xl border border-line bg-surface p-4">
              <View className="gap-0.5">
                <Text className="text-base font-bold text-content">{tenant.name}</Text>
                <Text className="text-xs text-muted">{tenant.key}</Text>
                <Text
                  className={`text-xs font-semibold ${tenant.status === EntityStatuses.active ? 'text-success' : 'text-danger'}`}
                >
                  {tenant.status === EntityStatuses.active
                    ? TenantsTexts.active
                    : TenantsTexts.disabled}
                </Text>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  disabled={busyId === tenant.id || tenant.status !== EntityStatuses.active}
                  onPress={() => handleEnter(tenant)}
                  className="flex-1 items-center rounded-xl bg-primary py-2.5 active:opacity-80 disabled:opacity-50"
                >
                  <Text className="text-xs font-semibold text-onPrimary">
                    {TenantsTexts.enter}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={busyId === tenant.id}
                  onPress={() => handleToggle(tenant)}
                  className="flex-1 items-center rounded-xl border border-line bg-background py-2.5 active:opacity-80"
                >
                  <Text className="text-xs font-semibold text-muted">
                    {tenant.status === EntityStatuses.active
                      ? TenantsTexts.deactivate
                      : TenantsTexts.activate}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleEdit(tenant)}
                  className="flex-1 items-center rounded-xl border border-line bg-background py-2.5 active:opacity-80"
                >
                  <Text className="text-xs font-semibold text-muted">Настройки</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(toHref({
                    pathname: AppRoutes.adminStaff,
                    params: { tenantId: tenant.id, tenantName: tenant.name },
                  }))}
                  className="flex-1 items-center rounded-xl border border-line bg-background py-2.5 active:opacity-80"
                >
                  <Text className="text-xs font-semibold text-muted">Сотрудники</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Удалить магазин"
                  onPress={() => {
                    setDeleteKey('');
                    setDeleting(tenant);
                  }}
                  className="h-10 w-10 items-center justify-center rounded-xl bg-background active:opacity-80"
                >
                  <Icon name="close" size={14} />
                </Pressable>
              </View>
            </View>
          ))}
        </If>

        <If condition={page * ManageListLimit < total}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPage((current) => current + 1)}
            className="items-center rounded-2xl border border-line bg-surface py-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary">{TenantsTexts.loadMore}</Text>
          </Pressable>
        </If>
      </ScrollView>

      <RenderTenantForm
        open={formOpen}
        editing={Boolean(editing)}
        values={values}
        saving={mutations.create.isPending || mutations.update.isPending}
        errorMessage={formError}
        onChange={setValues}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />

      <Modal
        visible={Boolean(deleting)}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleting(null)}
      >
        <View className="flex-1 items-center justify-center bg-content/40 px-6">
          <View className="w-full gap-3 rounded-2xl bg-background p-5">
            <Text className="text-lg font-extrabold text-content">{FormTexts.deleteTitle}</Text>
            <Text className="text-sm text-muted">{FormTexts.deleteHint}</Text>

            <TextInput
              autoFocus
              value={deleteKey}
              onChangeText={setDeleteKey}
              autoCapitalize="none"
              placeholder={deleting?.key}
              className="rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content"
            />

            <Button
              title={FormTexts.deleteConfirm}
              loading={mutations.remove.isPending}
              disabled={deleteKey.trim().toLowerCase() !== deleting?.key}
              onPress={handleDelete}
            />
            <Button
              title={FormTexts.cancel}
              variant={ButtonVariants.secondary}
              onPress={() => setDeleting(null)}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

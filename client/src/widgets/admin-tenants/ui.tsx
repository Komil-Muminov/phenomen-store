import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ApiRoutes,
  AppRoutes,
  EntityStatuses,
  ManageListLimit,
  QueryKeys,
} from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { useStaffAuth } from '@/shared/staff-auth';
import { Icon, If, Screen } from '@/shared/ui';
import {
  IEnterResult,
  ITenant,
  ITenantList,
  TenantsTexts,
} from '@/widgets/admin-tenants/model';

export const AdminTenants = () => {
  const router = useRouter();
  const { signIn } = useStaffAuth();
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const tenantsQuery = useGetQuery<ITenantList>(
    [QueryKeys.adminTenants, page],
    ApiRoutes.tenantsSearch,
    { params: { page, limit: ManageListLimit } },
  );

  const statusMutation = useMutationQuery<{ id: string; activate: boolean }, ITenant>(
    (body) => `${body.activate ? ApiRoutes.tenantsActivate : ApiRoutes.tenantsDeactivate}/${body.id}`,
    { method: 'patch', invalidate: [[QueryKeys.adminTenants]] },
  );

  const enterMutation = useMutationQuery<{ id: string }, IEnterResult>(
    (body) => `${ApiRoutes.tenantsEnter}/${body.id}`,
  );

  const handleToggle = useCallback((tenant: ITenant) => {
    setBusyId(tenant.id);

    statusMutation.mutate(
      { id: tenant.id, activate: tenant.status !== EntityStatuses.active },
      { onSettled: () => setBusyId(null) },
    );
  }, [statusMutation]);

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
        }).then(() => router.replace(AppRoutes.admin));
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
          onPress={() => router.replace(AppRoutes.admin)}
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
    </Screen>
  );
};

import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IOrder } from '@/entities/order';
import {
  ApiRoutes,
  AppRoutes,
  ManageListLimit,
  ManageOrderStatuses,
  QueryKeys,
} from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { Icon, If, Screen } from '@/shared/ui';
import { IOrderList, OrdersTexts } from '@/widgets/admin-orders/model';
import { RenderOrder } from '@/widgets/admin-orders/ui/renderOrder';

export const AdminOrders = () => {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  const ordersQuery = useGetQuery<IOrderList>(
    [QueryKeys.adminOrders, status, page],
    ApiRoutes.manageOrders,
    { params: { page, limit: ManageListLimit, ...(status ? { status } : {}) } },
  );

  const statusMutation = useMutationQuery<{ id: string; status: string }, IOrder>(
    (body) => `${ApiRoutes.manageOrderStatus}/${body.id}`,
    { method: 'patch', invalidate: [[QueryKeys.adminOrders]] },
  );

  const handleFilter = useCallback((next: string | null) => {
    setStatus(next);
    setPage(1);
  }, []);

  const handleChangeStatus = useCallback((order: IOrder, next: string) => {
    setSavingId(order.id);

    statusMutation.mutate({ id: order.id, status: next }, {
      onSettled: () => setSavingId(null),
    });
  }, [statusMutation]);

  const items = ordersQuery.data?.items ?? [];
  const total = ordersQuery.data?.total ?? 0;
  const hasMore = page * ManageListLimit < total;

  return (
    <Screen padded={false}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-2">
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
            {OrdersTexts.title}
          </Text>
          <Text className="text-xs text-muted">{`Найдено: ${total}`}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 pb-3"
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => handleFilter(null)}
          className={`rounded-full border px-3 py-1.5 ${status ? 'border-line bg-background' : 'border-primary bg-primary'}`}
        >
          <Text className={`text-xs font-semibold ${status ? 'text-muted' : 'text-onPrimary'}`}>
            {OrdersTexts.allStatuses}
          </Text>
        </Pressable>

        {ManageOrderStatuses.map((item) => (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            onPress={() => handleFilter(item.value)}
            className={`rounded-full border px-3 py-1.5 ${status === item.value ? 'border-primary bg-primary' : 'border-line bg-background'}`}
          >
            <Text
              className={`text-xs font-semibold ${status === item.value ? 'text-onPrimary' : 'text-muted'}`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <If
          condition={items.length > 0 || ordersQuery.isLoading}
          fallback={(
            <View className="items-center rounded-2xl border border-line bg-surface px-4 py-10">
              <Text className="text-sm font-medium text-muted">
                {status ? OrdersTexts.emptyFiltered : OrdersTexts.empty}
              </Text>
            </View>
          )}
        >
          {items.map((order) => (
            <RenderOrder
              key={order.id}
              order={order}
              saving={savingId === order.id}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </If>

        <If condition={hasMore}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPage((current) => current + 1)}
            className="items-center rounded-2xl border border-line bg-surface py-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary">{OrdersTexts.loadMore}</Text>
          </Pressable>
        </If>
      </ScrollView>
    </Screen>
  );
};

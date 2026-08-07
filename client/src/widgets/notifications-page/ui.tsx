import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { Button, Icon, If, StateView } from '@/shared/ui';

interface INotification {
  id: string;
  title: string;
  text: string;
  time: string;
  kind: 'promo' | 'order' | 'system';
  unread: boolean;
  actionUrl?: string;
}

interface INotificationsResponse {
  items: INotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const TABS = [
  { key: 'all', label: 'Все' },
  { key: 'order', label: 'Заказы 📦' },
  { key: 'promo', label: 'Акции 🔥' },
  { key: 'system', label: 'Система 🛡️' },
] as const;

export const NotificationsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, refetch } = useGetQuery<INotificationsResponse>(
    [QueryKeys.notifications, activeTab, page],
    ApiRoutes.notificationsGet,
    {
      params: { kind: activeTab, page, limit: 20 },
      staleTime: StaleTimeMs.short,
    },
  );

  const deleteOne = useMutationQuery<any, void>(
    ApiRoutes.notificationsDelete,
    { invalidate: [[QueryKeys.notifications]] },
  );

  const clearAll = useMutationQuery<any, void>(
    ApiRoutes.notificationsClearAll,
    { invalidate: [[QueryKeys.notifications]] },
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeleteOne = useCallback((id: string) => {
    deleteOne.mutate(undefined, {
      urlParams: { id },
    });
  }, [deleteOne]);

  const handleClearAll = useCallback(() => {
    clearAll.mutate();
  }, [clearAll]);

  const items = data?.items ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Шапка с кнопкой «Очистить все» */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
          >
            <Icon name="chevronLeft" size={18} color="#171717" />
          </Pressable>
          <View>
            <Text className="text-xl font-extrabold tracking-tight text-content">Уведомления</Text>
            <If condition={Boolean(data?.unreadCount && data.unreadCount > 0)}>
              <Text className="text-[11px] font-bold text-primary">
                {data?.unreadCount} новых
              </Text>
            </If>
          </View>
        </View>

        <If condition={items.length > 0}>
          <Pressable
            onPress={handleClearAll}
            disabled={clearAll.isPending}
            className="flex-row items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1.5 border border-rose-500/20 active:bg-rose-500/20"
          >
            <Icon name="close" size={12} color="#e11d48" />
            <Text className="text-xs font-extrabold text-rose-600">Очистить все</Text>
          </Pressable>
        </If>
      </View>

      {/* Серверные табы фильтрации */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 border ${
                isActive
                  ? 'border-primary bg-primary'
                  : 'border-line bg-surface/60'
              }`}
            >
              <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted'}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Список уведомлений */}
      <If
        condition={!isLoading}
        fallback={<StateView loading />}
      >
        <If
          condition={items.length > 0}
          fallback={(
            <View className="flex-1 items-center justify-center gap-3 px-6 pb-20">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface border border-line">
                <Icon name="sparkles" size={32} color="#a3a3a3" />
              </View>
              <Text className="text-base font-bold text-content">Уведомлений пока нет</Text>
              <Text className="text-center text-xs text-muted">
                Здесь будут появляться акции, статусы ваших заказов и важные обновления
              </Text>
              <View className="pt-2 w-48">
                <Button title="В каталог" onPress={() => router.push(AppRoutes.catalog)} />
              </View>
            </View>
          )}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-3.5">
              {items.map((item) => (
                <View
                  key={item.id}
                  className={`gap-3 rounded-3xl border p-4 shadow-sm relative ${
                    item.unread
                      ? 'border-primary/40 bg-surface/90 shadow-md'
                      : 'border-line bg-background'
                  }`}
                >
                  {/* Верхняя строка карточки: Иконка категории, Название и время */}
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row items-start gap-3 flex-1">
                      <View
                        className={`h-10 w-10 items-center justify-center rounded-2xl ${
                          item.kind === 'promo'
                            ? 'bg-rose-500/10 border border-rose-500/20'
                            : item.kind === 'order'
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-primary/10 border border-primary/20'
                        }`}
                      >
                        <Icon
                          name={item.kind === 'promo' ? 'sparkles' : item.kind === 'order' ? 'bag' : 'user'}
                          size={18}
                          color={item.kind === 'promo' ? '#e11d48' : item.kind === 'order' ? '#10b981' : '#171717'}
                        />
                      </View>

                      <View className="flex-1 gap-0.5">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-extrabold text-content flex-1" numberOfLines={1}>
                            {item.title}
                          </Text>
                          <If condition={item.unread}>
                            <View className="h-2 w-2 rounded-full bg-primary" />
                          </If>
                        </View>
                        <Text className="text-[11px] font-medium text-muted">{item.time}</Text>
                      </View>
                    </View>

                    {/* Кнопка индивидуального удаления карточки */}
                    <Pressable
                      onPress={() => handleDeleteOne(item.id)}
                      className="h-8 w-8 items-center justify-center rounded-full bg-surface border border-line active:bg-rose-500/10 active:border-rose-500/30"
                    >
                      <Icon name="close" size={14} color="#a3a3a3" />
                    </Pressable>
                  </View>

                  {/* Текст уведомления */}
                  <Text className="text-xs leading-5 text-content/80 pl-1">{item.text}</Text>

                  {/* Экшен кнопка переход при наличии */}
                  <If condition={Boolean(item.actionUrl)}>
                    <View className="pt-1 self-start">
                      <Button
                        title={item.kind === 'promo' ? 'В каталог ›' : 'Детали ›'}
                        size="sm"
                        fullWidth={false}
                        onPress={() => router.push((item.actionUrl as any) ?? AppRoutes.catalog)}
                      />
                    </View>
                  </If>
                </View>
              ))}

              {/* Пагинация страниц при необходимости */}
              <If condition={Boolean(data?.totalPages && data.totalPages > 1)}>
                <View className="flex-row items-center justify-between pt-4 pb-8 border-t border-line">
                  <Button
                    title="‹ Назад"
                    size="sm"
                    disabled={page <= 1}
                    onPress={() => setPage((p) => Math.max(p - 1, 1))}
                  />
                  <Text className="text-xs font-bold text-muted">
                    Стр. {page} из {data?.totalPages}
                  </Text>
                  <Button
                    title="Вперед ›"
                    size="sm"
                    disabled={page >= (data?.totalPages ?? 1)}
                    onPress={() => setPage((p) => p + 1)}
                  />
                </View>
              </If>
            </View>
          </ScrollView>
        </If>
      </If>
    </SafeAreaView>
  );
};

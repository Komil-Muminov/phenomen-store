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
  { key: 'order', label: 'Заказы' },
  { key: 'promo', label: 'Акции' },
  { key: 'system', label: 'Система' },
] as const;

export const NotificationsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useGetQuery<INotificationsResponse>(
    [QueryKeys.notifications, activeTab, page],
    ApiRoutes.notificationsGet,
    {
      params: { kind: activeTab, page, limit: 20 },
      staleTime: StaleTimeMs.short,
    },
  );

  const deleteOne = useMutationQuery<string, void>(
    (id: string) => `${ApiRoutes.notificationsDelete}/${id}`,
    {
      method: 'delete',
      invalidate: [[QueryKeys.notifications]],
    },
  );

  const clearAll = useMutationQuery<void, void>(
    ApiRoutes.notificationsClearAll,
    {
      method: 'delete',
      invalidate: [[QueryKeys.notifications]],
    },
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeleteOne = useCallback((id: string) => {
    deleteOne.mutate(id);
  }, [deleteOne]);

  const handleClearAll = useCallback(() => {
    clearAll.mutate(undefined);
  }, [clearAll]);

  const items = data?.items ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Шапка экрана с минималистичной кнопкой очистки */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
          >
            <Icon name="arrow-left" size={18} color="#171717" />
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
            className="px-3 py-1.5 active:opacity-60"
          >
            <Text className="text-xs font-bold text-rose-600">Очистить все</Text>
          </Pressable>
        </If>
      </View>

      {/* Лаконичные нативные табы фильтрации */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="h-12 flex-grow-0"
        contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16, gap: 8 }}
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
              className={`rounded-full px-4 py-1.5 border items-center justify-center ${
                isActive
                  ? 'border-primary bg-primary'
                  : 'border-line bg-surface/50'
              }`}
            >
              <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted'}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Список минималистичных карточек */}
      <If
        condition={!isLoading}
        fallback={<StateView loading />}
      >
        <If
          condition={items.length > 0}
          fallback={(
            <View className="flex-1 items-center justify-center gap-3 px-6 pb-20">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface border border-line">
                <Icon name="sparkles" size={28} color="#a3a3a3" />
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-3">
              {items.map((item) => (
                <View
                  key={item.id}
                  className={`p-4 rounded-2xl border ${
                    item.unread
                      ? 'border-line bg-surface/80'
                      : 'border-line/50 bg-background'
                  }`}
                >
                  <View className="flex-row items-start gap-3">
                    {/* Минималистичная круглая иконка категории */}
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        item.kind === 'promo'
                          ? 'bg-rose-500/10'
                          : item.kind === 'order'
                            ? 'bg-emerald-500/10'
                            : 'bg-surface border border-line'
                      }`}
                    >
                      <Icon
                        name={item.kind === 'promo' ? 'sparkles' : item.kind === 'order' ? 'bag' : 'shield'}
                        size={16}
                        color={item.kind === 'promo' ? '#e11d48' : item.kind === 'order' ? '#10b981' : '#737373'}
                      />
                    </View>

                    {/* Текстовое содержимое карточки */}
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-row items-center gap-1.5 flex-1 pr-1">
                          <Text className="text-sm font-bold text-content leading-5 flex-1">
                            {item.title}
                          </Text>
                          <If condition={item.unread}>
                            <View className="h-2 w-2 rounded-full bg-primary" />
                          </If>
                        </View>

                        {/* Минималистичный крестик удаления */}
                        <Pressable
                          onPress={() => handleDeleteOne(item.id)}
                          className="h-6 w-6 items-center justify-center rounded-full active:bg-surface"
                        >
                          <Icon name="close" size={12} color="#a3a3a3" />
                        </Pressable>
                      </View>

                      <Text className="text-xs leading-5 text-muted">
                        {item.text}
                      </Text>

                      {/* Нижняя строка: Время и лаконичная ссылка */}
                      <View className="flex-row items-center justify-between pt-1.5 mt-0.5">
                        <Text className="text-[11px] font-medium text-muted/70">{item.time}</Text>

                        <If condition={Boolean(item.actionUrl)}>
                          <Pressable
                            onPress={() => router.push((item.actionUrl as any) ?? AppRoutes.catalog)}
                            className="flex-row items-center gap-1 active:opacity-70"
                          >
                            <Text className="text-xs font-bold text-primary">
                              {item.kind === 'promo' ? 'Перейти в каталог ›' : 'Детали ›'}
                            </Text>
                          </Pressable>
                        </If>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {/* Пагинатор страниц при наличии нескольких страниц */}
              <If condition={Boolean(data?.totalPages && data.totalPages > 1)}>
                <View className="flex-row items-center justify-between pt-4 pb-8 border-t border-line">
                  <Button
                    title="‹ Назад"
                    size="small"
                    disabled={page <= 1}
                    onPress={() => setPage((p) => Math.max(p - 1, 1))}
                  />
                  <Text className="text-xs font-bold text-muted">
                    Стр. {page} из {data?.totalPages}
                  </Text>
                  <Button
                    title="Вперед ›"
                    size="small"
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

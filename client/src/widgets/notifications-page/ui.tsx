import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppRoutes } from '@/shared/config';
import { Button, Icon } from '@/shared/ui';

interface INotification {
  id: string;
  title: string;
  text: string;
  time: string;
  kind: 'promo' | 'order' | 'news';
  unread?: boolean;
}

const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: 'n1',
    title: 'Закрытая распродажа',
    text: 'Используйте промокод PHENOMEN10 при оформлении заказа и получите скидку 10% на чек от 3000 смн.',
    time: '2 часа назад',
    kind: 'promo',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Статус заказа обновлен',
    text: 'Ваш заказ передан курьерской службе. Ожидайте звонка курьера за 30 минут до прибытия.',
    time: 'Вчера',
    kind: 'order',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Новая осенняя коллекция',
    text: 'Премиальные худи и базовые костюмы оверсайз кроя уже доступны для заказа в каталоге.',
    time: '3 дня назад',
    kind: 'news',
  },
];

export const NotificationsPage = () => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-line">
        <Pressable
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="arrow-left" size={20} />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-content">Уведомления</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-8">
          {MOCK_NOTIFICATIONS.map((item) => (
            <View
              key={item.id}
              className={`gap-2 rounded-2xl border p-4 shadow-sm ${
                item.unread ? 'border-primary/40 bg-surface/70' : 'border-line bg-background'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className={`h-7 w-7 items-center justify-center rounded-full ${
                      item.kind === 'promo'
                        ? 'bg-rose-500/10'
                        : item.kind === 'order'
                          ? 'bg-emerald-500/10'
                          : 'bg-primary/10'
                    }`}
                  >
                    <Icon
                      name={item.kind === 'promo' ? 'sparkles' : item.kind === 'order' ? 'bag' : 'search'}
                      size={14}
                      color={item.kind === 'promo' ? '#e11d48' : item.kind === 'order' ? '#10b981' : '#171717'}
                    />
                  </View>
                  <Text className="text-sm font-bold text-content">{item.title}</Text>
                </View>
                <Text className="text-[11px] font-medium text-muted">{item.time}</Text>
              </View>

              <Text className="text-xs leading-5 text-muted">{item.text}</Text>

              {item.kind === 'promo' && (
                <View className="pt-1 self-start">
                  <Button
                    title="В каталог"
                    size="sm"
                    fullWidth={false}
                    onPress={() => router.push(AppRoutes.catalog)}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

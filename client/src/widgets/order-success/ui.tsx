import { useCallback } from 'react';
import { Platform, ScrollView, StatusBar, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITenantConfig } from '@/entities/tenant';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { formatPrice, triggerHapticLight } from '@/shared/lib';
import { Button, ButtonVariants, Icon } from '@/shared/ui';

const TRACKING_STEPS = [
  { key: 'created', label: 'Принят', active: true },
  { key: 'processing', label: 'Сборка', active: true },
  { key: 'shipped', label: 'В пути', active: false },
  { key: 'delivered', label: 'Вручен', active: false },
];

export const OrderSuccess = () => {
  const router = useRouter();
  const { number, total } = useLocalSearchParams<{ number?: string; total?: string }>();
  const { data: config } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );

  const handleHome = useCallback(() => {
    triggerHapticLight();
    router.replace(AppRoutes.home);
  }, [router]);

  const handleCatalog = useCallback(() => {
    triggerHapticLight();
    router.replace(AppRoutes.catalog);
  }, [router]);

  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, justifyContent: 'center', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 items-center">
          {/* Анимированный успешный бейдж */}
          <View className="items-center gap-3">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 shadow-md">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                <Icon name="check" size={28} color="#ffffff" />
              </View>
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-black tracking-tight text-content text-center">
                Заказ успешно принят!
              </Text>
              <Text className="text-center text-xs font-semibold text-muted px-2 leading-5">
                Мы уже готовим ваш заказ к отправке. Уведомление о статусе придет по SMS.
              </Text>
            </View>
          </View>

          {/* Карточка деталей заказа */}
          <View className="w-full gap-4 rounded-3xl border border-line bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between border-b border-line/60 pb-3">
              <View>
                <Text className="text-[11px] font-bold text-muted uppercase tracking-wider">Номер заказа</Text>
                <Text className="text-base font-black text-content">{number ? `#${number}` : 'Заказ'}</Text>
              </View>
              <View className="items-end">
                <Text className="text-[11px] font-bold text-muted uppercase tracking-wider">Сумма заказа</Text>
                <Text className="text-base font-black text-content">
                  {formatPrice(Number(total ?? 0), config?.locale.currencySymbol ?? '')}
                </Text>
              </View>
            </View>

            {/* Прогресс стадий доставки с соединительной линией */}
            <View className="gap-2.5 pt-1">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Статус доставки
              </Text>

              <View className="relative flex-row items-center justify-between pt-2 px-2">
                {/* Соединительная фоновая линия */}
                <View className="absolute top-[18px] left-6 right-6 h-[2px] bg-slate-200 dark:bg-slate-800" />
                <View className="absolute top-[18px] left-6 w-1/3 h-[2px] bg-emerald-500" />

                {TRACKING_STEPS.map((step, idx) => (
                  <View key={step.key} className="items-center gap-1.5 z-10 min-w-[56px]">
                    <View
                      className={`h-7 w-7 items-center justify-center rounded-full border-2 shadow-2xs ${
                        step.active
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300 bg-surface'
                      }`}
                    >
                      {step.active ? (
                        <Icon name="check" size={12} color="#ffffff" />
                      ) : (
                        <Text className="text-[10px] font-black text-muted">{idx + 1}</Text>
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      className={`text-[10px] text-center font-bold tracking-tight ${
                        step.active ? 'text-emerald-600 font-black' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Кнопки дальнейших действий */}
          <View className="w-full gap-3 pt-2">
            <Button title="Продолжить покупки" onPress={handleCatalog} />
            <Button title="На главную" variant={ButtonVariants.secondary} onPress={handleHome} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

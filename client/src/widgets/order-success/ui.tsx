import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ITenantConfig } from '@/entities/tenant';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { formatPrice } from '@/shared/lib';
import { Button, ButtonVariants, Icon } from '@/shared/ui';

const TRACKING_STEPS = [
  { key: 'created', label: 'Оформлен', active: true },
  { key: 'processing', label: 'В сборке', active: true },
  { key: 'shipped', label: 'В пути', active: false },
  { key: 'delivered', label: 'Доставлен', active: false },
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
    router.replace(AppRoutes.home);
  }, [router]);

  const handleCatalog = useCallback(() => {
    router.replace(AppRoutes.catalog);
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-1 justify-center gap-6 px-5 py-4">
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-lg">
            <Icon name="check" size={32} color="#10b981" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-2xl font-black tracking-tight text-content">Заказ успешно принят!</Text>
            <Text className="text-center text-xs font-medium text-muted px-4">
              Мы уже готовим ваш заказ к отправке. Уведомление о статусе придет по SMS.
            </Text>
          </View>
        </View>

        <View className="gap-4 rounded-3xl border border-line bg-surface/50 p-5 shadow-sm">
          <View className="flex-row items-center justify-between border-b border-line pb-3">
            <View>
              <Text className="text-xs font-semibold text-muted">Номер заказа</Text>
              <Text className="text-lg font-black text-content">{number ? `#${number}` : 'Заказ'}</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs font-semibold text-muted">Сумма заказа</Text>
              <Text className="text-lg font-black text-content">
                {formatPrice(Number(total ?? 0), config?.locale.currencySymbol ?? '')}
              </Text>
            </View>
          </View>

          <View className="gap-2 pt-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">Статус доставки</Text>
            <View className="flex-row items-center justify-between pt-2 px-1">
              {TRACKING_STEPS.map((step, idx) => (
                <View key={step.key} className="items-center gap-1.5 flex-1 relative">
                  <View
                    className={`h-7 w-7 items-center justify-center rounded-full border ${
                      step.active
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-neutral-300 bg-background'
                    }`}
                  >
                    {step.active ? (
                      <Icon name="check" size={12} color="#ffffff" />
                    ) : (
                      <Text className="text-[10px] font-bold text-muted">{idx + 1}</Text>
                    )}
                  </View>
                  <Text
                    className={`text-[10px] text-center font-semibold ${
                      step.active ? 'text-emerald-600 font-extrabold' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="gap-3 pt-2">
          <Button title="Продолжить покупки" onPress={handleCatalog} />
          <Button title="На главную" variant={ButtonVariants.secondary} onPress={handleHome} />
        </View>
      </View>
    </SafeAreaView>
  );
};

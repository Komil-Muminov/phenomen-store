import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ITenantConfig } from '@/entities/tenant';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { formatPrice } from '@/shared/lib';
import { Button, ButtonVariants } from '@/shared/ui';

const Messages = {
  title: 'Заказ оформлен',
  subtitle: 'Мы отправили детали заказа и свяжемся для подтверждения',
  numberLabel: 'Номер заказа',
  totalLabel: 'Сумма',
  toHome: 'На главную',
  toCatalog: 'Продолжить покупки',
} as const;

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
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-content">{Messages.title}</Text>
          <Text className="text-sm text-muted">{Messages.subtitle}</Text>
        </View>

        <View className="gap-3 rounded-brandLg border border-line bg-surface p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">{Messages.numberLabel}</Text>
            <Text className="text-base font-semibold text-content">{number ?? ''}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">{Messages.totalLabel}</Text>
            <Text className="text-base font-semibold text-content">
              {formatPrice(Number(total ?? 0), config?.locale.currencySymbol ?? '')}
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <Button title={Messages.toCatalog} onPress={handleCatalog} />
          <Button title={Messages.toHome} variant={ButtonVariants.secondary} onPress={handleHome} />
        </View>
      </View>
    </SafeAreaView>
  );
};

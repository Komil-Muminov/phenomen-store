import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartItemRow, ICart, ICartItem } from '@/entities/cart';
import { ITenantConfig } from '@/entities/tenant';
import { CartSummary } from '@/features/cart-summary';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { Button, If, StateView } from '@/shared/ui';

export const CartPage = () => {
  const router = useRouter();
  const { data: config } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );
  const { data: cart, isLoading, error, refetch } = useGetQuery<ICart>(
    [QueryKeys.cart],
    ApiRoutes.cartGet,
    { staleTime: StaleTimeMs.short },
  );

  const updateItem = useMutationQuery<{ variantId: string; quantity: number }, ICart>(
    ApiRoutes.cartUpdate,
    { invalidate: [[QueryKeys.cart]] },
  );
  const applyPromo = useMutationQuery<{ code: string | null }, ICart>(
    ApiRoutes.cartPromo,
    { invalidate: [[QueryKeys.cart]] },
  );

  const handleQuantity = useCallback((item: ICartItem, quantity: number) => {
    updateItem.mutate({ variantId: item.variantId, quantity });
  }, [updateItem]);

  const handlePromo = useCallback((code: string | null) => {
    applyPromo.mutate({ code });
  }, [applyPromo]);

  const handleCheckout = useCallback(() => {
    router.push(AppRoutes.checkout);
  }, [router]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const busy = updateItem.isPending || applyPromo.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className={({ pressed }) => [
            'h-10 w-10 items-center justify-center rounded-brandSm border',
            pressed ? 'border-primary bg-surface' : 'border-line bg-background',
          ].join(' ')}
        >
          <Text className="text-lg text-content">←</Text>
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-content">Корзина</Text>
        <If condition={(cart?.items.length ?? 0) > 0}>
          <Text className="text-xs text-muted">{`${cart?.items.length ?? 0} тов.`}</Text>
        </If>
      </View>

      <If
        condition={Boolean(cart)}
        fallback={<StateView loading={isLoading} errorMessage={error?.message ?? null} onRetry={handleRetry} />}
      >
        <If
          condition={(cart?.items.length ?? 0) > 0}
          fallback={(
            <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
              <View className="h-20 w-20 items-center justify-center rounded-full border border-line bg-surface">
                <Text className="text-3xl">🛒</Text>
              </View>
              <View className="gap-1 items-center">
                <Text className="text-lg font-bold text-content">Ваша корзина пуста</Text>
                <Text className="text-center text-sm text-muted">
                  Выберите интересные товары из каталога, чтобы сделать свой первый заказ
                </Text>
              </View>
              <View className="w-full max-w-xs pt-2">
                <Button
                  title="Перейти к покупкам"
                  onPress={() => router.push(AppRoutes.catalog)}
                />
              </View>
            </View>
          )}
        >
          <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8" showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {(cart?.items ?? []).map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  currencySymbol={config?.locale.currencySymbol ?? ''}
                  disabled={busy}
                  onChangeQuantity={handleQuantity}
                />
              ))}
            </View>

            <CartSummary
              totals={(cart as ICart).totals}
              currencySymbol={config?.locale.currencySymbol ?? ''}
              promoCode={cart?.promoCode ?? null}
              promoApplied={Boolean(cart?.promoApplied)}
              minOrderTotal={cart?.minOrderTotal ?? 0}
              busy={busy}
              onApplyPromo={handlePromo}
              onCheckout={handleCheckout}
            />
          </ScrollView>
        </If>
      </If>
    </SafeAreaView>
  );
};

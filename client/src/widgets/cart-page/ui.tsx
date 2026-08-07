import { useCallback } from 'react';
import { Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartItemRow, DEFAULT_CART_TOTALS, ICart, ICartItem, countCartItems } from '@/entities/cart';
import { ITenantConfig } from '@/entities/tenant';
import { CartSummary } from '@/features/cart-summary';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { formatItemCount } from '@/shared/lib';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { BottomBar, Button, Icon, If, StateView } from '@/shared/ui';

export const CartPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);
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
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop }}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="arrow-left" size={20} />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-content">Корзина</Text>
        <If condition={(cart?.items.length ?? 0) > 0}>
          <Text className="text-xs font-semibold text-muted">{formatItemCount(cart?.items.length ?? 0)}</Text>
        </If>
      </View>

      <If
        condition={Boolean(cart)}
        fallback={
          isLoading ? (
            <View className="flex-1 px-4 pt-3 gap-3">
              {[1, 2].map((i) => (
                <View key={i} className="h-28 rounded-2xl bg-surface/60 border border-line/40 p-4 gap-3 flex-row items-center">
                  <View className="h-20 w-20 rounded-xl bg-muted/20" />
                  <View className="flex-1 gap-2">
                    <View className="h-4 w-3/4 rounded bg-muted/20" />
                    <View className="h-4 w-1/3 rounded bg-muted/10" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <StateView errorMessage={error?.message ?? null} onRetry={handleRetry} />
          )
        }
      >
        <If
          condition={(cart?.items.length ?? 0) > 0}
          fallback={(
            <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
              <View className="h-20 w-20 items-center justify-center rounded-full border border-line bg-surface/80">
                <Icon name="bag" size={36} color="#737373" />
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
              totals={cart?.totals ?? DEFAULT_CART_TOTALS}
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
      <BottomBar cartCount={countCartItems(cart)} />
    </View>
  );
};

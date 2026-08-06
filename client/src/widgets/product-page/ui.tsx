import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IProduct } from '@/entities/product';
import { ITenantConfig } from '@/entities/tenant';
import { ICart } from '@/entities/cart';
import { ISelectedOptions, ProductDetails, findVariant } from '@/features/product-details';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { Button, If, StateView } from '@/shared/ui';

const EMPTY_SELECTION: ISelectedOptions = { size: null, color: null };

const AddToCartLabels = {
  add: 'Добавить в корзину',
  select: 'Выберите размер и цвет',
} as const;

export const ProductPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selected, setSelected] = useState<ISelectedOptions>(EMPTY_SELECTION);

  const { data: config } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );
  const { data: product, isLoading, error, refetch } = useGetQuery<IProduct>(
    [QueryKeys.product, id],
    `${ApiRoutes.productGet}/${id}`,
    { enabled: Boolean(id), staleTime: StaleTimeMs.medium },
  );

  const addToCart = useMutationQuery<{ variantId: string; quantity: number }, ICart>(
    ApiRoutes.cartUpdate,
    { invalidate: [[QueryKeys.cart]] },
  );

  const [showAddedToast, setShowAddedToast] = useState(false);

  const selectedVariant = product ? findVariant(product, selected) : null;
  const canAdd = Boolean(selectedVariant && selected.size && selected.color && selectedVariant.stock > 0);

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant) {
      return;
    }

    addToCart.mutate(
      { variantId: selectedVariant.id, quantity: 1 },
      { onSuccess: () => setShowAddedToast(true) },
    );
  }, [addToCart, selectedVariant]);

  const handleSelect = useCallback((code: keyof ISelectedOptions, value: string) => {
    setSelected((current) => ({ ...current, [code]: current[code] === value ? null : value }));
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

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
        <Text numberOfLines={1} className="flex-1 text-base font-semibold text-content">
          {product?.name ?? ''}
        </Text>
      </View>

      <If
        condition={Boolean(product)}
        fallback={<StateView loading={isLoading} errorMessage={error?.message ?? null} onRetry={handleRetry} />}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ProductDetails
            product={product as IProduct}
            currencySymbol={config?.locale.currencySymbol ?? ''}
            selected={selected}
            onSelect={handleSelect}
          />
        </ScrollView>
      </If>

      <If condition={showAddedToast}>
        <View className="mx-4 my-2 flex-row items-center gap-2 rounded-brandSm border border-emerald-500/30 bg-emerald-500/10 p-3">
          <Text className="flex-1 text-xs font-semibold text-emerald-700">
            ✓ Товар успешно добавлен в корзину
          </Text>
          <Pressable
            onPress={() => router.push(AppRoutes.cart)}
            className="rounded-brandSm bg-emerald-600 px-3 py-1.5"
          >
            <Text className="text-xs font-bold text-white">Перейти</Text>
          </Pressable>
        </View>
      </If>

      <If condition={Boolean(product)}>
        <View className="border-t border-line px-4 py-3">
          <Button
            title={canAdd ? AddToCartLabels.add : AddToCartLabels.select}
            disabled={!canAdd}
            loading={addToCart.isPending}
            onPress={handleAddToCart}
          />
        </View>
      </If>
    </SafeAreaView>
  );
};

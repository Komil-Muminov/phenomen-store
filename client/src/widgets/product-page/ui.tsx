import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IProduct } from '@/entities/product';
import { ITenantConfig } from '@/entities/tenant';
import { ICart } from '@/entities/cart';
import { ISelectedOptions, ProductDetails, findVariant } from '@/features/product-details';
import { ProductRail } from '@/features/storefront-sections/ui/sections';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { formatPrice } from '@/shared/lib';
import { Button, Icon, If, SkeletonBox, StateView } from '@/shared/ui';

const EMPTY_SELECTION: ISelectedOptions = { size: null, color: null };

interface IProductList {
  items: IProduct[];
  total: number;
}

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

  const { data: catalog } = useGetQuery<IProductList>(
    [QueryKeys.products, 'recommendations'],
    ApiRoutes.productsSearch,
    { staleTime: StaleTimeMs.medium },
  );

  const recommendedProducts = (catalog?.items ?? []).filter((p) => p.id !== id).slice(0, 6);

  const addToCart = useMutationQuery<{ variantId: string; quantity: number }, ICart>(
    ApiRoutes.cartUpdate,
    { invalidate: [[QueryKeys.cart]] },
  );

  const [showAddedToast, setShowAddedToast] = useState(false);

  const selectedVariant = product ? findVariant(product, selected) : null;
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const currencySymbol = config?.locale.currencySymbol ?? '';
  const canAdd = Boolean(selectedVariant && selected.size && selected.color && selectedVariant.stock > 0);

  const buttonLabel = canAdd
    ? 'В корзину'
    : !selected.size
      ? 'Выберите размер'
      : !selected.color
        ? 'Выберите цвет'
        : 'Выберите размер';

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

  const handleProductPress = useCallback((item: IProduct) => {
    router.push(`${AppRoutes.product}/${item.id}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="arrow-left" size={20} />
        </Pressable>
        <Text numberOfLines={1} className="flex-1 text-lg font-bold text-content">
          {product?.name ?? ''}
        </Text>
      </View>

      <If condition={showAddedToast}>
        <View className="mx-4 my-2 flex-row items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 shadow-sm">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-emerald-600">
            <Icon name="check" size={14} color="#ffffff" />
          </View>
          <Text className="flex-1 text-xs font-bold text-emerald-800">
            Товар добавлен в корзину
          </Text>
          <Pressable
            onPress={() => router.push(AppRoutes.cart)}
            className="flex-row items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 active:bg-emerald-700"
          >
            <Text className="text-xs font-bold text-white">В корзину</Text>
            <Icon name="chevron-right" size={12} color="#ffffff" />
          </Pressable>
        </View>
      </If>

      <If
        condition={Boolean(product)}
        fallback={
          <StateView
            loading={isLoading}
            skeleton={
              <View className="flex-1 gap-4 px-4 py-2">
                <SkeletonBox className="h-96 w-full rounded-2xl" />
                <SkeletonBox className="h-6 w-3/4 rounded-md" />
                <SkeletonBox className="h-4 w-1/2 rounded-md" />
              </View>
            }
            errorMessage={error?.message ?? null}
            onRetry={handleRetry}
          />
        }
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ProductDetails
            product={product as IProduct}
            currencySymbol={currencySymbol}
            selected={selected}
            onSelect={handleSelect}
          />

          <If condition={recommendedProducts.length > 0}>
            <View className="gap-3 pt-2 pb-8">
              <Text className="px-4 text-base font-black tracking-tight text-content">
                Вам также может понравиться
              </Text>
              <ProductRail
                products={recommendedProducts}
                currencySymbol={currencySymbol}
                onPress={handleProductPress}
              />
            </View>
          </If>
        </ScrollView>
      </If>

      <If condition={Boolean(product)}>
        <View className="flex-row items-center gap-3 border-t border-line bg-background/95 px-4 py-3 pb-4">
          <View className="shrink justify-center pr-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-muted">Цена</Text>
            <Text className="text-lg font-extrabold text-content">
              {formatPrice(price, currencySymbol)}
            </Text>
          </View>

          <View className="flex-1">
            <Button
              title={buttonLabel}
              disabled={!canAdd}
              loading={addToCart.isPending}
              icon={canAdd ? <Icon name="bag" size={16} color="#ffffff" /> : undefined}
              onPress={handleAddToCart}
            />
          </View>
        </View>
      </If>
    </SafeAreaView>
  );
};

import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ICart, countCartItems } from '@/entities/cart';
import { IProduct, ProductCard } from '@/entities/product';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { formatItemCount } from '@/shared/lib';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { BottomBar, Button, Icon, If, StateView } from '@/shared/ui';
import { useWishlist } from '@/shared/wishlist';

interface IProductList {
  items: IProduct[];
  total: number;
}

export const WishlistPage = () => {
  const router = useRouter();
  const { wishlistIds, count } = useWishlist();

  const { data: catalog, isLoading, refetch } = useGetQuery<IProductList>(
    [QueryKeys.products, 'wishlist'],
    ApiRoutes.productsSearch,
    { staleTime: StaleTimeMs.medium },
  );

  const { data: cart } = useGetQuery<ICart>(
    [QueryKeys.cart],
    ApiRoutes.cartGet,
    { staleTime: StaleTimeMs.short },
  );

  const updateCart = useMutationQuery<any, ICart>(
    ApiRoutes.cartUpdate,
    { invalidate: [[QueryKeys.cart]] },
  );

  const wishlistedProducts = (catalog?.items ?? []).filter((p) => (
    wishlistIds.includes(p.id)
  ));

  const handleProductPress = useCallback((product: IProduct) => {
    router.push(`${AppRoutes.product}/${product.id}`);
  }, [router]);

  const handleAddToCart = useCallback((product: IProduct) => {
    const defaultVariant = product.variants[0];

    if (!defaultVariant) {
      router.push(`${AppRoutes.product}/${product.id}`);
      return;
    }

    const currentItems = cart?.items ?? [];
    const existingIndex = currentItems.findIndex((i) => i.variantId === defaultVariant.id);
    let nextItems;

    if (existingIndex >= 0) {
      nextItems = currentItems.map((item, idx) => (
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      nextItems = [
        ...currentItems,
        {
          variantId: defaultVariant.id,
          productId: product.id,
          name: product.name,
          sku: defaultVariant.sku,
          options: defaultVariant.options,
          quantity: 1,
          price: defaultVariant.price,
          oldPrice: defaultVariant.oldPrice,
          total: defaultVariant.price,
          stock: defaultVariant.stock,
          media: product.media[0] ?? null,
        },
      ];
    }

    updateCart.mutate({ items: nextItems });
  }, [cart?.items, router, updateCart]);

  return (
    <SafeAreaView className="flex-1 bg-background relative" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
        <Text className="text-xl font-extrabold tracking-tight text-content">Избранное</Text>
        <Text className="text-xs font-semibold text-muted">{formatItemCount(count)}</Text>
      </View>

      <If
        condition={!isLoading}
        fallback={<StateView loading />}
      >
        <If
          condition={count > 0 && wishlistedProducts.length > 0}
          fallback={(
            <View className="flex-1 items-center justify-center gap-3 px-6 pb-20">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface border border-line">
                <Icon name="heart" size={32} color="#a3a3a3" />
              </View>
              <Text className="text-base font-bold text-content">Список избранного пуст</Text>
              <Text className="text-center text-xs text-muted">
                Нажмите на сердечко на любом товаре, чтобы сохранить его сюда
              </Text>
              <View className="pt-2 w-48">
                <Button title="В каталог" onPress={() => router.push(AppRoutes.catalog)} />
              </View>
            </View>
          )}
        >
          <ScrollView className="flex-1 px-4 pt-3 pb-24" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-3 justify-between pb-24">
              {wishlistedProducts.map((product) => (
                <View key={product.id} className="w-[48%] gap-2">
                  <ProductCard
                    product={product}
                    currencySymbol="₽"
                    onPress={handleProductPress}
                    width="full"
                  />
                  <Button
                    title="В корзину"
                    size="sm"
                    loading={updateCart.isPending}
                    onPress={() => handleAddToCart(product)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </If>
      </If>

      <BottomBar cartCount={countCartItems(cart)} />
    </SafeAreaView>
  );
};

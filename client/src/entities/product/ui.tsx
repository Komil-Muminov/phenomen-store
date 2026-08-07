import { ReactNode, useCallback } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatDiscount, formatPrice } from '@/shared/lib';
import { Icon, If } from '@/shared/ui';
import { useWishlist } from '@/shared/wishlist';
import { useAddToCart } from '@/entities/cart';
import { IProduct, ProductPlaceholderImage } from '@/entities/product/model';

interface IProps {
  product: IProduct;
  currencySymbol: string;
  onPress: (product: IProduct) => void;
  onAddToCart?: (product: IProduct) => void;
  loadingAddToCart?: boolean;
  width?: 'card' | 'full';
  renderFooter?: (product: IProduct) => ReactNode;
}

const COLOR_MAP: Record<string, string> = {
  black: '#171717',
  white: '#f5f5f5',
  grey: '#9ca3af',
  red: '#ef4444',
  blue: '#3b82f6',
  beige: '#d4b996',
  green: '#10b981',
};

export const ProductCard = ({
  product,
  currencySymbol,
  onPress,
  onAddToCart,
  loadingAddToCart,
  width = 'card',
  renderFooter,
}: IProps) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart, isPending } = useAddToCart();
  const activeWish = isWishlisted(product.id);

  const availableColors = Array.from(
    new Set((product?.variants ?? []).map((v) => v?.options?.color).filter(Boolean)),
  ).slice(0, 4);

  const handleAddToCart = useCallback((e?: any) => {
    e?.stopPropagation?.();

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
  }, [onAddToCart, addToCart, product]);

  return (
    <Pressable
      onPress={() => onPress(product)}
      className={[
        'overflow-hidden rounded-2xl border border-line bg-background active:border-primary active:bg-surface/50 justify-between',
        width === 'card' ? 'w-44' : 'w-full flex-1',
      ].join(' ')}
    >
      <View className="flex-1 justify-between">
        {/* Верхняя часть: Изображение, бэйджи скидок и плавающие кнопки действий */}
        <View className="w-full">
          <View className="relative">
            <Image
              source={{ uri: product.media[0] ?? ProductPlaceholderImage }}
              className="h-52 w-full bg-surface"
              resizeMode="cover"
            />
            <If condition={Boolean(formatDiscount(product.price, product.oldPrice))}>
              <View className="absolute left-2.5 top-2.5 rounded-lg bg-accent px-2 py-1 shadow-sm">
                <Text className="text-[11px] font-bold text-onPrimary">
                  {formatDiscount(product.price, product.oldPrice)}
                </Text>
              </View>
            </If>

            {/* Пакет быстрых иконок в правом верхнем углу фото: Сумочка + Сердечко */}
            <View className="absolute right-2.5 top-2.5 flex-row items-center gap-1.5 z-10">
              <Pressable
                onPress={handleAddToCart}
                className="h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm border border-line active:scale-90"
              >
                <Icon name="bag" size={15} color="#171717" />
              </Pressable>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className="h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm border border-line active:scale-90"
              >
                <Icon name="heart" size={16} color={activeWish ? '#ef4444' : '#171717'} />
              </Pressable>
            </View>

            <If condition={product.media.length > 1}>
              <View className="absolute bottom-2.5 right-2.5 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-md">
                <Text className="text-[9px] font-bold text-white">1/{product.media.length}</Text>
              </View>
            </If>

            <If condition={!product.inStock}>
              <View className="absolute bottom-2.5 left-2.5 rounded-lg bg-surface/90 px-2 py-1">
                <Text className="text-[11px] font-medium text-muted">Нет в наличии</Text>
              </View>
            </If>
          </View>

          <View className="gap-1.5 p-3 pb-1">
            <Text
              numberOfLines={2}
              className="text-sm font-medium leading-5 text-content"
            >
              {product.name}
            </Text>

            <If condition={availableColors.length > 0}>
              <View className="flex-row items-center gap-1 py-0.5">
                {availableColors.map((col) => (
                  <View
                    key={col}
                    className="h-3 w-3 rounded-full border border-neutral-300"
                    style={{ backgroundColor: COLOR_MAP[col.toLowerCase()] ?? '#a3a3a3' }}
                  />
                ))}
              </View>
            </If>
          </View>
        </View>

        {/* Нижняя чистая часть: Только цена и пользовательский футер при наличии */}
        <View className="p-3 pt-1 mt-auto gap-2">
          <View className="flex-row flex-wrap items-baseline gap-x-1.5 gap-y-0.5 flex-1">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className="text-base font-bold text-content"
            >
              {formatPrice(product.price, currencySymbol)}
            </Text>
            <If condition={Boolean(product.oldPrice && product.oldPrice > product.price)}>
              <Text className="text-xs text-muted line-through">
                {formatPrice(product.oldPrice ?? 0, currencySymbol)}
              </Text>
            </If>
          </View>

          {Boolean(renderFooter) && renderFooter?.(product)}
        </View>
      </View>
    </Pressable>
  );
};

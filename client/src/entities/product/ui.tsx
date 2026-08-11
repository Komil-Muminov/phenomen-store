import { ReactNode, useCallback } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  formatDiscount,
  formatPrice,
  formatUnitPrice,
  resolveMediaUrl,
  triggerHapticLight,
  triggerHapticMedium,
} from '@/shared/lib';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const busyAddToCart = Boolean(loadingAddToCart) || isPending;
  const activeWish = isWishlisted(product.id);

  const bagScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const allColors = Array.from(
    new Set((product?.variants ?? []).map((v) => v?.options?.color).filter(Boolean)),
  );
  const availableColors = allColors.slice(0, 3);
  const extraColorsCount = Math.max(0, allColors.length - 3);

  const bagAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bagScale.value }],
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleAddToCart = useCallback((e?: any) => {
    e?.stopPropagation?.();
    triggerHapticMedium();
    bagScale.value = withSpring(1.25, { damping: 10, stiffness: 300 }, () => {
      bagScale.value = withSpring(1);
    });

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
  }, [onAddToCart, addToCart, product, bagScale]);

  const handleToggleWishlist = useCallback((e?: any) => {
    e?.stopPropagation?.();
    triggerHapticLight();
    heartScale.value = withSpring(1.3, { damping: 10, stiffness: 300 }, () => {
      heartScale.value = withSpring(1);
    });
    toggleWishlist(product.id);
  }, [toggleWishlist, product.id, heartScale]);

  const createdDaysAgo = product.createdAt
    ? Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isNewProduct = Boolean(!product.createdAt || createdDaysAgo <= 180 || product.attributes?.isNew === 'true');

  const discountText = formatDiscount(product.price, product.oldPrice);

  return (
    <Pressable
      onPress={() => {
        triggerHapticLight();
        onPress(product);
      }}
      className={[
        'overflow-hidden rounded-3xl border border-line bg-surface shadow-sm active:opacity-95 justify-between',
        width === 'card' ? 'w-44' : 'w-full flex-1',
      ].join(' ')}
    >
      <View className="flex-1 justify-between">
        {/* Верхняя часть: Изображение, премиум-бейдж и быстрые кнопки */}
        <View className="w-full">
          <View className="relative overflow-hidden rounded-t-3xl">
            <Image
              source={{ uri: resolveMediaUrl(product.media[0]) || ProductPlaceholderImage }}
              className="h-52 w-full bg-surface-elevated"
              resizeMode="cover"
            />

            {/* Градиентные / капсульные плашки скидки & NEW */}
            <If condition={Boolean(discountText)}>
              <View className="absolute left-2.5 top-2.5 rounded-full bg-rose-600 px-2.5 py-1 shadow-md z-10">
                <Text className="text-[10px] font-black uppercase tracking-wider text-white">
                  {discountText}
                </Text>
              </View>
            </If>
            <If condition={!discountText && isNewProduct}>
              <View className="absolute left-2.5 top-2.5 rounded-full bg-emerald-600 px-2.5 py-1 shadow-md z-10">
                <Text className="text-[9px] font-black uppercase tracking-wider text-white">
                  NEW
                </Text>
              </View>
            </If>

            {/* Кнопки быстрых действий: Добавить в корзину + В избранное */}
            <View className="absolute right-2.5 top-2.5 flex-row items-center gap-1.5 z-10">
              <AnimatedPressable
                onPress={handleAddToCart}
                disabled={busyAddToCart}
                style={bagAnimStyle}
                className={[
                  'h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md border border-white/40 backdrop-blur-md',
                  busyAddToCart ? 'opacity-50' : '',
                ].join(' ')}
              >
                <Icon name="bag" size={14} color="#0f172a" />
              </AnimatedPressable>

              <AnimatedPressable
                onPress={handleToggleWishlist}
                style={heartAnimStyle}
                className={`h-8 w-8 items-center justify-center rounded-full shadow-md border backdrop-blur-md ${
                  activeWish ? 'bg-rose-500 border-rose-600' : 'bg-white/90 border-white/40'
                }`}
              >
                <Icon name="heart" size={14} color={activeWish ? '#ffffff' : '#0f172a'} />
              </AnimatedPressable>
            </View>

            {/* Точечный индикатор медиа (dots preview) */}
            <If condition={product.media.length > 1}>
              <View className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-md">
                {product.media.slice(0, 4).map((_, idx) => (
                  <View
                    key={idx}
                    className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? 'bg-white w-2.5' : 'bg-white/50'}`}
                  />
                ))}
              </View>
            </If>

            <If condition={!product.inStock}>
              <View className="absolute bottom-2.5 left-2.5 rounded-full bg-black/75 px-2.5 py-1 backdrop-blur-md">
                <Text className="text-[10px] font-semibold text-white/90">Нет в наличии</Text>
              </View>
            </If>
          </View>

          {/* Информационный блок */}
          <View className="gap-1.5 p-3 pb-1">
            <Text
              numberOfLines={2}
              className="text-xs font-semibold leading-4 text-content"
            >
              {product.name}
            </Text>

            <If condition={availableColors.length > 0}>
              <View className="flex-row items-center gap-1.5 py-0.5">
                {availableColors.map((col) => (
                  <View
                    key={col}
                    className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: COLOR_MAP[col.toLowerCase()] ?? '#a3a3a3' }}
                  />
                ))}
                {extraColorsCount > 0 && (
                  <Text className="text-[9px] font-bold text-muted">+{extraColorsCount}</Text>
                )}
              </View>
            </If>
          </View>
        </View>

        {/* Нижний блок цены */}
        <View className="p-3 pt-1 mt-auto gap-2">
          <View className="flex-row flex-wrap items-baseline gap-x-1.5 gap-y-0.5 flex-1">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className="text-sm font-extrabold tracking-tight text-content"
            >
              {formatUnitPrice(product.price, currencySymbol, product.unit)}
            </Text>
            <If condition={Boolean(product.oldPrice && product.oldPrice > product.price)}>
              <Text className="text-[11px] font-medium text-muted line-through">
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

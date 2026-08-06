import { Image, Pressable, Text, View } from 'react-native';
import { formatDiscount, formatPrice } from '@/shared/lib';
import { Icon, If } from '@/shared/ui';
import { useWishlist } from '@/shared/wishlist';
import { IProduct, ProductPlaceholderImage } from '@/entities/product/model';

interface IProps {
  product: IProduct;
  currencySymbol: string;
  onPress: (product: IProduct) => void;
  width?: 'card' | 'full';
}

export const ProductCard = ({ product, currencySymbol, onPress, width = 'card' }: IProps) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const activeWish = isWishlisted(product.id);

  return (
    <Pressable
      onPress={() => onPress(product)}
      className={[
        'overflow-hidden rounded-2xl border border-line bg-background active:border-primary active:bg-surface/50',
        width === 'card' ? 'w-44' : 'w-full',
      ].join(' ')}
    >
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

        <Pressable
          onPress={() => toggleWishlist(product.id)}
          className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm border border-line"
        >
          <Icon name="heart" size={16} color={activeWish ? '#ef4444' : '#171717'} />
        </Pressable>

        <If condition={!product.inStock}>
          <View className="absolute bottom-2.5 left-2.5 rounded-lg bg-surface/90 px-2 py-1">
            <Text className="text-[11px] font-medium text-muted">Нет в наличии</Text>
          </View>
        </If>
      </View>

      <View className="gap-1.5 p-3">
        <Text numberOfLines={2} className="text-sm font-medium leading-5 text-content">
          {product.name}
        </Text>
        <View className="flex-row items-baseline gap-2 pt-0.5">
          <Text className="text-base font-bold text-content">
            {formatPrice(product.price, currencySymbol)}
          </Text>
          <If condition={Boolean(product.oldPrice && product.oldPrice > product.price)}>
            <Text className="text-xs text-muted line-through">
              {formatPrice(product.oldPrice ?? 0, currencySymbol)}
            </Text>
          </If>
        </View>
      </View>
    </Pressable>
  );
};

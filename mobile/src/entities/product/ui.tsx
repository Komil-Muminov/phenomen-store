import { Image, Pressable, Text, View } from 'react-native';
import { formatDiscount, formatPrice } from '@/shared/lib';
import { If } from '@/shared/ui';
import { IProduct, ProductPlaceholderImage } from '@/entities/product/model';

interface IProps {
  product: IProduct;
  currencySymbol: string;
  onPress: (product: IProduct) => void;
  width?: 'card' | 'full';
}

export const ProductCard = ({ product, currencySymbol, onPress, width = 'card' }: IProps) => (
  <Pressable
    onPress={() => onPress(product)}
    className={({ pressed }) => [
      'overflow-hidden rounded-brandMd border bg-background',
      pressed ? 'border-primary bg-surface' : 'border-line',
      width === 'card' ? 'w-44' : 'w-full',
    ].join(' ')}
  >
    <View className="relative">
      <Image
        source={{ uri: product.media[0] ?? ProductPlaceholderImage }}
        className="h-56 w-full bg-surface"
        resizeMode="cover"
      />
      <If condition={Boolean(formatDiscount(product.price, product.oldPrice))}>
        <View className="absolute left-2 top-2 rounded-brandSm bg-accent px-2 py-1">
          <Text className="text-xs font-semibold text-onPrimary">
            {formatDiscount(product.price, product.oldPrice)}
          </Text>
        </View>
      </If>
      <If condition={!product.inStock}>
        <View className="absolute bottom-2 left-2 rounded-brandSm bg-surface px-2 py-1">
          <Text className="text-xs text-muted">Нет в наличии</Text>
        </View>
      </If>
    </View>

    <View className="gap-1 p-3">
      <Text numberOfLines={2} className="text-sm text-content">{product.name}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-semibold text-content">
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

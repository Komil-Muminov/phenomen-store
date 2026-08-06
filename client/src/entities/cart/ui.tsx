import { Image, Pressable, Text, View } from 'react-native';
import { ProductPlaceholderImage } from '@/entities/product';
import { formatPrice } from '@/shared/lib';
import { If } from '@/shared/ui';
import { ICartItem } from '@/entities/cart/model';

interface IProps {
  item: ICartItem;
  currencySymbol: string;
  disabled: boolean;
  onChangeQuantity: (item: ICartItem, quantity: number) => void;
}

const stepperClassName = (pressed: boolean): string => [
  'h-9 w-9 items-center justify-center rounded-brandSm border',
  pressed ? 'border-primary bg-surface' : 'border-line bg-background',
].join(' ');

export const CartItemRow = ({ item, currencySymbol, disabled, onChangeQuantity }: IProps) => (
  <View className="flex-row gap-3 border-b border-line pb-3">
    <Image
      source={{ uri: item.media ?? ProductPlaceholderImage }}
      className="h-24 w-20 rounded-brandSm bg-surface"
      resizeMode="cover"
    />
    <View className="flex-1 gap-1">
      <Text numberOfLines={2} className="text-sm text-content">{item.name}</Text>
      <Text className="text-xs text-muted">
        {Object.values(item.options).filter(Boolean).join(' · ')}
      </Text>
      <Text className="text-base font-semibold text-content">
        {formatPrice(item.total, currencySymbol)}
      </Text>
      <If condition={item.quantity > item.stock}>
        <Text className="text-xs text-danger">{`Доступно только ${item.stock}`}</Text>
      </If>
    </View>
    <View className="items-center justify-center gap-2">
      <Pressable
        disabled={disabled}
        onPress={() => onChangeQuantity(item, item.quantity + 1)}
        className="h-9 w-9 items-center justify-center rounded-brandSm border border-line bg-background active:border-primary active:bg-surface"
      >
        <Text className="text-base text-content">+</Text>
      </Pressable>
      <Text className="text-sm text-content">{item.quantity}</Text>
      <Pressable
        disabled={disabled}
        onPress={() => onChangeQuantity(item, item.quantity - 1)}
        className="h-9 w-9 items-center justify-center rounded-brandSm border border-line bg-background active:border-primary active:bg-surface"
      >
        <Text className="text-base text-content">−</Text>
      </Pressable>
    </View>
  </View>
);

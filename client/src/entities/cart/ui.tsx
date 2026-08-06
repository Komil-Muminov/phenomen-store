import { Image, Pressable, Text, View } from 'react-native';
import { ProductPlaceholderImage } from '@/entities/product';
import { formatPrice } from '@/shared/lib';
import { Icon, If } from '@/shared/ui';
import { ICartItem } from '@/entities/cart/model';

interface IProps {
  item: ICartItem;
  currencySymbol: string;
  disabled: boolean;
  onChangeQuantity: (item: ICartItem, quantity: number) => void;
}

export const CartItemRow = ({ item, currencySymbol, disabled, onChangeQuantity }: IProps) => (
  <View className="flex-row gap-3 rounded-2xl border border-line bg-surface/50 p-3">
    <Image
      source={{ uri: item.media ?? ProductPlaceholderImage }}
      className="h-24 w-20 rounded-xl bg-surface"
      resizeMode="cover"
    />

    <View className="flex-1 justify-between py-0.5">
      <View className="gap-1">
        <Text numberOfLines={2} className="text-sm font-semibold leading-5 text-content">
          {item.name}
        </Text>
        <If condition={Boolean(Object.values(item.options).filter(Boolean).length)}>
          <Text className="text-xs font-medium text-muted">
            {Object.values(item.options).filter(Boolean).join(' · ')}
          </Text>
        </If>
      </View>

      <Text className="text-base font-bold text-content">
        {formatPrice(item.total, currencySymbol)}
      </Text>

      <If condition={item.quantity > item.stock}>
        <Text className="text-xs font-medium text-danger">{`Доступно только ${item.stock}`}</Text>
      </If>
    </View>

    <View className="items-center justify-between py-0.5">
      <Pressable
        disabled={disabled}
        onPress={() => onChangeQuantity(item, item.quantity + 1)}
        className="h-8 w-8 items-center justify-center rounded-lg border border-line bg-background active:border-primary active:bg-surface"
      >
        <Icon name="plus" size={14} />
      </Pressable>

      <Text className="text-sm font-bold text-content">{item.quantity}</Text>

      <Pressable
        disabled={disabled}
        onPress={() => onChangeQuantity(item, item.quantity - 1)}
        className="h-8 w-8 items-center justify-center rounded-lg border border-line bg-background active:border-primary active:bg-surface"
      >
        <Icon name={item.quantity === 1 ? 'trash' : 'minus'} size={14} color={item.quantity === 1 ? '#ef4444' : '#171717'} />
      </Pressable>
    </View>
  </View>
);

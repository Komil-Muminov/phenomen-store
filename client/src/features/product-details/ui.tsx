import { FlatList, Image, Text, View } from 'react-native';
import { IProduct, ProductPlaceholderImage, VariantOptionCodes } from '@/entities/product';
import { formatDiscount, formatPrice } from '@/shared/lib';
import { If } from '@/shared/ui';
import {
  AttributeLabels,
  ISelectedOptions,
  StockMessages,
  findVariant,
} from '@/features/product-details/model';
import { OptionPicker } from '@/features/product-details/ui/renderOptions';

interface IProps {
  product: IProduct;
  currencySymbol: string;
  selected: ISelectedOptions;
  onSelect: (code: keyof ISelectedOptions, value: string) => void;
}

export const ProductDetails = ({ product, currencySymbol, selected, onSelect }: IProps) => {
  const variant = findVariant(product, selected);
  const price = variant?.price ?? product.price;
  const oldPrice = variant?.oldPrice ?? product.oldPrice;
  const stockLabel = variant
    ? `${StockMessages.inStock}: ${variant.stock}`
    : StockMessages.selectOptions;

  return (
    <View className="gap-5 pb-8">
      <FlatList
        horizontal
        data={product.media.length > 0 ? product.media : [ProductPlaceholderImage]}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4"
        renderItem={({ item }) => (
          <Image source={{ uri: item }} className="h-96 w-72 rounded-brandLg bg-surface" resizeMode="cover" />
        )}
      />

      <View className="gap-2 px-4">
        <If condition={Boolean(product.brand)}>
          <Text className="text-xs uppercase text-muted">{product.brand}</Text>
        </If>
        <Text className="text-2xl font-bold text-content">{product.name}</Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-xl font-semibold text-content">{formatPrice(price, currencySymbol)}</Text>
          <If condition={Boolean(oldPrice && oldPrice > price)}>
            <Text className="text-sm text-muted line-through">{formatPrice(oldPrice ?? 0, currencySymbol)}</Text>
          </If>
          <If condition={Boolean(formatDiscount(price, oldPrice))}>
            <View className="rounded-brandSm bg-accent px-2 py-1">
              <Text className="text-xs font-semibold text-onPrimary">{formatDiscount(price, oldPrice)}</Text>
            </View>
          </If>
        </View>
        <Text className={variant && variant.stock > 0 ? 'text-sm text-success' : 'text-sm text-muted'}>
          {product.inStock ? stockLabel : StockMessages.outOfStock}
        </Text>
      </View>

      <View className="gap-4 px-4">
        <OptionPicker
          product={product}
          code={VariantOptionCodes.size}
          selected={selected}
          onSelect={onSelect}
        />
        <OptionPicker
          product={product}
          code={VariantOptionCodes.color}
          selected={selected}
          onSelect={onSelect}
        />
      </View>

      <If condition={Boolean(product.description)}>
        <View className="gap-2 px-4">
          <Text className="text-sm font-semibold text-content">Описание</Text>
          <Text className="text-sm leading-5 text-muted">{product.description}</Text>
        </View>
      </If>

      <View className="mx-4 gap-2 rounded-brandLg border border-line p-4">
        {Object.entries(AttributeLabels).map(([code, label]) => (
          <If key={code} condition={Boolean(product.attributes[code])}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">{label}</Text>
              <Text className="text-sm text-content">{product.attributes[code]}</Text>
            </View>
          </If>
        ))}
      </View>
    </View>
  );
};

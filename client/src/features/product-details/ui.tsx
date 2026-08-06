import { FlatList, Image, Text, View } from 'react-native';
import { IProduct, ProductPlaceholderImage, VariantOptionCodes } from '@/entities/product';
import { formatDiscount, formatPrice } from '@/shared/lib';
import { Icon, If } from '@/shared/ui';
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

const MOCK_REVIEWS = [
  {
    id: 'r1',
    author: 'Алишер К.',
    rating: 5,
    date: 'Вчера',
    text: 'Качество бомба! Плотная ткань, оверсайз сидит идеально. Покупкой очень доволен.',
  },
  {
    id: 'r2',
    author: 'Мадина С.',
    rating: 5,
    date: '3 дня назад',
    text: 'Очень приятная к телу ткань, после стирки цвет не потеряла. Доставка быстрая!',
  },
];

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
        contentContainerClassName="gap-3 px-4"
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            className="h-96 w-80 rounded-2xl bg-surface"
            resizeMode="cover"
          />
        )}
      />

      <View className="gap-2.5 px-4">
        <View className="flex-row items-center justify-between">
          <If condition={Boolean(product.brand)}>
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">
              {product.brand}
            </Text>
          </If>

          <View className="flex-row items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 border border-amber-500/20">
            <Text className="text-xs text-amber-500 font-bold">★ 4.9</Text>
            <Text className="text-[11px] font-semibold text-amber-700">(24 отзыва)</Text>
          </View>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-content">
          {product.name}
        </Text>

        <View className="flex-row items-center gap-3">
          <Text className="text-2xl font-bold text-content">
            {formatPrice(price, currencySymbol)}
          </Text>
          <If condition={Boolean(oldPrice && oldPrice > price)}>
            <Text className="text-sm text-muted line-through">
              {formatPrice(oldPrice ?? 0, currencySymbol)}
            </Text>
          </If>
          <If condition={Boolean(formatDiscount(price, oldPrice))}>
            <View className="rounded-lg bg-accent px-2.5 py-1">
              <Text className="text-xs font-bold text-onPrimary">
                {formatDiscount(price, oldPrice)}
              </Text>
            </View>
          </If>
        </View>

        <View className="flex-row items-center gap-1.5 pt-0.5">
          <View
            className={`h-2 w-2 rounded-full ${
              product.inStock && (!variant || variant.stock > 0) ? 'bg-emerald-500' : 'bg-neutral-400'
            }`}
          />
          <Text
            className={
              variant && variant.stock > 0
                ? 'text-xs font-semibold text-emerald-600'
                : 'text-xs font-medium text-muted'
            }
          >
            {product.inStock ? stockLabel : StockMessages.outOfStock}
          </Text>
        </View>
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
          <Text className="text-sm font-bold text-content">Описание</Text>
          <Text className="text-sm leading-6 text-muted">{product.description}</Text>
        </View>
      </If>

      <View className="mx-4 gap-2.5 rounded-2xl border border-line bg-surface/50 p-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-muted pb-1">Характеристики</Text>
        {Object.entries(AttributeLabels).map(([code, label]) => (
          <If key={code} condition={Boolean(product.attributes[code])}>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-medium text-muted">{label}</Text>
              <Text className="text-xs font-semibold text-content">{product.attributes[code]}</Text>
            </View>
          </If>
        ))}
      </View>

      <View className="gap-3 px-4 pt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-content">Отзывы покупателей</Text>
          <Text className="text-xs font-bold text-primary">Все отзывы (24)</Text>
        </View>

        <View className="gap-3">
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} className="gap-2 rounded-2xl border border-line bg-surface/40 p-3.5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Text className="text-xs font-bold text-primary">{review.author[0]}</Text>
                  </View>
                  <Text className="text-xs font-bold text-content">{review.author}</Text>
                </View>
                <Text className="text-[11px] text-amber-500 font-bold">★★★★★</Text>
              </View>
              <Text className="text-xs leading-5 text-muted">{review.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

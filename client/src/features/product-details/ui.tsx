import { useState } from 'react';
import { FlatList, Image, Text, View, useWindowDimensions } from 'react-native';
import { IProduct, ProductPlaceholderImage } from '@/entities/product';
import { formatDiscount, formatPrice, formatUnitPrice } from '@/shared/lib';
import { If } from '@/shared/ui';
import {
  AttributeLabels,
  ISelectedOptions,
  OptionLabels,
  StockMessages,
  findVariant,
} from '@/features/product-details/model';
import { OptionPicker } from '@/features/product-details/ui/renderOptions';
import { SizeGuideModal } from '@/features/product-details/ui/SizeGuideModal';

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
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const variant = findVariant(product, selected);
  const price = variant?.price ?? product.price;
  const oldPrice = variant?.oldPrice ?? product.oldPrice;
  const stockLabel = variant
    ? `${StockMessages.inStock}: ${variant.stock}`
    : StockMessages.selectOptions;

  const mediaList = (product?.media && product.media.length > 0)
    ? product.media
    : [ProductPlaceholderImage];
  const cardWidth = Math.max(screenWidth - 32, 280);

  // Динамическое формирование селекторов вариантов из вариантов товара
  const optionTypes = [
    {
      code: 'size',
      label: OptionLabels.size ?? 'Размер',
      values: Array.from(
        new Set((product?.variants ?? []).map((v) => v.options?.size).filter(Boolean)),
      ),
    },
    {
      code: 'color',
      label: OptionLabels.color ?? 'Цвет',
      values: Array.from(
        new Set((product?.variants ?? []).map((v) => v.options?.color).filter(Boolean)),
      ),
    },
  ].filter((opt) => opt.values.length > 0);

  // Выделение атрибутов характеристик (Материал, Сезон и т.д.)
  const rawAttributes = product?.attributes;
  const attributeEntries = Array.isArray(rawAttributes)
    ? (rawAttributes as Array<{ code: string; values: string[] }>).map((a) => [a.code, a.values.join(', ')])
    : (rawAttributes && typeof rawAttributes === 'object')
      ? Object.entries(rawAttributes)
      : [];

  return (
    <View className="gap-5 pb-8">
      {/* Главная фотогалерея по центру экрана */}
      <View className="relative items-center">
        <FlatList
          horizontal
          data={mediaList}
          keyExtractor={(item, index) => `${item}-${index}`}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + 12));
            setActiveMediaIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth, marginRight: 12 }} className="items-center justify-center">
              <Image
                source={{ uri: item }}
                style={{ width: cardWidth, height: cardWidth * 1.2 }}
                className="rounded-3xl bg-surface"
                resizeMode="cover"
              />
            </View>
          )}
        />

        {/* Пагинатор фото по центру */}
        <If condition={mediaList.length > 1}>
          <View className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 flex-row items-center gap-1.5">
            {mediaList.map((_, idx) => (
              <View
                key={idx}
                className={`h-1.5 rounded-full ${
                  idx === activeMediaIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </View>
        </If>
      </View>

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

        <View className="flex-row items-baseline gap-2 pt-1">
          <Text className="text-2xl font-black text-content">
            {formatUnitPrice(price, currencySymbol, product.unit)}
          </Text>
          <If condition={Boolean(oldPrice && oldPrice > price)}>
            <Text className="text-base text-muted line-through">
              {formatPrice(oldPrice ?? 0, currencySymbol)}
            </Text>
          </If>
          <If condition={Boolean(formatDiscount(price, oldPrice))}>
            <View className="rounded-lg bg-accent px-2 py-0.5 ml-1">
              <Text className="text-xs font-bold text-onPrimary">
                {formatDiscount(price, oldPrice)}
              </Text>
            </View>
          </If>
        </View>
      </View>

      {/* Селекторы вариантов (Размер, Цвет) */}
      <View className="gap-4 px-4 pt-2">
        {optionTypes.map((attr) => (
          <OptionPicker
            key={attr.code}
            code={attr.code}
            values={attr.values}
            selected={selected[attr.code as keyof ISelectedOptions]}
            onSelect={(val) => onSelect(attr.code as keyof ISelectedOptions, val)}
            label={attr.label}
            onOpenSizeGuide={() => setShowSizeGuide(true)}
          />
        ))}

        {/* Таблица характеристик (Материал, Сезон и т.д.) */}
        <If condition={attributeEntries.length > 0}>
          <View className="gap-2 pt-2 border-t border-line/60">
            <Text className="text-xs font-bold text-muted uppercase tracking-wider">Характеристики</Text>
            {attributeEntries.map(([code, val]) => (
              <View key={code} className="flex-row items-center justify-between py-1 border-b border-line/30">
                <Text className="text-xs font-medium text-muted">
                  {AttributeLabels[code] ?? code}
                </Text>
                <Text className="text-xs font-bold text-content">{String(val)}</Text>
              </View>
            ))}
          </View>
        </If>

        <Text className="text-xs font-medium text-muted pt-1">{stockLabel}</Text>
      </View>

      <If condition={Boolean(product.description)}>
        <View className="gap-2 px-4 pt-2 border-t border-line mt-2">
          <Text className="text-sm font-bold text-content">Описание товара</Text>
          <Text className="text-xs leading-5 text-muted">{product.description}</Text>
        </View>
      </If>

      {/* Отзывы покупателей */}
      <View className="gap-3 px-4 pt-4 border-t border-line mt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-content">Отзывы покупателей</Text>
          <Text className="text-xs font-bold text-primary">Все 24 отзыва ›</Text>
        </View>

        {MOCK_REVIEWS.map((rev) => (
          <View key={rev.id} className="gap-1.5 rounded-2xl bg-surface p-3.5 border border-line">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold text-content">{rev.author}</Text>
              <Text className="text-[10px] text-muted">{rev.date}</Text>
            </View>
            <Text className="text-xs text-amber-500 font-bold">★ ★ ★ ★ ★</Text>
            <Text className="text-xs text-muted leading-4">{rev.text}</Text>
          </View>
        ))}
      </View>

      {/* Модалка Таблицы Размеров */}
      <SizeGuideModal
        visible={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />
    </View>
  );
};

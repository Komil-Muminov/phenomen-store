import { useCallback, useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { useAddToCart } from '@/entities/cart';
import { IProduct, ProductPlaceholderImage } from '@/entities/product';
import { findVariant } from '@/features/product-details';
import { formatUnitPrice, initialQuantity } from '@/shared/lib';
import { Button, Icon, If } from '@/shared/ui';

interface IProps {
  product: IProduct | null;
  currencySymbol?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickAddModal = ({ product, currencySymbol = 'смн', onClose, onSuccess }: IProps) => {
  const { addToCart, isPending } = useAddToCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const availableSizes = Array.from(
    new Set((product?.variants ?? []).map((v) => v?.options?.size).filter(Boolean)),
  );
  const availableColors = Array.from(
    new Set((product?.variants ?? []).map((v) => v?.options?.color).filter(Boolean)),
  );

  const activeSize = selectedSize ?? availableSizes[0] ?? null;
  const activeColor = selectedColor ?? availableColors[0] ?? null;

  const targetVariant = product
    ? findVariant(product, { size: activeSize, color: activeColor }) ?? product.variants[0]
    : null;

  const handleAdd = useCallback(() => {
    if (!product || !targetVariant) {
      return;
    }

    addToCart(
      { variantId: targetVariant.id, quantity: initialQuantity(product.unit) },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      },
    );
  }, [addToCart, onClose, onSuccess, product, targetVariant]);

  if (!product) {
    return null;
  }

  return (
    <Modal visible={Boolean(product)} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-background border-t border-line p-5 gap-4 shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Верхняя черта для свайпа */}
          <View className="w-12 h-1.5 rounded-full bg-line self-center mb-1" />

          {/* Карточка товара в шапке шторки */}
          <View className="flex-row items-center gap-3.5 pb-2 border-b border-line">
            <Image
              source={{ uri: product.media[0] ?? ProductPlaceholderImage }}
              className="h-16 w-16 rounded-xl bg-surface border border-line"
              resizeMode="cover"
            />
            <View className="flex-1 gap-0.5">
              <Text numberOfLines={1} className="text-base font-bold text-content">
                {product.name}
              </Text>
              <Text className="text-sm font-extrabold text-content">
                {formatUnitPrice(targetVariant?.price ?? product.price, currencySymbol, product.unit)}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-surface border border-line active:scale-90"
            >
              <Icon name="close" size={14} color="#737373" />
            </Pressable>
          </View>

          {/* Выбор размера */}
          <If condition={availableSizes.length > 0}>
            <View className="gap-2">
              <Text className="text-xs font-bold uppercase tracking-wider text-muted">
                Выберите размер
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = size === activeSize;
                  return (
                    <Pressable
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      className={[
                        'px-4 py-2 rounded-xl border items-center justify-center min-w-[48px]',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-line bg-surface/60 active:border-primary',
                      ].join(' ')}
                    >
                      <Text
                        className={[
                          'text-xs font-bold',
                          isSelected ? 'text-white' : 'text-content',
                        ].join(' ')}
                      >
                        {size}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </If>

          {/* Выбор цвета */}
          <If condition={availableColors.length > 1}>
            <View className="gap-2 pt-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-muted">
                Выберите цвет
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = color === activeColor;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      className={[
                        'px-3.5 py-2 rounded-xl border items-center justify-center',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-line bg-surface/60 active:border-primary',
                      ].join(' ')}
                    >
                      <Text
                        className={[
                          'text-xs font-bold capitalize',
                          isSelected ? 'text-white' : 'text-content',
                        ].join(' ')}
                      >
                        {color}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </If>

          {/* Кнопка добавления в корзину */}
          <View className="pt-3 pb-2">
            <Button
              title={`Добавить в корзину • ${formatUnitPrice(
                targetVariant?.price ?? product.price,
                currencySymbol,
                product.unit,
              )}`}
              loading={isPending}
              onPress={handleAdd}
              icon={<Icon name="bag" size={16} color="#ffffff" />}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

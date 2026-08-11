import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { IProduct, ProductPlaceholderImage } from '@/entities/product';
import { formatUnitPrice, resolveMediaUrl, triggerHapticLight } from '@/shared/lib';
import { If } from '@/shared/ui';
import { getRecentlyViewed } from './model';

interface IProps {
  popularTags?: string[];
  onSelectTerm: (term: string) => void;
  onSelectProduct: (product: IProduct) => void;
  currencySymbol?: string;
}

export const SearchHistoryView = ({
  popularTags = [],
  onSelectTerm,
  onSelectProduct,
  currencySymbol = 'смн',
}: IProps) => {
  const [recentProducts, setRecentProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    getRecentlyViewed().then(setRecentProducts);
  }, []);

  const hasPopular = popularTags.length > 0;
  const hasRecentProducts = recentProducts.length > 0;

  if (!hasPopular && !hasRecentProducts) {
    return null;
  }

  return (
    <View className="px-4 gap-5 pb-4">
      {/* 1. Популярные запросы (Популярное) */}
      <If condition={hasPopular}>
        <View className="gap-2.5">
          <Text className="text-xs font-black uppercase tracking-wider text-muted">🔥 Популярные запросы</Text>
          <View className="flex-row flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => {
                  triggerHapticLight();
                  onSelectTerm(tag);
                }}
                className="rounded-full border border-line bg-surface px-4 py-2 shadow-2xs items-center justify-center active:border-primary active:bg-primary/5"
              >
                <Text className="text-xs font-bold text-content">{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </If>

      {/* 2. Недавно просмотренные товары */}
      <If condition={hasRecentProducts}>
        <View className="gap-2.5 pt-1">
          <Text className="text-xs font-black uppercase tracking-wider text-muted">👁 Вы недавно смотрели</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {recentProducts.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  triggerHapticLight();
                  onSelectProduct(item);
                }}
                className="w-32 rounded-3xl border border-line bg-surface overflow-hidden active:opacity-90 shadow-sm"
              >
                <Image
                  source={{ uri: resolveMediaUrl(item.media[0]) || ProductPlaceholderImage }}
                  className="h-32 w-full bg-slate-100 dark:bg-slate-800"
                  resizeMode="cover"
                />
                <View className="p-2.5 gap-1">
                  <Text numberOfLines={1} className="text-xs font-semibold text-content">
                    {item.name}
                  </Text>
                  <Text className="text-xs font-black text-content">
                    {formatUnitPrice(item.price, currencySymbol, item.unit)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </If>
    </View>
  );
};

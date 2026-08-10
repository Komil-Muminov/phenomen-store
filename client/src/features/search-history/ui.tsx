import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { IProduct, ProductPlaceholderImage } from '@/entities/product';
import { formatUnitPrice } from '@/shared/lib';
import { Icon, If } from '@/shared/ui';
import { clearSearchHistory, getRecentlyViewed, getSearchHistory } from './model';

interface IProps {
  onSelectTerm: (term: string) => void;
  onSelectProduct: (product: IProduct) => void;
  currencySymbol?: string;
}

export const SearchHistoryView = ({
  onSelectTerm,
  onSelectProduct,
  currencySymbol = 'смн',
}: IProps) => {
  const [history, setHistory] = useState<string[]>([]);
  const [recentProducts, setRecentProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    getSearchHistory().then(setHistory);
    getRecentlyViewed().then(setRecentProducts);
  }, []);

  const handleClear = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  if (history.length === 0 && recentProducts.length === 0) {
    return null;
  }

  return (
    <View className="mb-3 gap-3">
      {/* Аккуратная плашка с историей недавних поисков */}
      <If condition={history.length > 0}>
        <View className="mx-4 rounded-2xl border border-line/60 bg-surface/40 p-3 gap-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Icon name="clock" size={12} color="#737373" />
              <Text className="text-xs font-bold text-muted">Вы искали</Text>
            </View>
            <Pressable onPress={handleClear} className="active:opacity-60 px-1 py-0.5">
              <Text className="text-[11px] font-bold text-rose-500">Очистить</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pt-0.5">
            {history.map((term) => (
              <Pressable
                key={term}
                onPress={() => onSelectTerm(term)}
                className="flex-row items-center gap-1.5 rounded-full border border-line bg-background px-3 py-1.5 active:border-primary active:bg-surface"
              >
                <Text className="text-xs font-semibold text-content">{term}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </If>

      {/* Компактная секция недавно просмотренных товаров */}
      <If condition={recentProducts.length > 0}>
        <View className="gap-2 pt-1">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-xs font-bold text-muted">Вы недавно смотрели</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {recentProducts.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onSelectProduct(item)}
                className="w-28 rounded-2xl border border-line/80 bg-background overflow-hidden active:border-primary shadow-2xs"
              >
                <Image
                  source={{ uri: item.media[0] ?? ProductPlaceholderImage }}
                  className="h-28 w-full bg-surface"
                  resizeMode="cover"
                />
                <View className="p-2 gap-0.5">
                  <Text numberOfLines={1} className="text-[11px] font-bold text-content leading-4">
                    {item.name}
                  </Text>
                  <Text className="text-xs font-extrabold text-primary">
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

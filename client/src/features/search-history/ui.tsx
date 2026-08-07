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
    <View className="py-2 gap-4">
      {/* Секция истории недавних запросов */}
      <If condition={history.length > 0}>
        <View className="px-4 gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">
              Недавние поиски
            </Text>
            <Pressable onPress={handleClear} className="active:opacity-60">
              <Text className="text-xs font-semibold text-muted">Очистить</Text>
            </Pressable>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {history.map((term) => (
              <Pressable
                key={term}
                onPress={() => onSelectTerm(term)}
                className="flex-row items-center gap-1.5 rounded-xl border border-line bg-surface/80 px-3 py-1.5 active:border-primary active:bg-surface"
              >
                <Icon name="search" size={12} color="#737373" />
                <Text className="text-xs font-semibold text-content">{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </If>

      {/* Секция недавно просмотренных товаров */}
      <If condition={recentProducts.length > 0}>
        <View className="gap-2.5 pt-1">
          <Text className="px-4 text-xs font-bold uppercase tracking-wider text-muted">
            Вы недавно смотрели
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {recentProducts.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onSelectProduct(item)}
                className="w-32 rounded-xl border border-line bg-background overflow-hidden active:border-primary"
              >
                <Image
                  source={{ uri: item.media[0] ?? ProductPlaceholderImage }}
                  className="h-32 w-full bg-surface"
                  resizeMode="cover"
                />
                <View className="p-2 gap-0.5">
                  <Text numberOfLines={1} className="text-xs font-medium text-content">
                    {item.name}
                  </Text>
                  <Text className="text-xs font-bold text-content">
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

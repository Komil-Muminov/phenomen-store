import { FlatList, Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { CategoryTile, ICategory } from '@/entities/category';
import { IProduct, ProductCard } from '@/entities/product';
import { Icon, If } from '@/shared/ui';
import { IBanner, ISectionHandlers } from '@/features/storefront-sections/model';

interface IBannerProps {
  banners: IBanner[];
  onPress: ISectionHandlers['onBannerPress'];
}

interface ICategoriesProps {
  categories: ICategory[];
  onPress: ISectionHandlers['onCategoryPress'];
}

interface IProductsProps {
  products: IProduct[];
  currencySymbol: string;
  onPress: ISectionHandlers['onProductPress'];
}

export const BannerCarousel = ({ banners, onPress }: IBannerProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const bannerWidth = Math.max(280, Math.min(screenWidth - 48, 340));

  return (
    <FlatList
      horizontal
      data={banners}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3.5 px-4"
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPress(item)}
          style={{ width: bannerWidth }}
          className="h-48 overflow-hidden rounded-3xl border border-line bg-neutral-900 active:opacity-95 shadow-sm relative justify-between p-4"
        >
          <Image
            source={{ uri: item.imageUrl }}
            className="absolute inset-0 h-full w-full opacity-80"
            resizeMode="cover"
          />

          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-black/40 px-3 py-1 backdrop-blur-md border border-white/10">
              <Text className="text-[11px] font-bold text-white uppercase tracking-wider">
                Phenomen
              </Text>
            </View>
          </View>

          <View className="gap-2 pt-6">
            <View className="gap-0.5">
              <Text numberOfLines={1} className="text-xl font-extrabold text-white tracking-tight">
                {item.title}
              </Text>
              <If condition={Boolean(item.subtitle)}>
                <Text numberOfLines={1} className="text-xs font-medium text-neutral-200">
                  {item.subtitle}
                </Text>
              </If>
            </View>

            <View className="self-start flex-row items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-sm">
              <Text className="text-xs font-bold text-neutral-950">Смотреть</Text>
              <Icon name="chevron-right" size={12} color="#0a0a0a" />
            </View>
          </View>
        </Pressable>
      )}
    />
  );
};

export const CategoryGrid = ({ categories, onPress }: ICategoriesProps) => (
  <View className="flex-row flex-wrap gap-2.5 px-4 justify-between">
    {categories.map((category) => (
      <CategoryTile key={category.id} category={category} onPress={onPress} />
    ))}
  </View>
);

export const ProductRail = ({ products, currencySymbol, onPress }: IProductsProps) => (
  <FlatList
    horizontal
    data={products}
    keyExtractor={(item) => item.id}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 16 }}
    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
    renderItem={({ item }) => (
      <ProductCard product={item} currencySymbol={currencySymbol} onPress={onPress} width="card" />
    )}
  />
);

export const PromoBlock = ({ products, currencySymbol, onPress }: IProductsProps) => (
  <View className="mx-4 gap-3.5 rounded-3xl border border-line bg-surface/50 p-3.5">
    {products.slice(0, 2).map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        currencySymbol={currencySymbol}
        onPress={onPress}
        width="full"
      />
    ))}
  </View>
);

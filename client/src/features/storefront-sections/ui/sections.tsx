import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { CategoryTile, ICategory } from '@/entities/category';
import { IProduct, ProductCard } from '@/entities/product';
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

export const BannerCarousel = ({ banners, onPress }: IBannerProps) => (
  <FlatList
    horizontal
    data={banners}
    keyExtractor={(item) => item.id}
    showsHorizontalScrollIndicator={false}
    contentContainerClassName="gap-3 px-4"
    renderItem={({ item }) => (
      <Pressable
        onPress={() => onPress(item)}
        className={({ pressed }) => [
          'h-40 w-80 overflow-hidden rounded-brandLg border',
          pressed ? 'border-primary' : 'border-line',
        ].join(' ')}
      >
        <Image source={{ uri: item.imageUrl }} className="h-full w-full bg-surface" resizeMode="cover" />
        <View className="absolute bottom-0 w-full bg-surface/90 p-3">
          <Text className="text-sm font-semibold text-content">{item.title}</Text>
          <Text className="text-xs text-muted">{item.subtitle}</Text>
        </View>
      </Pressable>
    )}
  />
);

export const CategoryGrid = ({ categories, onPress }: ICategoriesProps) => (
  <View className="flex-row flex-wrap gap-3 px-4">
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
    contentContainerClassName="gap-3 px-4"
    renderItem={({ item }) => (
      <ProductCard product={item} currencySymbol={currencySymbol} onPress={onPress} />
    )}
  />
);

export const PromoBlock = ({ products, currencySymbol, onPress }: IProductsProps) => (
  <View className="mx-4 gap-3 rounded-brandLg bg-surface p-3">
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

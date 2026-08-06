import { Text, View } from 'react-native';
import { IProduct, ProductCard } from '@/entities/product';
import { UiMessages } from '@/shared/config';
import { If } from '@/shared/ui';

interface IProps {
  products: IProduct[];
  currencySymbol: string;
  onProductPress: (product: IProduct) => void;
}

export const CatalogGrid = ({ products, currencySymbol, onProductPress }: IProps) => (
  <View className="flex-row flex-wrap justify-between gap-y-4 px-4 pb-8">
    <If
      condition={products.length > 0}
      fallback={<Text className="w-full py-10 text-center text-sm text-muted">{UiMessages.emptyList}</Text>}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currencySymbol={currencySymbol}
          onPress={onProductPress}
        />
      ))}
    </If>
  </View>
);

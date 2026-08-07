import { Text, View } from 'react-native';
import { IProduct, ProductCard } from '@/entities/product';
import { UiMessages } from '@/shared/config';
import { If } from '@/shared/ui';

interface IProps {
  products: IProduct[];
  currencySymbol: string;
  onProductPress: (product: IProduct) => void;
}

export const CatalogGrid = ({ products, currencySymbol, onProductPress }: IProps) => {
  const leftColumn = products.filter((_, idx) => idx % 2 === 0);
  const rightColumn = products.filter((_, idx) => idx % 2 === 1);

  return (
    <View className="px-4 pb-8">
      <If
        condition={products.length > 0}
        fallback={<Text className="w-full py-10 text-center text-sm text-muted">{UiMessages.emptyList}</Text>}
      >
        <View className="flex-row justify-between gap-3">
          <View className="flex-1 gap-4">
            {leftColumn.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={currencySymbol}
                onPress={onProductPress}
                width="full"
              />
            ))}
          </View>
          <View className="flex-1 gap-4">
            {rightColumn.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={currencySymbol}
                onPress={onProductPress}
                width="full"
              />
            ))}
          </View>
        </View>
      </If>
    </View>
  );
};

import { Text, View } from 'react-native';
import { IProduct, ProductCard } from '@/entities/product';
import { UiMessages } from '@/shared/config';
import { If } from '@/shared/ui';

interface IProps {
  products: IProduct[];
  currencySymbol: string;
  columnsCount?: 1 | 2;
  onProductPress: (product: IProduct) => void;
  onAddToCart?: (product: IProduct) => void;
  loadingAddToCartId?: string | null;
}

export const CatalogGrid = ({
  products,
  currencySymbol,
  columnsCount = 2,
  onProductPress,
  onAddToCart,
  loadingAddToCartId,
}: IProps) => {
  if (columnsCount === 1) {
    return (
      <View className="px-4 pb-8">
        <If
          condition={products.length > 0}
          fallback={<Text className="w-full py-10 text-center text-sm text-muted">{UiMessages.emptyList}</Text>}
        >
          <View className="gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={currencySymbol}
                onPress={onProductPress}
                onAddToCart={onAddToCart}
                loadingAddToCart={loadingAddToCartId === product.id}
                width="full"
              />
            ))}
          </View>
        </If>
      </View>
    );
  }

  const productRows: IProduct[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    productRows.push(products.slice(i, i + 2));
  }

  return (
    <View className="px-4 pb-8">
      <If
        condition={products.length > 0}
        fallback={<Text className="w-full py-10 text-center text-sm text-muted">{UiMessages.emptyList}</Text>}
      >
        <View className="gap-4">
          {productRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between gap-3 items-stretch">
              {row.map((product) => (
                <View key={product.id} className="flex-1">
                  <ProductCard
                    product={product}
                    currencySymbol={currencySymbol}
                    onPress={onProductPress}
                    onAddToCart={onAddToCart}
                    loadingAddToCart={loadingAddToCartId === product.id}
                    width="full"
                  />
                </View>
              ))}
              {row.length === 1 && <View className="flex-1" />}
            </View>
          ))}
        </View>
      </If>
    </View>
  );
};

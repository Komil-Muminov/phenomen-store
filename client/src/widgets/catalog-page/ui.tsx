import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IProduct } from '@/entities/product';
import { ITenantConfig } from '@/entities/tenant';
import { CatalogFilters, TFacets, TSelectedFacets, serializeFacets, toggleFacetValue } from '@/features/catalog-filters';
import { CatalogGrid } from '@/features/catalog-grid';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { If, StateView } from '@/shared/ui';

const DEFAULT_SORT = 'popular';
const PAGE_SIZE = 20;

interface IProductList {
  items: IProduct[];
  total: number;
}

export const CatalogPage = () => {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [selectedFacets, setSelectedFacets] = useState<TSelectedFacets>({});

  const params = useMemo(() => ({
    categoryId: categoryId ?? undefined,
    sort,
    options: serializeFacets(selectedFacets) || undefined,
    limit: PAGE_SIZE,
  }), [categoryId, sort, selectedFacets]);

  const { data: config } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );
  const { data: facets } = useGetQuery<TFacets>(
    [QueryKeys.products, 'facets', categoryId ?? null],
    ApiRoutes.productsFacets,
    { params: { categoryId: categoryId ?? undefined }, staleTime: StaleTimeMs.medium },
  );
  const { data, isLoading, error, refetch } = useGetQuery<IProductList>(
    [QueryKeys.products, categoryId ?? null, sort, serializeFacets(selectedFacets)],
    ApiRoutes.productsSearch,
    { params, staleTime: StaleTimeMs.short },
  );

  const handleProductPress = useCallback((product: IProduct) => {
    router.push(`${AppRoutes.product}/${product.id}`);
  }, [router]);

  const handleFacetToggle = useCallback((code: string, value: string) => {
    setSelectedFacets((current) => toggleFacetValue(current, code, value));
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className={({ pressed }) => [
            'h-10 w-10 items-center justify-center rounded-brandSm border',
            pressed ? 'border-primary bg-surface' : 'border-line bg-background',
          ].join(' ')}
        >
          <Text className="text-lg text-content">←</Text>
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-content">Каталог</Text>
        <Text className="text-xs text-muted">{`${data?.total ?? 0} тов.`}</Text>
      </View>

      <If
        condition={Boolean(data)}
        fallback={<StateView loading={isLoading} errorMessage={error?.message ?? null} onRetry={handleRetry} />}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <CatalogFilters
            facets={facets ?? {}}
            selectedFacets={selectedFacets}
            sort={sort}
            onSortChange={setSort}
            onFacetToggle={handleFacetToggle}
          />
          <CatalogGrid
            products={data?.items ?? []}
            currencySymbol={config?.locale.currencySymbol ?? ''}
            onProductPress={handleProductPress}
          />
        </ScrollView>
      </If>
    </SafeAreaView>
  );
};

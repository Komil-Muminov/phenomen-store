import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ICart, countCartItems } from '@/entities/cart';
import { IProduct } from '@/entities/product';
import { ITenantConfig } from '@/entities/tenant';
import { CatalogFilters, TFacets, TSelectedFacets, serializeFacets, toggleFacetValue } from '@/features/catalog-filters';
import { CatalogGrid } from '@/features/catalog-grid';
import { QuickAddModal } from '@/features/quick-add';
import { SearchHistoryView, addSearchTerm, addRecentlyViewed } from '@/features/search-history';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { formatItemCount, initialQuantity, roundQuantity, unitStep } from '@/shared/lib';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { BottomBar, Button, Icon, If, SkeletonProductGrid, StateView } from '@/shared/ui';

const DEFAULT_SORT = 'popular';
const PAGE_SIZE = 20;

const QUICK_SEARCH_TAGS = ['Худи', 'Джинсы', 'Бомбер', 'Куртки', 'Футболки', 'Кроссовки'];

interface IProductList {
  items: IProduct[];
  total: number;
}

export const CatalogPage = () => {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacets, setSelectedFacets] = useState<TSelectedFacets>({});
  const [quickAddProduct, setQuickAddProduct] = useState<IProduct | null>(null);
  const [showToast, setShowToast] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.values(selectedFacets).reduce((acc, items) => acc + items.length, 0),
    [selectedFacets],
  );

  const params = useMemo(() => ({
    categoryId: categoryId ?? undefined,
    query: searchQuery.trim() || undefined,
    sort,
    options: serializeFacets(selectedFacets) || undefined,
    limit: PAGE_SIZE,
  }), [categoryId, searchQuery, sort, selectedFacets]);

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
    [QueryKeys.products, categoryId ?? null, sort, searchQuery, serializeFacets(selectedFacets)],
    ApiRoutes.productsSearch,
    { params, staleTime: StaleTimeMs.short },
  );

  const { data: cart } = useGetQuery<ICart>(
    [QueryKeys.cart],
    ApiRoutes.cartGet,
    { staleTime: StaleTimeMs.short },
  );

  const updateCart = useMutationQuery<any, ICart>(
    ApiRoutes.cartUpdate,
    { invalidate: [[QueryKeys.cart]] },
  );

  const handleProductPress = useCallback((item: IProduct) => {
    addRecentlyViewed(item);
    router.push(`${AppRoutes.product}/${item.id}`);
  }, [router]);

  const handleAddToCart = useCallback((item: IProduct) => {
    setQuickAddProduct(item);
  }, []);

  const handleFacetToggle = useCallback((code: string, value: string) => {
    setSelectedFacets((current) => toggleFacetValue(current, code, value));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedFacets({});
    setSearchQuery('');
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop }}>
      <View className="flex-row items-center gap-3 px-4 py-2 border-b border-line">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="chevronLeft" size={18} color="#171717" />
        </Pressable>

        {/* Быстрый инпут поиска */}
        <View className="flex-1 flex-row items-center rounded-xl bg-surface px-3 py-1.5 border border-line">
          <Icon name="search" size={16} color="#a3a3a3" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск одежды, обуви..."
            placeholderTextColor="#a3a3a3"
            style={{ paddingVertical: 0 }}
            textAlignVertical="center"
            className="flex-1 text-sm font-semibold text-content ml-2"
          />
          <If condition={Boolean(searchQuery)}>
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color="#a3a3a3" />
            </Pressable>
          </If>
        </View>
      </View>

      {/* Быстрые теги подсказок поиска с комфортным вертикальным отступом */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="h-12 flex-grow-0 my-1.5"
        contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4, gap: 8 }}
      >
        {QUICK_SEARCH_TAGS.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => {
              const nextTag = searchQuery === tag ? '' : tag;
              setSearchQuery(nextTag);
              if (nextTag) {
                addSearchTerm(nextTag);
              }
            }}
            className={`rounded-full px-3.5 py-1.5 border items-center justify-center ${
              searchQuery === tag ? 'border-primary bg-primary' : 'border-line bg-surface/60'
            }`}
          >
            <Text className={`text-xs font-semibold ${searchQuery === tag ? 'text-white' : 'text-muted'}`}>
              {tag}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Всплывающий красивый тост успешного добавления в корзину */}
      <If condition={showToast}>
        <View className="mx-4 my-1 flex-row items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 shadow-sm">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-600">
            <Icon name="check" size={12} color="#ffffff" />
          </View>
          <Text className="flex-1 text-xs font-bold text-emerald-800">
            Товар добавлен в корзину! 🛍️
          </Text>
          <Pressable
            onPress={() => router.push(AppRoutes.cart)}
            className="flex-row items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 active:bg-emerald-700"
          >
            <Text className="text-xs font-bold text-white">В корзину</Text>
          </Pressable>
        </View>
      </If>

      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-xl font-extrabold tracking-tight text-content">Каталог</Text>
        <Text className="text-xs font-semibold text-muted">
          {formatItemCount(data?.total ?? 0)}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 76 }} showsVerticalScrollIndicator={false}>
        {/* История недавних поисков и недавно просмотренные товары */}
        <SearchHistoryView
          onSelectTerm={(term) => {
            setSearchQuery(term);
            addSearchTerm(term);
          }}
          onSelectProduct={handleProductPress}
          currencySymbol={config?.locale.currencySymbol ?? ''}
        />

        <CatalogFilters
          facets={facets ?? {}}
          selectedFacets={selectedFacets}
          sort={sort}
          onSortChange={setSort}
          onFacetToggle={handleFacetToggle}
        />

        <If
          condition={!isLoading && !error}
          fallback={(
            <StateView
              loading={isLoading}
              errorMessage={error ? error.message : null}
              skeleton={<SkeletonProductGrid count={6} />}
              onRetry={handleRetry}
            />
          )}
        >
          <If condition={(data?.items?.length ?? 0) === 0}>
            <View className="items-center gap-3 px-6 py-16">
              <Text className="text-base font-bold text-content">Ничего не найдено</Text>
              <Text className="text-center text-xs text-muted">
                {activeFilterCount > 0
                  ? 'Попробуйте убрать часть фильтров'
                  : 'Попробуйте изменить поисковый запрос'}
              </Text>
              <If condition={activeFilterCount > 0 || Boolean(searchQuery)}>
                <View className="w-48 pt-2">
                  <Button title="Сбросить фильтры" onPress={handleResetFilters} />
                </View>
              </If>
            </View>
          </If>

          <CatalogGrid
            products={data?.items ?? []}
            currencySymbol={config?.locale.currencySymbol ?? ''}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            loadingAddToCartId={updateCart.isPending ? updateCart.variables?.productId : null}
          />
        </If>
      </ScrollView>

      {/* Быстрая шторка выбора размера и цвета */}
      <QuickAddModal
        product={quickAddProduct}
        currencySymbol={config?.locale.currencySymbol ?? ''}
        onClose={() => setQuickAddProduct(null)}
        onSuccess={() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }}
      />

      <BottomBar cartCount={countCartItems(cart)} />
    </View>
  );
};

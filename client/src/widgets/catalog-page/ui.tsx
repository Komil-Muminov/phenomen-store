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
import { SearchHistoryView, addRecentlyViewed, addSearchTerm } from '@/features/search-history';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { formatItemCount } from '@/shared/lib';
import { useDebounce, useGetQuery, useMutationQuery } from '@/shared/hooks';
import { BottomBar, Button, Icon, If, SkeletonProductGrid, StateView, Toast } from '@/shared/ui';

const DEFAULT_SORT = 'popular';
const PAGE_SIZE = 20;

const DEFAULT_QUICK_SEARCH_TAGS = ['Худи', 'Джинсы', 'Бомбер', 'Куртки', 'Футболки', 'Кроссовки'];

interface IProductList {
  items: IProduct[];
  total: number;
}

export const CatalogPage = () => {
  const router = useRouter();
  const { categoryId, focusSearch, query } = useLocalSearchParams<{ categoryId?: string; focusSearch?: string; query?: string }>();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState(query ?? '');
  const debouncedQuery = useDebounce(searchQuery);
  const [selectedFacets, setSelectedFacets] = useState<TSelectedFacets>({});
  const [isSearchFocused, setIsSearchFocused] = useState(Boolean(focusSearch === 'true'));
  const [columnsCount, setColumnsCount] = useState<1 | 2>(2);
  const [quickAddProduct, setQuickAddProduct] = useState<IProduct | null>(null);
  const [showToast, setShowToast] = useState(false);

  const params = useMemo(() => ({
    categoryId: categoryId ?? undefined,
    query: debouncedQuery.trim() || undefined,
    sort,
    minPrice: minPrice.trim() ? Number(minPrice) : undefined,
    maxPrice: maxPrice.trim() ? Number(maxPrice) : undefined,
    options: serializeFacets(selectedFacets) || undefined,
    limit: PAGE_SIZE,
  }), [categoryId, debouncedQuery, sort, minPrice, maxPrice, selectedFacets]);

  const handlePriceChange = useCallback((min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  }, []);

  const handleResetAll = useCallback(() => {
    setSelectedFacets({});
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSort(DEFAULT_SORT);
  }, []);

  const { data: config } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );
  const { data: popularSearchTerms } = useGetQuery<string[]>(
    [QueryKeys.products, 'popular-searches'],
    ApiRoutes.popularSearches,
    { staleTime: StaleTimeMs.long },
  );
  const { data: facets } = useGetQuery<TFacets>(
    [QueryKeys.products, 'facets', categoryId ?? null],
    ApiRoutes.productsFacets,
    { params: { categoryId: categoryId ?? undefined }, staleTime: StaleTimeMs.medium },
  );
  const { data, isLoading, error, refetch } = useGetQuery<IProductList>(
    [QueryKeys.products, categoryId ?? null, sort, debouncedQuery, serializeFacets(selectedFacets)],
    ApiRoutes.productsSearch,
    { params, staleTime: StaleTimeMs.short },
  );

  const popularTags = useMemo(() => {
    if (popularSearchTerms && popularSearchTerms.length > 0) {
      return popularSearchTerms;
    }
    return DEFAULT_QUICK_SEARCH_TAGS;
  }, [popularSearchTerms]);

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
    if (searchQuery.trim()) {
      addSearchTerm(searchQuery.trim());
    }
    router.push(`${AppRoutes.product}/${item.id}`);
  }, [router, searchQuery]);

  const handleAddToCart = useCallback((item: IProduct) => {
    setQuickAddProduct(item);
  }, []);

  const handleFacetToggle = useCallback((code: string, value: string) => {
    setSelectedFacets((current) => toggleFacetValue(current, code, value));
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      addSearchTerm(searchQuery.trim());
    }
    setIsSearchFocused(false);
  }, [searchQuery]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const isSearchActive = Boolean(searchQuery.trim());

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop }}>
      <View className="flex-row items-center gap-2.5 px-4 py-2 border-b border-line">
        {/* Быстрый инпут поиска */}
        <View className="flex-1 h-11 flex-row items-center rounded-2xl bg-surface px-3 border border-line">
          <Icon name="search" size={16} color="#64748b" />
          <TextInput
            autoFocus={Boolean(focusSearch === 'true')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            placeholder="Поиск товаров..."
            placeholderTextColor="#94a3b8"
            style={{ paddingVertical: 0 }}
            textAlignVertical="center"
            className="flex-1 text-sm font-semibold text-content ml-2"
          />
          <If condition={Boolean(searchQuery)}>
            <Pressable onPress={() => setSearchQuery('')} className="p-1">
              <Icon name="close" size={16} color="#64748b" />
            </Pressable>
          </If>
        </View>

        <If condition={isSearchFocused}>
          <Pressable
            onPress={() => setIsSearchFocused(false)}
            className="px-2 py-2 active:opacity-70"
          >
            <Text className="text-xs font-extrabold text-primary">Отмена</Text>
          </Pressable>
        </If>
      </View>

      {/* Оверлей встроенного поиска (появляется при фокусе на поиске) */}
      <If condition={isSearchFocused}>
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ paddingBottom: 96, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <If condition={!isSearchActive}>
              {/* Единственное структурированное меню рекомендаций поиска */}
              <SearchHistoryView
                popularTags={popularTags}
                onSelectTerm={(term) => {
                  setSearchQuery(term);
                  addSearchTerm(term);
                  setIsSearchFocused(false);
                }}
                onSelectProduct={(prod) => {
                  setIsSearchFocused(false);
                  handleProductPress(prod);
                }}
                currencySymbol={config?.locale.currencySymbol ?? ''}
              />
          </If>

          {/* Живые результаты поиска во время ввода */}
          <If condition={isSearchActive}>
            <View className="px-4 gap-3">
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-xs font-bold text-muted">
                  Результаты по запросу «<Text className="text-content font-black">{searchQuery}</Text>»
                </Text>
                <Text className="text-xs font-bold text-primary">
                  {isLoading ? 'Загрузка...' : formatItemCount(data?.total ?? 0)}
                </Text>
              </View>

              <If condition={!isLoading && (data?.items?.length ?? 0) === 0}>
                <View className="items-center gap-2 py-12 px-4 rounded-3xl border border-line bg-surface">
                  <Text className="text-sm font-bold text-content">Ничего не найдено</Text>
                  <Text className="text-center text-xs text-muted">
                    Проверьте написание или попробуйте найти другое название товара
                  </Text>
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    className="mt-2 rounded-xl bg-primary px-4 py-2 active:opacity-80"
                  >
                    <Text className="text-xs font-bold text-onPrimary">Очистить запрос</Text>
                  </Pressable>
                </View>
              </If>

              <CatalogGrid
                products={data?.items ?? []}
                currencySymbol={config?.locale.currencySymbol ?? ''}
                columnsCount={columnsCount}
                onProductPress={(item) => {
                  setIsSearchFocused(false);
                  handleProductPress(item);
                }}
                onAddToCart={handleAddToCart}
                loadingAddToCartId={updateCart.isPending ? updateCart.variables?.productId : null}
              />
            </View>
          </If>
        </ScrollView>
      </If>

      {/* Основной вид каталога */}
      <If condition={!isSearchFocused}>
        <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
          <If
            condition={isSearchActive}
            fallback={
              <Text className="text-xl font-extrabold tracking-tight text-content">Каталог</Text>
            }
          >
            <View className="flex-row items-center gap-2 flex-1 shrink mr-2">
              <View className="flex-row items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 border border-rose-500/20">
                <Text className="text-xs font-bold text-rose-600">Поиск: {searchQuery}</Text>
                <Pressable onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={12} color="#e11d48" />
                </Pressable>
              </View>
            </View>
          </If>

          <Text className="text-xs font-semibold text-muted">
            {formatItemCount(data?.total ?? 0)}
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
          <CatalogFilters
            facets={facets ?? {}}
            selectedFacets={selectedFacets}
            sort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            totalProducts={data?.total ?? 0}
            columnsCount={columnsCount}
            onColumnsChange={setColumnsCount}
            onSortChange={setSort}
            onFacetToggle={handleFacetToggle}
            onPriceChange={handlePriceChange}
            onResetAll={handleResetAll}
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
                  {Boolean(minPrice || maxPrice || searchQuery || Object.keys(selectedFacets).length > 0)
                    ? 'Попробуйте сбросить часть фильтров или очистить поиск'
                    : 'Попробуйте изменить поисковый запрос'}
                </Text>
                <If condition={Boolean(minPrice || maxPrice || searchQuery || Object.keys(selectedFacets).length > 0)}>
                  <View className="w-48 pt-2">
                    <Button title="Сбросить фильтры и поиск" onPress={handleResetAll} />
                  </View>
                </If>
              </View>
            </If>

            <CatalogGrid
              products={data?.items ?? []}
              currencySymbol={config?.locale.currencySymbol ?? ''}
              columnsCount={columnsCount}
              onProductPress={handleProductPress}
              onAddToCart={handleAddToCart}
              loadingAddToCartId={updateCart.isPending ? updateCart.variables?.productId : null}
            />
          </If>
        </ScrollView>
      </If>

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

      <Toast
        visible={showToast}
        message="Товар добавлен в корзину! 🛍️"
        actionText="В корзину"
        onAction={() => router.push(AppRoutes.cart)}
        onClose={() => setShowToast(false)}
      />

      <BottomBar cartCount={countCartItems(cart)} />
    </View>
  );
};

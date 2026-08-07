import { useCallback } from 'react';
import { Platform, RefreshControl, ScrollView, StatusBar, View } from 'react-native';
import { useRouter } from 'expo-router';
import { openURL } from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ICart, countCartItems } from '@/entities/cart';
import { ICategory } from '@/entities/category';
import { IProduct } from '@/entities/product';
import { DEFAULT_TENANT_CONFIG, ITenantConfig } from '@/entities/tenant';
import { StoreIntro } from '@/features/store-intro';
import { BannerActionTypes, IBanner, IStorefrontSection, StorefrontSections } from '@/features/storefront-sections';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { BottomBar, If, SkeletonBanner, SkeletonProductGrid, StateView } from '@/shared/ui';

export const Home = () => {
  const router = useRouter();
  const { data: config } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );
  const { data: sections, isLoading, isFetching, error, refetch } = useGetQuery<IStorefrontSection[]>(
    [QueryKeys.storefrontLayout],
    ApiRoutes.storefrontLayout,
    { staleTime: StaleTimeMs.medium },
  );

  const { data: cart } = useGetQuery<ICart>(
    [QueryKeys.cart],
    ApiRoutes.cartGet,
    { staleTime: StaleTimeMs.short },
  );

  const handleCartPress = useCallback(() => {
    router.push(AppRoutes.cart);
  }, [router]);

  const handleProfilePress = useCallback(() => {
    router.push(AppRoutes.profile);
  }, [router]);

  const handleProductPress = useCallback((product: IProduct) => {
    router.push(`${AppRoutes.product}/${product.id}`);
  }, [router]);

  const handleCategoryPress = useCallback((category: ICategory) => {
    if (category?.id) {
      router.push(`${AppRoutes.catalog}?categoryId=${category.id}`);
    } else {
      router.push(AppRoutes.catalog);
    }
  }, [router]);

  const handleBannerPress = useCallback((banner: IBanner) => {
    if (banner?.actionType === BannerActionTypes.category && banner.actionValue) {
      router.push(`${AppRoutes.catalog}?categoryId=${banner.actionValue}`);
      return;
    }

    if (banner?.actionType === BannerActionTypes.product && banner.actionValue) {
      router.push(`${AppRoutes.product}/${banner.actionValue}`);
      return;
    }

    if (banner?.actionType === BannerActionTypes.link && banner.actionValue) {
      openURL(banner.actionValue).catch(() => router.push(AppRoutes.catalog));
      return;
    }

    router.push(`${AppRoutes.catalog}?sort=discount`);
  }, [router]);

  const handleSearchPress = useCallback(() => {
    router.push(AppRoutes.catalog);
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const cartCount = countCartItems(cart);

  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop }}>
      <StoreIntro
        config={config ?? DEFAULT_TENANT_CONFIG}
        cartCount={cartCount}
        onCartPress={handleCartPress}
        onProfilePress={handleProfilePress}
        onSearchPress={handleSearchPress}
      />
      <If
        condition={Boolean(sections)}
        fallback={
          <StateView
            loading={isLoading}
            skeleton={
              <ScrollView className="flex-1 px-4 gap-4 py-2" showsVerticalScrollIndicator={false}>
                <SkeletonBanner />
                <SkeletonProductGrid />
              </ScrollView>
            }
            errorMessage={error?.message ?? null}
            onRetry={handleRefresh}
          />
        }
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 76 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />}
        >
          <StorefrontSections
            sections={sections ?? []}
            currencySymbol={config?.locale.currencySymbol ?? ''}
            brandTitle={config?.brand.title ?? DEFAULT_TENANT_CONFIG.brand.title}
            onProductPress={handleProductPress}
            onCategoryPress={handleCategoryPress}
            onBannerPress={handleBannerPress}
          />
        </ScrollView>
      </If>

      <BottomBar cartCount={cartCount} />
    </View>
  );
};

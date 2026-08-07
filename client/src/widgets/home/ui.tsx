import { useCallback } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ICart, countCartItems } from '@/entities/cart';
import { ICategory } from '@/entities/category';
import { IProduct } from '@/entities/product';
import { ITenantConfig } from '@/entities/tenant';
import { StoreIntro } from '@/features/store-intro';
import { IBanner, IStorefrontSection, StorefrontSections } from '@/features/storefront-sections';
import { ApiRoutes, AppRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { BottomBar, If, SkeletonBanner, SkeletonProductGrid, StateView } from '@/shared/ui';

const BannerActions = {
  category: 'category',
  product: 'product',
} as const;

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
    router.push(`${AppRoutes.catalog}?categoryId=${category.id}`);
  }, [router]);

  const handleBannerPress = useCallback((banner: IBanner) => {
    if (banner.actionType === BannerActions.category && banner.actionValue) {
      router.push(`${AppRoutes.catalog}?categoryId=${banner.actionValue}`);
    }

    if (banner.actionType === BannerActions.product && banner.actionValue) {
      router.push(`${AppRoutes.product}/${banner.actionValue}`);
    }
  }, [router]);

  const handleSearchPress = useCallback(() => {
    router.push(AppRoutes.catalog);
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const cartCount = countCartItems(cart);

  return (
    <SafeAreaView className="flex-1 bg-background relative" edges={['top', 'left', 'right']}>
      <If condition={Boolean(config)}>
        <StoreIntro
          config={config as ITenantConfig}
          cartCount={cartCount}
          onCartPress={handleCartPress}
          onProfilePress={handleProfilePress}
          onSearchPress={handleSearchPress}
        />
      </If>
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
          className="flex-1 pb-24"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />}
        >
          <StorefrontSections
            sections={sections ?? []}
            currencySymbol={config?.locale.currencySymbol ?? ''}
            onProductPress={handleProductPress}
            onCategoryPress={handleCategoryPress}
            onBannerPress={handleBannerPress}
          />
        </ScrollView>
      </If>

      <BottomBar cartCount={cartCount} />
    </SafeAreaView>
  );
};

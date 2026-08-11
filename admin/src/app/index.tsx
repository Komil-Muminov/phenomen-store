import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, Spin } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AppRoutes } from '@/shared/config';
import { AuthProvider, useAuth } from '@/shared/auth';
import { usePrefetchLists } from '@/shared/hooks';
import { IPrefetchList, ShopPrefetchLists } from '@/shared/lib';
import { ShopAuthProvider, useShopAuth } from '@/shared/shop-auth';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { PlatformShell } from '@/widgets/platform-shell';
import { ShopShell } from '@/widgets/shop-shell';
import { antTheme } from '@/app/theme';

const Login = lazy(() => import('@/pages/login'));
const Tenants = lazy(() => import('@/pages/tenants'));
const PlatformAudit = lazy(() => import('@/pages/platform-audit'));
const ShopOrders = lazy(() => import('@/pages/shop-orders'));
const ShopProducts = lazy(() => import('@/pages/shop-products'));
const ShopStock = lazy(() => import('@/pages/shop-stock'));
const ShopBanners = lazy(() => import('@/pages/shop-banners'));
const ShopSettings = lazy(() => import('@/pages/shop-settings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const Fallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spin size="large" />
  </div>
);

const ContentFallback = () => (
  <div className="flex min-h-64 items-center justify-center">
    <Spin />
  </div>
);

const EMPTY_PREFETCH: IPrefetchList[] = [];

const preloadShopPages = (): void => {
  void import('@/pages/shop-orders');
  void import('@/pages/shop-products');
  void import('@/pages/shop-stock');
  void import('@/pages/shop-banners');
  void import('@/pages/shop-settings');
};

const preloadPlatformPages = (): void => {
  void import('@/pages/tenants');
  void import('@/pages/platform-audit');
};

const PlatformLayout = () => {
  const { isAuthorized } = useAuth();

  useEffect(preloadPlatformPages, []);

  return isAuthorized ? (
    <PlatformShell>
      <Suspense fallback={<ContentFallback />}>
        <Outlet />
      </Suspense>
    </PlatformShell>
  ) : (
    <Navigate to={AppRoutes.login} replace />
  );
};

const ShopLayout = () => {
  const { isAuthorized } = useShopAuth();

  useEffect(preloadShopPages, []);
  usePrefetchLists(isAuthorized ? ShopPrefetchLists : EMPTY_PREFETCH, 'shop');

  return isAuthorized ? (
    <ShopShell>
      <Suspense fallback={<ContentFallback />}>
        <Outlet />
      </Suspense>
    </ShopShell>
  ) : (
    <Navigate to={AppRoutes.login} replace />
  );
};

const Router = () => (
  <Routes>
    <Route
      path={AppRoutes.login}
      element={<Suspense fallback={<Fallback />}><Login /></Suspense>}
    />
    <Route path={AppRoutes.shopLogin} element={<Navigate to={AppRoutes.login} replace />} />

    <Route element={<PlatformLayout />}>
      <Route path={AppRoutes.tenants} element={<Tenants />} />
      <Route path={AppRoutes.audit} element={<PlatformAudit />} />
    </Route>

    <Route element={<ShopLayout />}>
      <Route path={AppRoutes.shopOrders} element={<ShopOrders />} />
      <Route path={AppRoutes.shopProducts} element={<ShopProducts />} />
      <Route path={AppRoutes.shopStock} element={<ShopStock />} />
      <Route path={AppRoutes.shopBanners} element={<ShopBanners />} />
      <Route path={AppRoutes.shopSettings} element={<ShopSettings />} />
    </Route>

    <Route path="*" element={<Navigate to={AppRoutes.login} replace />} />
  </Routes>
);

export const App = () => (
  <ConfigProvider theme={antTheme} locale={ruRU}>
    <AntApp>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ShopAuthProvider>
              <BrowserRouter>
                <Router />
              </BrowserRouter>
            </ShopAuthProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </AntApp>
  </ConfigProvider>
);

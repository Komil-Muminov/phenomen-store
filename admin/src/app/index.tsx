import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, Spin } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AppRoutes } from '@/shared/config';
import { AuthProvider, useAuth } from '@/shared/auth';
import { ShopAuthProvider, useShopAuth } from '@/shared/shop-auth';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

const Login = lazy(() => import('@/pages/login'));
const Tenants = lazy(() => import('@/pages/tenants'));
const ShopOrders = lazy(() => import('@/pages/shop-orders'));
const ShopProducts = lazy(() => import('@/pages/shop-products'));
const ShopStock = lazy(() => import('@/pages/shop-stock'));
const ShopAttributes = lazy(() => import('@/pages/shop-attributes'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const antTheme = {
  token: {
    colorPrimary: '#7C3AED',
    colorLink: '#7C3AED',
    borderRadius: 8,
    fontFamily: '"Fira Sans", system-ui, sans-serif',
  },
};

const Fallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spin size="large" />
  </div>
);

const PlatformRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthorized } = useAuth();

  return isAuthorized ? children : <Navigate to={AppRoutes.login} replace />;
};

const ShopRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthorized } = useShopAuth();

  return isAuthorized ? children : <Navigate to={AppRoutes.login} replace />;
};

const Router = () => (
  <Suspense fallback={<Fallback />}>
    <Routes>
      <Route path={AppRoutes.login} element={<Login />} />
      <Route
        path={AppRoutes.tenants}
        element={<PlatformRoute><Tenants /></PlatformRoute>}
      />
      <Route path={AppRoutes.shopLogin} element={<Navigate to={AppRoutes.login} replace />} />
      <Route
        path={AppRoutes.shopOrders}
        element={<ShopRoute><ShopOrders /></ShopRoute>}
      />
      <Route
        path={AppRoutes.shopProducts}
        element={<ShopRoute><ShopProducts /></ShopRoute>}
      />
      <Route
        path={AppRoutes.shopStock}
        element={<ShopRoute><ShopStock /></ShopRoute>}
      />
      <Route
        path={AppRoutes.shopAttributes}
        element={<ShopRoute><ShopAttributes /></ShopRoute>}
      />
      <Route path="*" element={<Navigate to={AppRoutes.login} replace />} />
    </Routes>
  </Suspense>
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

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

const antTheme = {
  token: {
    colorPrimary: '#6366f1',
    colorLink: '#6366f1',
    colorLinkHover: '#4f46e5',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    colorTextBase: '#0f172a',
    colorTextSecondary: '#64748b',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    controlHeight: 40,
    fontSize: 14,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
  },
  components: {
    Card: {
      paddingLG: 24,
      borderRadiusLG: 14,
      colorBorderSecondary: '#e2e8f0',
    },
    Button: {
      controlHeight: 40,
      borderRadius: 10,
      fontWeight: 500,
      paddingInline: 16,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 10,
      colorBorder: '#cbd5e1',
    },
    InputNumber: {
      controlHeight: 40,
      borderRadius: 10,
      colorBorder: '#cbd5e1',
    },
    Select: {
      controlHeight: 40,
      borderRadius: 10,
      colorBorder: '#cbd5e1',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#475569',
    },
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
      <Route
        path={AppRoutes.audit}
        element={<PlatformRoute><PlatformAudit /></PlatformRoute>}
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
        path={AppRoutes.shopBanners}
        element={<ShopRoute><ShopBanners /></ShopRoute>}
      />
      <Route
        path={AppRoutes.shopSettings}
        element={<ShopRoute><ShopSettings /></ShopRoute>}
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

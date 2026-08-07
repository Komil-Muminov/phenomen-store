import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, Spin } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AppRoutes } from '@/shared/config';
import { AuthProvider, useAuth } from '@/shared/auth';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

const Login = lazy(() => import('@/pages/login'));
const Tenants = lazy(() => import('@/pages/tenants'));

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

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthorized } = useAuth();

  return isAuthorized ? children : <Navigate to={AppRoutes.login} replace />;
};

const Router = () => (
  <Suspense fallback={<Fallback />}>
    <Routes>
      <Route path={AppRoutes.login} element={<Login />} />
      <Route
        path={AppRoutes.tenants}
        element={(
          <PrivateRoute>
            <Tenants />
          </PrivateRoute>
        )}
      />
      <Route path="*" element={<Navigate to={AppRoutes.tenants} replace />} />
    </Routes>
  </Suspense>
);

export const App = () => (
  <ConfigProvider theme={antTheme} locale={ruRU}>
    <AntApp>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </AntApp>
  </ConfigProvider>
);

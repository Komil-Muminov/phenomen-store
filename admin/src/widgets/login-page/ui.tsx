import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { extractErrorMessage, writeShopSession } from '@/shared/api';
import { AppRoutes, ApiRoutes } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import { useAuth } from '@/shared/auth';
import { useShopAuth } from '@/shared/shop-auth';
import { LoginForm, ILoginValues } from '@/features/login-form';
import type { ISigninResult } from '@/entities/tenant';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthorized, signIn } = useAuth();
  const { isAuthorized: isShopAuthorized, signIn: shopSignIn } = useShopAuth();
  const [errorText, setErrorText] = useState('');
  const signinMutation = useMutationQuery<ILoginValues, ISigninResult>(ApiRoutes.signin);

  const handleSuccess = useCallback((result: ISigninResult) => {
    if (result.scope === 'platform') {
      signIn(result.token, {
        login: result.login ?? '',
        name: result.name ?? '',
        role: result.role ?? '',
      });
      navigate(AppRoutes.tenants, { replace: true });

      return;
    }

    writeShopSession(result.token, result.tenantKey ?? '');
    shopSignIn(result.token, result.tenantKey ?? '', {
      id: result.user?.id ?? '',
      name: result.user?.name ?? null,
      email: result.user?.email ?? null,
      role: result.user?.role ?? '',
    });
    navigate(AppRoutes.shopOrders, { replace: true });
  }, [signIn, shopSignIn, navigate]);

  const handleSubmit = useCallback((values: ILoginValues) => {
    setErrorText('');

    signinMutation.mutate(values, {
      onSuccess: handleSuccess,
      onError: (error) => setErrorText(extractErrorMessage(error)),
    });
  }, [signinMutation, handleSuccess]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-surface px-4 py-10">
      {isAuthorized ? (
        <Navigate to={AppRoutes.tenants} replace />
      ) : (
        isShopAuthorized ? (
          <Navigate to={AppRoutes.shopOrders} replace />
        ) : (
          <LoginForm
            onSubmit={handleSubmit}
            isLoading={signinMutation.isPending}
            errorText={errorText}
          />
        )
      )}
    </main>
  );
};

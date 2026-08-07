import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '@/shared/api';
import { AppRoutes, ApiRoutes } from '@/shared/config';
import { useMutationQuery } from '@/shared/hooks';
import { useAuth } from '@/shared/auth';
import { LoginForm, ILoginValues } from '@/features/login-form';
import type { IPlatformSession } from '@/entities/tenant';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthorized, signIn } = useAuth();
  const [errorText, setErrorText] = useState('');
  const loginMutation = useMutationQuery<ILoginValues, IPlatformSession>(ApiRoutes.platformLogin);

  const handleSubmit = useCallback((values: ILoginValues) => {
    setErrorText('');

    loginMutation.mutate(values, {
      onSuccess: (session) => {
        signIn(session.token, {
          login: session.login,
          name: session.name,
          role: session.role,
        });
        navigate(AppRoutes.tenants, { replace: true });
      },
      onError: (error) => setErrorText(extractErrorMessage(error)),
    });
  }, [loginMutation, navigate, signIn]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-surface px-4 py-10">
      {isAuthorized ? (
        <Navigate to={AppRoutes.tenants} replace />
      ) : (
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={loginMutation.isPending}
          errorText={errorText}
        />
      )}
    </main>
  );
};

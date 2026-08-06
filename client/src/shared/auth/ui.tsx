import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAuthToken, setOnUnauthorizedHandler } from '@/shared/api';
import { QueryKeys } from '@/shared/config';
import { clearAuthToken, loadAuthToken, saveAuthToken } from '@/shared/session';

interface IAuthContext {
  token: string | null;
  ready: boolean;
  isAuthorized: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface IProps {
  children: ReactNode;
}

const AuthContext = createContext<IAuthContext>({
  token: null,
  ready: false,
  isAuthorized: false,
  login: async () => undefined,
  logout: async () => undefined,
});

export const useAuth = (): IAuthContext => useContext(AuthContext);

export const AuthProvider = ({ children }: IProps) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadAuthToken().then((stored) => {
      setAuthToken(stored);
      setToken(stored);
      setReady(true);
    });
  }, []);

  const login = useCallback(async (nextToken: string) => {
    await saveAuthToken(nextToken);
    setAuthToken(nextToken);
    setToken(nextToken);
    await queryClient.invalidateQueries({ queryKey: [QueryKeys.cart] });
    await queryClient.invalidateQueries({ queryKey: [QueryKeys.profile] });
  }, [queryClient]);

  const logout = useCallback(async () => {
    await clearAuthToken();
    setAuthToken(null);
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setOnUnauthorizedHandler(logout);

    return () => {
      setOnUnauthorizedHandler(null);
    };
  }, [logout]);

  const value = useMemo(
    () => ({ token, ready, isAuthorized: Boolean(token), login, logout }),
    [token, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

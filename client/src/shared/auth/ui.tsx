import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/config';
import { setAuthToken, setOnUnauthorizedHandler } from '@/shared/api';
import { clearAuthToken, loadAuthToken, saveAuthToken } from '@/shared/session';

interface IAuthContext {
  token: string | null;
  ready: boolean;
  isAuthorized: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({
  token: null,
  ready: false,
  isAuthorized: false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadAuthToken().then((stored) => {
      if (isMounted) {
        setAuthToken(stored);
        setToken(stored);
        setReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
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

export const useAuth = () => useContext(AuthContext);

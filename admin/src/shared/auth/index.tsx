import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { clearSession, readToken, writeToken } from '@/shared/api';
import { StorageKeys } from '@/shared/config';

export interface IPlatformAdmin {
  login: string;
  name: string;
  role: string;
}

interface IAuthValue {
  admin: IPlatformAdmin | null;
  isAuthorized: boolean;
  signIn: (token: string, admin: IPlatformAdmin) => void;
  signOut: () => void;
}

const readAdmin = (): IPlatformAdmin | null => {
  const raw = localStorage.getItem(StorageKeys.admin);

  return raw ? (JSON.parse(raw) as IPlatformAdmin) : null;
};

const AuthContext = createContext<IAuthValue>({
  admin: null,
  isAuthorized: false,
  signIn: () => undefined,
  signOut: () => undefined,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<IPlatformAdmin | null>(() => (readToken() ? readAdmin() : null));

  const signIn = useCallback((token: string, nextAdmin: IPlatformAdmin) => {
    writeToken(token);
    localStorage.setItem(StorageKeys.admin, JSON.stringify(nextAdmin));
    setAdmin(nextAdmin);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setAdmin(null);
  }, []);

  const value = useMemo<IAuthValue>(
    () => ({ admin, isAuthorized: Boolean(admin), signIn, signOut }),
    [admin, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): IAuthValue => useContext(AuthContext);

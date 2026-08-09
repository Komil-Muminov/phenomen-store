import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { App as AntApp } from 'antd';
import {
  clearShopSession,
  readShopTenant,
  readShopToken,
  subscribeSessionExpired,
  writeShopSession,
} from '@/shared/api';
import { StorageKeys, UiMessages } from '@/shared/config';

export interface IShopUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

interface IShopAuthValue {
  user: IShopUser | null;
  tenantKey: string;
  isAuthorized: boolean;
  signIn: (token: string, tenantKey: string, user: IShopUser) => void;
  signOut: () => void;
}

const readShopUser = (): IShopUser | null => {
  const raw = localStorage.getItem(StorageKeys.shopUser);

  return raw ? (JSON.parse(raw) as IShopUser) : null;
};

const ShopAuthContext = createContext<IShopAuthValue>({
  user: null,
  tenantKey: '',
  isAuthorized: false,
  signIn: () => undefined,
  signOut: () => undefined,
});

export const ShopAuthProvider = ({ children }: { children: ReactNode }) => {
  const { message } = AntApp.useApp();
  const [user, setUser] = useState<IShopUser | null>(() => (readShopToken() ? readShopUser() : null));
  const [tenantKey, setTenantKey] = useState<string>(() => readShopTenant() ?? '');

  const handleExpired = useCallback(() => {
    if (user) {
      setUser(null);
      setTenantKey('');
      message.warning(UiMessages.sessionExpired);
    }
  }, [user, message]);

  useEffect(() => subscribeSessionExpired('shop', handleExpired), [handleExpired]);

  const signIn = useCallback((token: string, nextTenant: string, nextUser: IShopUser) => {
    writeShopSession(token, nextTenant);
    localStorage.setItem(StorageKeys.shopUser, JSON.stringify(nextUser));
    setUser(nextUser);
    setTenantKey(nextTenant);
  }, []);

  const signOut = useCallback(() => {
    clearShopSession();
    setUser(null);
    setTenantKey('');
  }, []);

  const value = useMemo<IShopAuthValue>(
    () => ({ user, tenantKey, isAuthorized: Boolean(user), signIn, signOut }),
    [user, tenantKey, signIn, signOut],
  );

  return <ShopAuthContext.Provider value={value}>{children}</ShopAuthContext.Provider>;
};

export const useShopAuth = (): IShopAuthValue => useContext(ShopAuthContext);

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAuthToken, setTenantKey } from '@/shared/api';
import {
  IStaffSession,
  clearStaffSession,
  loadStaffSession,
  saveStaffSession,
} from '@/shared/session';

interface IStaffAuthContext {
  session: IStaffSession | null;
  ready: boolean;
  isStaff: boolean;
  signIn: (session: IStaffSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const StaffAuthContext = createContext<IStaffAuthContext>({
  session: null,
  ready: false,
  isStaff: false,
  signIn: async () => {},
  signOut: async () => {},
});

const applySession = (session: IStaffSession | null): void => {
  setAuthToken(session?.token ?? null);
  setTenantKey(session?.tenantKey ?? null);
};

export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<IStaffSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadStaffSession().then((stored) => {
      if (mounted) {
        if (stored) {
          applySession(stored);
        }

        setSession(stored);
        setReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (next: IStaffSession) => {
    await saveStaffSession(next);
    applySession(next);
    setSession(next);
    queryClient.clear();
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await clearStaffSession();
    applySession(null);
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({ session, ready, isStaff: Boolean(session), signIn, signOut }),
    [session, ready, signIn, signOut],
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
};

export const useStaffAuth = () => useContext(StaffAuthContext);

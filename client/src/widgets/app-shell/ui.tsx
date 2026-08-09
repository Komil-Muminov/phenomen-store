import { ReactNode } from 'react';
import { ITenantConfig } from '@/entities/tenant';
import { ApiRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { ThemeProvider } from '@/shared/theme';

interface IProps {
  children: ReactNode;
}

export const AppShell = ({ children }: IProps) => {
  const { data } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );

  return (
    <ThemeProvider config={data ?? null}>
      {children}
    </ThemeProvider>
  );
};

import { ReactNode } from 'react';
import { ITenantConfig } from '@/entities/tenant';
import { ApiRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { ThemeProvider } from '@/shared/theme';
import { If, StateView } from '@/shared/ui';

interface IProps {
  children: ReactNode;
}

export const AppShell = ({ children }: IProps) => {
  const { data, isLoading, error, refetch } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );

  return (
    <ThemeProvider config={data ?? null}>
      <If
        condition={Boolean(data)}
        fallback={(
          <StateView
            loading={isLoading}
            errorMessage={error?.message ?? null}
            onRetry={() => {
              refetch();
            }}
          />
        )}
      >
        {children}
      </If>
    </ThemeProvider>
  );
};

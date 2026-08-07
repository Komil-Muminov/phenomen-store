import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { requestData, TApiScope } from '@/shared/api';
import { StaleTimeMs } from '@/shared/config';

type TQueryKey = readonly (string | number | boolean | null | undefined)[];

type TMethod = 'post' | 'patch' | 'put' | 'delete';

interface IGetOptions {
  params?: Record<string, unknown>;
  enabled?: boolean;
  staleTime?: number;
  scope?: TApiScope;
}

interface IMutationOptions {
  method?: TMethod;
  invalidate?: TQueryKey[];
  scope?: TApiScope;
}

export const useGetQuery = <T>(
  key: TQueryKey,
  url: string,
  options: IGetOptions = {},
): UseQueryResult<T, Error> => useQuery<T, Error>({
  queryKey: [...key, options.params ?? null],
  queryFn: () => requestData<T>({ url, method: 'get', params: options.params }, options.scope),
  enabled: options.enabled ?? true,
  staleTime: options.staleTime ?? StaleTimeMs.short,
});

export const useMutationQuery = <TBody, TData = unknown>(
  url: string | ((body: TBody) => string),
  options: IMutationOptions = {},
): UseMutationResult<TData, Error, TBody> => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TBody>({
    mutationFn: (body: TBody) => requestData<TData>({
      url: typeof url === 'function' ? url(body) : url,
      method: options.method ?? 'post',
      data: body,
    }, options.scope),
    onSuccess: () => {
      (options.invalidate ?? []).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

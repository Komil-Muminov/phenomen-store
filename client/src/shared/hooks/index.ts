import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { extractErrorMessage, requestData, uploadImage } from '@/shared/api';
import { ApiRoutes, StaleTimeMs } from '@/shared/config';

type TQueryKey = readonly (string | number | boolean | null | undefined)[];

type TMethod = 'post' | 'patch' | 'put' | 'delete';

interface IGetOptions {
  params?: Record<string, unknown>;
  enabled?: boolean;
  staleTime?: number;
}

interface IMutationOptions {
  method?: TMethod;
  invalidate?: TQueryKey[];
  buildHeaders?: () => Record<string, string>;
}

export const useGetQuery = <T>(
  key: TQueryKey,
  url: string,
  options: IGetOptions = {},
): UseQueryResult<T, Error> => useQuery<T, Error>({
  queryKey: [...key, options.params ?? null],
  queryFn: () => requestData<T>({ url, method: 'get', params: options.params }),
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
      headers: options.buildHeaders?.(),
    }),
    onSuccess: () => {
      (options.invalidate ?? []).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

const GALLERY_QUALITY = 0.9;

const PERMISSION_ERROR = 'Нужен доступ к галерее';

export interface IImageUpload {
  uploading: boolean;
  error: string | null;
  pick: () => Promise<void>;
}

export const useImageUpload = (onUploaded: (url: string) => void): IImageUpload => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(PERMISSION_ERROR);

      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: GALLERY_QUALITY,
    });

    if (picked.canceled) {
      return;
    }

    const asset = picked.assets[0];

    setUploading(true);
    setError(null);

    await uploadImage<{ url: string }>(ApiRoutes.manageMediaUpload, {
      uri: asset.uri,
      name: asset.fileName ?? `image-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    })
      .then((result) => onUploaded(result.url))
      .catch((uploadError: unknown) => setError(extractErrorMessage(uploadError)))
      .finally(() => setUploading(false));
  }, [onUploaded]);

  return { uploading, error, pick };
};

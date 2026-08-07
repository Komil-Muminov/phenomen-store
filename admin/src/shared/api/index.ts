import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  AuthHeader,
  AuthScheme,
  Env,
  RequestTimeoutMs,
  StorageKeys,
  TenantHeader,
  UiMessages,
} from '@/shared/config';

export type TApiScope = 'platform' | 'shop';

export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const apiClient = axios.create({
  baseURL: Env.apiUrl,
  timeout: RequestTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

export const readToken = (): string | null => localStorage.getItem(StorageKeys.token);

export const writeToken = (token: string): void => {
  localStorage.setItem(StorageKeys.token, token);
};

export const clearSession = (): void => {
  localStorage.removeItem(StorageKeys.token);
  localStorage.removeItem(StorageKeys.admin);
};

apiClient.interceptors.request.use((config) => {
  const token = readToken();

  if (token) {
    config.headers[AuthHeader] = `${AuthScheme}${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSession();
    }

    return Promise.reject(error);
  },
);

export const shopClient = axios.create({
  baseURL: Env.apiUrl,
  timeout: RequestTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

export const readShopToken = (): string | null => localStorage.getItem(StorageKeys.shopToken);

export const readShopTenant = (): string | null => localStorage.getItem(StorageKeys.shopTenant);

export const writeShopSession = (token: string, tenantKey: string): void => {
  localStorage.setItem(StorageKeys.shopToken, token);
  localStorage.setItem(StorageKeys.shopTenant, tenantKey);
};

export const clearShopSession = (): void => {
  localStorage.removeItem(StorageKeys.shopToken);
  localStorage.removeItem(StorageKeys.shopUser);
  localStorage.removeItem(StorageKeys.shopTenant);
};

shopClient.interceptors.request.use((config) => {
  const token = readShopToken();
  const tenantKey = readShopTenant();

  if (token) {
    config.headers[AuthHeader] = `${AuthScheme}${token}`;
  }

  if (tenantKey) {
    config.headers[TenantHeader] = tenantKey;
  }

  return config;
});

shopClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearShopSession();
    }

    return Promise.reject(error);
  },
);

const pickClient = (scope: TApiScope): AxiosInstance => (
  scope === 'shop' ? shopClient : apiClient
);

export const requestData = async <T>(
  config: AxiosRequestConfig,
  scope: TApiScope = 'platform',
): Promise<T> => {
  const response = await pickClient(scope).request<IApiResponse<T>>(config);

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? UiMessages.loadError);
  }

  return response.data.data;
};

export const uploadFile = async <T>(url: string, file: File): Promise<T> => {
  const form = new FormData();

  form.append('file', file);

  const response = await shopClient.post<IApiResponse<T>>(url, form);

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? UiMessages.loadError);
  }

  return response.data.data;
};

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : UiMessages.loadError;
};

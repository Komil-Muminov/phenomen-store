import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  AuthHeader,
  AuthScheme,
  Env,
  HttpStatus,
  RequestTimeoutMs,
  StatusMessages,
  StorageKeys,
  TenantHeader,
  TimeoutCodes,
  UiMessages,
} from '@/shared/config';

export type TApiScope = 'platform' | 'shop';

type TSessionListener = () => void;

const sessionListeners: Record<TApiScope, Set<TSessionListener>> = {
  platform: new Set<TSessionListener>(),
  shop: new Set<TSessionListener>(),
};

export const subscribeSessionExpired = (
  scope: TApiScope,
  listener: TSessionListener,
): (() => void) => {
  sessionListeners[scope].add(listener);

  return () => {
    sessionListeners[scope].delete(listener);
  };
};

const notifySessionExpired = (scope: TApiScope): void => {
  sessionListeners[scope].forEach((listener) => listener());
};

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
    if (axios.isAxiosError(error) && error.response?.status === HttpStatus.unauthorized) {
      clearSession();
      notifySessionExpired('platform');
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
    if (axios.isAxiosError(error) && error.response?.status === HttpStatus.unauthorized) {
      clearShopSession();
      notifySessionExpired('shop');
    }

    return Promise.reject(error);
  },
);

const pickClient = (scope: TApiScope): AxiosInstance => (
  scope === 'shop' ? shopClient : apiClient
);

export const extractErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : UiMessages.loadError;
  }

  if (!error.response) {
    return TimeoutCodes.includes(error.code ?? '')
      ? UiMessages.timeoutError
      : UiMessages.networkError;
  }

  const { status, data } = error.response;

  if (status >= HttpStatus.serverError) {
    return UiMessages.serverError;
  }

  const serverMessage = data?.message;

  if (typeof serverMessage === 'string' && serverMessage.length > 0) {
    return serverMessage;
  }

  return StatusMessages[status] ?? UiMessages.loadError;
};

export const requestData = async <T>(
  config: AxiosRequestConfig,
  scope: TApiScope = 'platform',
): Promise<T> => {
  const response = await pickClient(scope)
    .request<IApiResponse<T>>(config)
    .catch((error: unknown) => {
      throw new Error(extractErrorMessage(error));
    });

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? UiMessages.loadError);
  }

  return response.data.data;
};

export const uploadFile = async <T>(url: string, file: File): Promise<T> => {
  const form = new FormData();

  form.append('file', file);

  const response = await shopClient
    .post<IApiResponse<T>>(url, form)
    .catch((error: unknown) => {
      throw new Error(extractErrorMessage(error));
    });

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? UiMessages.loadError);
  }

  return response.data.data;
};

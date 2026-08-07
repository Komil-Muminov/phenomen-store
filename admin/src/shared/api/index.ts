import axios, { AxiosRequestConfig } from 'axios';
import { AuthHeader, AuthScheme, Env, RequestTimeoutMs, StorageKeys, UiMessages } from '@/shared/config';

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

export const requestData = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.request<IApiResponse<T>>(config);

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

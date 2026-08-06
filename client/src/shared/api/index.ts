import axios, { AxiosRequestConfig } from 'axios';
import { Env, GuestHeader, RequestTimeoutMs, TenantHeader, UiMessages } from '@/shared/config';
import { getGuestKey } from '@/shared/session';

export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const apiClient = axios.create({
  baseURL: Env.apiUrl,
  timeout: RequestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
    [TenantHeader]: Env.tenantKey,
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedHandler = (handler: (() => void) | null): void => {
  onUnauthorizedCallback = handler;
};

apiClient.interceptors.request.use(async (config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  config.headers[GuestHeader] = await getGuestKey();

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
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

import axios, { AxiosRequestConfig } from 'axios';
import {
  Env,
  GuestHeader,
  HttpStatus,
  RequestTimeoutMs,
  StatusMessages,
  TenantHeader,
  TimeoutCodes,
  UiMessages,
} from '@/shared/config';
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

let tenantKey: string = Env.tenantKey;

export const setTenantKey = (key: string | null): void => {
  tenantKey = key ?? Env.tenantKey;
};

export const readTenantKey = (): string => tenantKey;

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedHandler = (handler: (() => void) | null): void => {
  onUnauthorizedCallback = handler;
};

apiClient.interceptors.request.use(async (config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  config.headers[GuestHeader] = await getGuestKey();
  config.headers[TenantHeader] = tenantKey;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === HttpStatus.unauthorized) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    return Promise.reject(error);
  },
);

export const extractErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : UiMessages.loadError;
  }

  if (!error.response) {
    const base = __DEV__ ? `\n${Env.apiUrl}` : '';

    return TimeoutCodes.includes(error.code ?? '')
      ? `${UiMessages.timeoutError}${base}`
      : `${UiMessages.networkError}${base}`;
  }

  const { status, data } = error.response;

  if (status >= HttpStatus.serverError) {
    return UiMessages.serverError;
  }

  const serverMessage = data?.message;

  return typeof serverMessage === 'string' && serverMessage.length > 0
    ? serverMessage
    : StatusMessages[status] ?? UiMessages.loadError;
};

export const requestData = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient
    .request<IApiResponse<T>>(config)
    .catch((error: unknown) => {
      throw new Error(extractErrorMessage(error));
    });

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? UiMessages.loadError);
  }

  return response.data.data;
};

export const uploadImage = async <T>(
  url: string,
  file: { uri: string; name: string; type: string },
): Promise<T> => {
  const form = new FormData();

  form.append('file', file as unknown as Blob);

  const response = await apiClient
    .post<IApiResponse<T>>(url, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .catch((error: unknown) => {
      throw new Error(extractErrorMessage(error));
    });

  if (!response.data?.success) {
    throw new Error(response.data?.message ?? UiMessages.loadError);
  }

  return response.data.data;
};

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
    return TimeoutCodes.includes(error.code ?? '')
      ? UiMessages.timeoutError
      : UiMessages.networkError;
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

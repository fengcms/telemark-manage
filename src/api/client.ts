import type { ApiErrorBody, RefreshResponse } from '@/api/types';
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredSession,
} from '@/lib/auth-storage';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787',
  timeout: 15000,
});

const publicAuthPaths = ['/api/auth/login', '/api/auth/refresh'];

const isPublicAuthRequest = (url?: string) => {
  if (!url) {
    return false;
  }

  return publicAuthPaths.some(path => url.endsWith(path));
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

const processQueue = (error: unknown, token?: string) => {
  for (const { resolve, reject } of failedQueue) {
    if (error || !token) {
      reject(error);
      continue;
    }

    resolve(token);
  }

  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  const user = getStoredUser();

  if (!refreshToken || !user) {
    throw new Error('Missing refresh session');
  }

  const response = await axios.post<RefreshResponse>(
    '/api/auth/refresh',
    { refreshToken },
    {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787',
      timeout: 15000,
    },
  );

  const nextAccessToken = response.data.accessToken;

  setStoredSession({
    accessToken: nextAccessToken,
    refreshToken: response.data.refreshToken ?? refreshToken,
    user,
  });

  return nextAccessToken;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token && !isPublicAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const token = await refreshAccessToken();

      processQueue(null, token);
      originalRequest.headers.Authorization = `Bearer ${token}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearStoredSession();
      redirectToLogin();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const getApiErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorBody>;

  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.error ??
    axiosError.message ??
    '请求失败，请稍后重试'
  );
};

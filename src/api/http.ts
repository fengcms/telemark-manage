import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  setStoredSession,
} from '@/auth/session';
import type { ApiErrorBody } from '@/types/api';
import type { RefreshResponse } from '@/types/auth';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let refreshRequest: Promise<RefreshResponse> | null = null;

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const refreshToken = getRefreshToken();

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshToken
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= http
        .post<RefreshResponse>(
          '/api/auth/refresh',
          { refreshToken },
          { headers: { Authorization: undefined } },
        )
        .then(response => response.data)
        .finally(() => {
          refreshRequest = null;
        });

      const refreshed = await refreshRequest;
      const currentUser = localStorage.getItem('telemark.user');

      if (!currentUser) {
        throw new Error('Missing user session');
      }

      setStoredSession({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? refreshToken,
        user: JSON.parse(currentUser),
      });

      originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      clearStoredSession();
      window.location.assign('/login');
      return Promise.reject(refreshError);
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

import type { LoginResponse, OkResponse, RefreshResponse } from '@/api/types';
import { apiClient } from './client';

export type LoginPayload = {
  username: string;
  password: string;
};

export const loginRequest = async (payload: LoginPayload) => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', payload);
  return response.data;
};

export const refreshTokenRequest = async (refreshToken: string) => {
  const response = await apiClient.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
  return response.data;
};

export const logoutRequest = async (refreshToken: string) => {
  const response = await apiClient.post<OkResponse>('/api/auth/logout', { refreshToken });
  return response.data;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export const changePasswordRequest = async (payload: ChangePasswordPayload) => {
  const response = await apiClient.post<OkResponse>('/api/auth/change-password', payload);
  return response.data;
};

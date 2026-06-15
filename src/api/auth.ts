import type { LoginPayload, LoginResponse, RefreshResponse } from '@/types/auth';
import { http } from './http';

export const loginRequest = async (payload: LoginPayload) => {
  const response = await http.post<LoginResponse>('/api/auth/login', payload);
  return response.data;
};

export const refreshTokenRequest = async (refreshToken: string) => {
  const response = await http.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
  return response.data;
};

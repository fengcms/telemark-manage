import type { LoginResponse, RefreshResponse, User } from '@/api/types';

export type CurrentUser = User;

export type AuthSession = LoginResponse;

export type LoginPayload = {
  username: string;
  password: string;
};

export type { LoginResponse, RefreshResponse };

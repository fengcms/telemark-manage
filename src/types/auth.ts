import type { UserRole } from './api';

export type CurrentUser = {
  id?: number | string;
  username?: string;
  name?: string;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: CurrentUser;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = AuthSession;

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

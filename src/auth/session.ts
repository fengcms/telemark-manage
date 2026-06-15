import type { AuthSession } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'telemark.accessToken';
const REFRESH_TOKEN_KEY = 'telemark.refreshToken';
const USER_KEY = 'telemark.user';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const getStoredSession = (): AuthSession | null => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const userText = localStorage.getItem(USER_KEY);

  if (!accessToken || !refreshToken || !userText) {
    return null;
  }

  try {
    return {
      accessToken,
      refreshToken,
      user: JSON.parse(userText) as AuthSession['user'],
    };
  } catch {
    clearStoredSession();
    return null;
  }
};

export const setStoredSession = (session: AuthSession) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
};

export const clearStoredSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

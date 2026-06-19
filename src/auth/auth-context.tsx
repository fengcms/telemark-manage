import { loginRequest, logoutRequest } from '@/api/auth';
import {
  clearStoredSession,
  getRefreshToken,
  getStoredSession,
  setStoredSession,
} from '@/lib/auth-storage';
import { sha256 } from '@/lib/crypto';
import { clearEmployeeOptionsCache } from '@/lib/employee-options-cache';
import type { AuthSession, CurrentUser } from '@/types/auth';
import { useQueryClient } from '@tanstack/react-query';
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type AuthContextValue = {
  user: CurrentUser | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
  clearCacheAndLogout: () => Promise<void>;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  const login = useCallback(async (username: string, password: string) => {
    const passwordHash = await sha256(password);
    const nextSession = await loginRequest({ username, password: passwordHash });

    setStoredSession(nextSession);
    setSession(nextSession);

    return nextSession;
  }, []);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } finally {
      clearSession();
      window.location.assign('/login');
    }
  }, [clearSession]);

  const clearCacheAndLogout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } finally {
      try {
        queryClient.clear();
        clearEmployeeOptionsCache();
        localStorage.clear();
        sessionStorage.clear();

        if ('caches' in window) {
          const cacheNames = await window.caches.keys();
          await Promise.all(cacheNames.map(cacheName => window.caches.delete(cacheName)));
        }
      } finally {
        setSession(null);
        window.location.assign('/login');
      }
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      login,
      logout,
      clearCacheAndLogout,
      clearSession,
    }),
    [clearCacheAndLogout, clearSession, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
};

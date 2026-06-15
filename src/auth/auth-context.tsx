import { loginRequest, logoutRequest } from '@/api/auth';
import {
  clearStoredSession,
  getRefreshToken,
  getStoredSession,
  setStoredSession,
} from '@/lib/auth-storage';
import { sha256 } from '@/lib/crypto';
import type { AuthSession, CurrentUser } from '@/types/auth';
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
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
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

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      login,
      logout,
      clearSession,
    }),
    [clearSession, login, logout, session],
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

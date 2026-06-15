import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const THEME_KEY = 'telemark.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_KEY);

  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
};

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(getSystemTheme());

    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [resolvedTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme: () => setTheme(current => (current === 'dark' ? 'light' : 'dark')),
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return value;
};

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <Button
      aria-label="切换明暗模式"
      size="icon"
      type="button"
      variant="ghost"
      onClick={toggleTheme}
    >
      <Icon className="size-4" />
    </Button>
  );
};

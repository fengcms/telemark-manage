import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';

type HeaderBarProps = {
  onMenuClick: () => void;
};

export const HeaderBar = ({ onMenuClick }: HeaderBarProps) => (
  <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur lg:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <Button className="lg:hidden" size="icon" type="button" variant="ghost" onClick={onMenuClick}>
        <Menu className="size-4" />
      </Button>
      <Breadcrumbs />
    </div>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <UserMenu />
    </div>
  </header>
);

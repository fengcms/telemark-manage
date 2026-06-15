import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/ui/button';
import { roleLabels } from '@/lib/constants';
import { ChevronDown, KeyRound, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const displayName = user?.realName ?? user?.name ?? user?.username ?? '已登录用户';

  return (
    <div className="relative">
      <Button
        className="h-9 gap-2 px-2"
        type="button"
        variant="ghost"
        onClick={() => setOpen(current => !current)}
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-primary/12 text-primary">
          <UserRound className="size-4" />
        </span>
        <span className="hidden max-w-28 truncate text-left text-sm sm:inline">{displayName}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b px-3 py-2">
            <p className="truncate font-medium text-sm">{displayName}</p>
            <p className="text-muted-foreground text-xs">{user ? roleLabels[user.role] : ''}</p>
          </div>
          <div className="p-1">
            <Link
              className="flex h-9 items-center gap-2 rounded-md px-2 text-sm hover:bg-secondary"
              to="/profile/change-password"
              onClick={() => setOpen(false)}
            >
              <KeyRound className="size-4" />
              修改密码
            </Link>
            <button
              className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-destructive hover:bg-destructive/10"
              type="button"
              onClick={() => void logout()}
            >
              <LogOut className="size-4" />
              退出登录
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

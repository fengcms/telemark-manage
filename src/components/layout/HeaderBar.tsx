import { useAuth } from '@/auth/auth-context';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { DatabaseZap, Loader2, Menu } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';

type HeaderBarProps = {
  onMenuClick: () => void;
};

export const HeaderBar = ({ onMenuClick }: HeaderBarProps) => {
  const { clearCacheAndLogout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const clearCache = async () => {
    setIsClearing(true);
    await clearCacheAndLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            className="lg:hidden"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onMenuClick}
          >
            <Menu className="size-4" />
          </Button>
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label="清除缓存并退出"
            size="icon"
            title="清除缓存并退出"
            type="button"
            variant="ghost"
            onClick={() => setConfirmOpen(true)}
          >
            <DatabaseZap className="size-4" />
          </Button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border bg-card p-5 shadow-lg">
            <h2 className="font-semibold text-lg tracking-normal">清除本地缓存并退出？</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              将清除员工选项、查询数据、登录信息和主题设置，然后返回登录页。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                disabled={isClearing}
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                取消
              </Button>
              <Button
                disabled={isClearing}
                type="button"
                variant="destructive"
                onClick={() => void clearCache()}
              >
                {isClearing ? <Loader2 className="size-4 animate-spin" /> : null}
                清除并退出
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

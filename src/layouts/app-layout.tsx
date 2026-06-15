import { useAuth } from '@/auth/auth-context';
import { canAccessRoute } from '@/auth/permissions';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { appRoutes } from '@/routes/routes';
import { LogOut, Menu } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

const roleLabels = {
  1: '超级管理员',
  2: '经理',
  3: '普通员工',
} as const;

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const visibleRoutes = user ? appRoutes.filter(route => canAccessRoute(user.role, route.id)) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
        <div className="flex h-16 items-center border-b px-5">
          <div>
            <p className="font-semibold text-base">Telemark</p>
            <p className="text-muted-foreground text-xs">电话营销管理后台</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {visibleRoutes.map(route => {
            const Icon = route.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                  )
                }
                key={route.id}
                to={route.path}
              >
                <Icon className="size-4" />
                <span>{route.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" size="icon" type="button" variant="ghost">
              <Menu className="size-4" />
            </Button>
            <div>
              <p className="font-medium text-sm">{user?.name ?? user?.username ?? '已登录用户'}</p>
              <p className="text-muted-foreground text-xs">{user ? roleLabels[user.role] : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button type="button" variant="outline" onClick={logout}>
              <LogOut className="size-4" />
              退出
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

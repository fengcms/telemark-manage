import { useAuth } from '@/auth/auth-context';
import { canAccessRoute } from '@/auth/permissions';
import { Button } from '@/components/ui/button';
import { roles } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { type AppRouteConfig, appRoutes } from '@/routes/routes';
import { X } from 'lucide-react';
import { NavLink } from 'react-router';

type SidebarNavProps = {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

const getNavLabel = (route: AppRouteConfig, role?: number) => {
  if (route.id === 'users' && role === roles.manager) {
    return '员工列表';
  }

  return route.label;
};

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user } = useAuth();
  const visibleRoutes = user
    ? appRoutes.filter(
        route => route.id !== 'changePassword' && canAccessRoute(user.role, route.id),
      )
    : [];

  return (
    <>
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
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                )
              }
              key={route.id}
              to={route.path}
              onClick={onNavigate}
            >
              <Icon className="size-4" />
              <span>{getNavLabel(route, user?.role)}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export const SidebarNav = ({ mobileOpen, onMobileOpenChange }: SidebarNavProps) => {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="关闭导航遮罩"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            type="button"
            onClick={() => onMobileOpenChange?.(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[86vw] border-r bg-card shadow-xl">
            <div className="absolute right-3 top-3">
              <Button
                aria-label="关闭导航"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => onMobileOpenChange?.(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <SidebarContent onNavigate={() => onMobileOpenChange?.(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
};

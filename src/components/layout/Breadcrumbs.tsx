import { useAuth } from '@/auth/auth-context';
import { roles } from '@/lib/constants';
import { appRoutes } from '@/routes/routes';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export const Breadcrumbs = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentRoute = appRoutes.find(route => route.path === location.pathname);
  const currentLabel =
    currentRoute?.id === 'users' && user?.role === roles.manager ? '员工列表' : currentRoute?.label;

  return (
    <nav
      aria-label="面包屑"
      className="flex min-w-0 items-center gap-2 text-muted-foreground text-sm"
    >
      <Link
        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        to="/"
      >
        <Home className="size-4" />
        <span className="hidden sm:inline">首页</span>
      </Link>
      {currentRoute ? (
        <>
          <ChevronRight className="size-4 shrink-0" />
          <span className="truncate text-foreground">{currentLabel}</span>
        </>
      ) : null}
    </nav>
  );
};

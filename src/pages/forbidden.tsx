import { useAuth } from '@/auth/auth-context';
import { getDefaultPathByRole } from '@/auth/permissions';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export const ForbiddenPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-semibold text-2xl">无权访问</h1>
      <p className="mt-2 text-muted-foreground text-sm">当前角色没有权限进入这个页面。</p>
      <Button asChild className="mt-6">
        <Link to={user ? getDefaultPathByRole(user.role) : '/login'}>返回可访问页面</Link>
      </Button>
    </div>
  );
};

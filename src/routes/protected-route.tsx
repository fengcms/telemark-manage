import { useAuth } from '@/auth/auth-context';
import { type AppRouteId, canAccessRoute, getDefaultPathByRole } from '@/auth/permissions';
import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

type ProtectedRouteProps = PropsWithChildren<{
  routeId?: AppRouteId;
}>;

export const ProtectedRoute = ({ children, routeId }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (routeId && !canAccessRoute(user.role, routeId)) {
    return <Navigate replace to="/403" />;
  }

  return children;
};

export const RootRedirect = () => {
  const { user } = useAuth();

  return <Navigate replace to={user ? getDefaultPathByRole(user.role) : '/login'} />;
};

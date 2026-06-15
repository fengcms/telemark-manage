import type { Role } from '@/api/types';
import { useAuth } from '@/auth/auth-context';
import { getDefaultPathByRole } from '@/auth/permissions';
import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

type ProtectedRouteProps = PropsWithChildren<{
  allowedRoles?: Role[];
}>;

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { accessToken, user } = useAuth();

  if (!accessToken || !user) {
    return <Navigate replace to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to={getDefaultPathByRole(user.role)} />;
  }

  return children;
};

export const RootRedirect = () => {
  const { accessToken, user } = useAuth();

  return <Navigate replace to={accessToken && user ? getDefaultPathByRole(user.role) : '/login'} />;
};

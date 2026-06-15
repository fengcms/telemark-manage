import { type UserRole, userRoles } from '@/types/api';

export type AppRouteId =
  | 'dashboard'
  | 'batches'
  | 'customers'
  | 'users'
  | 'assignmentLogs'
  | 'callLogs'
  | 'myCustomers'
  | 'myCustomersHistory'
  | 'mySummary'
  | 'changePassword';

export const routePermissions: Record<AppRouteId, UserRole[]> = {
  dashboard: [userRoles.superAdmin, userRoles.manager],
  batches: [userRoles.superAdmin, userRoles.manager],
  customers: [userRoles.superAdmin, userRoles.manager],
  users: [userRoles.superAdmin, userRoles.manager],
  assignmentLogs: [userRoles.superAdmin, userRoles.manager],
  callLogs: [userRoles.superAdmin, userRoles.manager],
  myCustomers: [userRoles.manager, userRoles.employee],
  myCustomersHistory: [userRoles.manager, userRoles.employee],
  mySummary: [userRoles.manager, userRoles.employee],
  changePassword: [userRoles.superAdmin, userRoles.manager, userRoles.employee],
};

export const canAccessRoute = (role: UserRole, routeId: AppRouteId) =>
  routePermissions[routeId].includes(role);

export const getDefaultPathByRole = (role: UserRole) => {
  if (role === userRoles.employee) {
    return '/my-customers';
  }

  return '/dashboard';
};

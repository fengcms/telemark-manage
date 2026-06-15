import type { Role } from '@/api/types';
import { roles } from '@/lib/constants';

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

export const routePermissions: Record<AppRouteId, Role[]> = {
  dashboard: [roles.superAdmin, roles.manager],
  batches: [roles.superAdmin, roles.manager],
  customers: [roles.superAdmin, roles.manager],
  users: [roles.superAdmin, roles.manager],
  assignmentLogs: [roles.superAdmin, roles.manager],
  callLogs: [roles.superAdmin, roles.manager],
  myCustomers: [roles.manager, roles.employee],
  myCustomersHistory: [roles.manager, roles.employee],
  mySummary: [roles.manager, roles.employee],
  changePassword: [roles.superAdmin, roles.manager, roles.employee],
};

export const canAccessRoute = (role: Role, routeId: AppRouteId) =>
  routePermissions[routeId].includes(role);

export const getDefaultPathByRole = (role: Role) => {
  if (role === roles.employee) {
    return '/my-customers';
  }

  return '/dashboard';
};

export type ApiListResponse<T> = {
  page: number;
  pageSize: number;
  total: number;
  list: T[];
};

export type ApiErrorBody = {
  message?: string;
  error?: string;
};

export const userRoles = {
  superAdmin: 1,
  manager: 2,
  employee: 3,
} as const;

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

export const customerStatuses = {
  notDialed: 0,
  answered: 1,
  noAnswer: 2,
  rejected: 3,
  invalidNumber: 4,
} as const;

export type CustomerStatus = (typeof customerStatuses)[keyof typeof customerStatuses];

export const customerTypes = {
  lead: 0,
  prospect: 1,
} as const;

export type CustomerType = (typeof customerTypes)[keyof typeof customerTypes];

import type { CustomerStatus, CustomerType, Role } from '@/api/types';

export const roles = {
  superAdmin: 1,
  manager: 2,
  employee: 3,
} as const satisfies Record<string, Role>;

export const roleLabels: Record<Role, string> = {
  1: '超级管理员',
  2: '经理',
  3: '普通员工',
};

export const customerStatuses = {
  notDialed: 0,
  answered: 1,
  noAnswer: 2,
  rejected: 3,
  invalidNumber: 4,
} as const satisfies Record<string, CustomerStatus>;

export const customerStatusLabels: Record<CustomerStatus, string> = {
  0: '未拨打',
  1: '已接听',
  2: '无人接听',
  3: '拒接',
  4: '空号停机',
};

export const customerTypes = {
  lead: 0,
  intention: 1,
} as const satisfies Record<string, CustomerType>;

export const customerTypeLabels: Record<CustomerType, string> = {
  0: '普通线索',
  1: '意向客户',
};

export const paginationDefaults = {
  page: 0,
  pageSize: 10,
  maxPageSize: 100,
} as const;

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

import type { User } from '@/api/types';

const EMPLOYEE_OPTIONS_CACHE_KEY = 'telemark.employee-options.v1';

type EmployeeOptionsCache = {
  expiresAt: number;
  users: User[];
};

export const readEmployeeOptionsCache = () => {
  const cachedText = localStorage.getItem(EMPLOYEE_OPTIONS_CACHE_KEY);

  if (!cachedText) {
    return null;
  }

  try {
    const cached = JSON.parse(cachedText) as EmployeeOptionsCache;

    if (!Array.isArray(cached.users) || cached.expiresAt <= Date.now()) {
      localStorage.removeItem(EMPLOYEE_OPTIONS_CACHE_KEY);
      return null;
    }

    return cached.users;
  } catch {
    localStorage.removeItem(EMPLOYEE_OPTIONS_CACHE_KEY);
    return null;
  }
};

export const writeEmployeeOptionsCache = (users: User[], ttlMs: number) => {
  const cached: EmployeeOptionsCache = {
    expiresAt: Date.now() + ttlMs,
    users,
  };

  localStorage.setItem(EMPLOYEE_OPTIONS_CACHE_KEY, JSON.stringify(cached));
};

export const clearEmployeeOptionsCache = () => {
  localStorage.removeItem(EMPLOYEE_OPTIONS_CACHE_KEY);
};

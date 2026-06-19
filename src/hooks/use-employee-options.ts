import { getUsers } from '@/api/users';
import { employeeOptionsCacheTtlMs, roles } from '@/lib/constants';
import { readEmployeeOptionsCache, writeEmployeeOptionsCache } from '@/lib/employee-options-cache';
import { useQuery } from '@tanstack/react-query';

export const employeeOptionsQueryKey = ['employee-options'] as const;

const loadEmployeeOptions = async () => {
  const cachedUsers = readEmployeeOptionsCache();

  if (cachedUsers) {
    return cachedUsers;
  }

  const [activeUsers, disabledUsers] = await Promise.all([
    getUsers({ is_disable: 0, page: 0, pagesize: 100 }),
    getUsers({ is_disable: 1, page: 0, pagesize: 100 }),
  ]);

  const usersById = new Map(
    [...activeUsers.list, ...disabledUsers.list]
      .filter(user => user.role === roles.manager || user.role === roles.employee)
      .map(user => [user.id, user]),
  );
  const users = Array.from(usersById.values()).sort((left, right) =>
    (left.realName || left.username).localeCompare(right.realName || right.username, 'zh-CN'),
  );

  writeEmployeeOptionsCache(users, employeeOptionsCacheTtlMs);
  return users;
};

export const useEmployeeOptions = () =>
  useQuery({
    queryKey: employeeOptionsQueryKey,
    queryFn: loadEmployeeOptions,
    staleTime: employeeOptionsCacheTtlMs,
    gcTime: employeeOptionsCacheTtlMs,
  });

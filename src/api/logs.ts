import type { AssignmentLog, PageResponse } from '@/api/types';
import { apiClient } from './client';

export type AssignmentLogListParams = {
  page?: number;
  pagesize?: number;
  sort?: string;
  customerId?: number;
  operatorId?: number;
  fromUserId?: number | 'null';
  toUserId?: number | 'null';
  action?: 'assign' | 'reassign' | 'recycle' | 1 | 2 | 3;
  startDate?: string;
  endDate?: string;
};

export const getAssignmentLogs = async (params?: AssignmentLogListParams) => {
  const response = await apiClient.get<PageResponse<AssignmentLog>>('/api/assignment-logs', {
    params,
  });
  return response.data;
};

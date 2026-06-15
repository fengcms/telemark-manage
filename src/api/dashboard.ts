import type { AgentDailyRow, DashboardOverview, PageResponse } from '@/api/types';
import { apiClient } from './client';

export type DashboardOverviewParams = {
  date?: string;
};

export type AgentDailyParams = {
  date?: string;
  page?: number;
  pagesize?: number;
  sort?: string;
  userId?: number;
  'username-like'?: string;
  'realName-like'?: string;
};

export const getDashboardOverview = async (params?: DashboardOverviewParams) => {
  const response = await apiClient.get<DashboardOverview>('/api/dashboard/overview', { params });
  return response.data;
};

export const getAgentDailyRows = async (params?: AgentDailyParams) => {
  const response = await apiClient.get<PageResponse<AgentDailyRow>>('/api/dashboard/agent-daily', {
    params,
  });
  return response.data;
};

import type {
  CallLog,
  CustomerStatus,
  MySummary,
  PageResponse,
  ReportCallPayload,
  ReportCallResponse,
} from '@/api/types';
import { apiClient } from './client';

export type CallLogListParams = {
  page?: number;
  pagesize?: number;
  sort?: string;
  userId?: number;
  customerId?: number;
  callResult?: CustomerStatus;
  startDate?: string;
  endDate?: string;
};

export const reportCall = async (payload: ReportCallPayload) => {
  const response = await apiClient.post<ReportCallResponse>('/api/calls/report', payload);
  return response.data;
};

export const getCallLogs = async (params?: CallLogListParams) => {
  const response = await apiClient.get<PageResponse<CallLog>>('/api/call-logs', { params });
  return response.data;
};

export const getMySummary = async () => {
  const response = await apiClient.get<MySummary>('/api/my-summary');
  return response.data;
};

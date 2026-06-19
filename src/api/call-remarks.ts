import type {
  CommonCallRemark,
  CommonCallRemarkListParams,
  CreateCommonCallRemarkPayload,
  PageResponse,
  UpdateCommonCallRemarkPayload,
} from '@/api/types';
import { apiClient } from './client';

export const getCommonCallRemarks = async (params?: CommonCallRemarkListParams) => {
  const response = await apiClient.get<PageResponse<CommonCallRemark>>('/api/common-call-remarks', {
    params,
  });
  return response.data;
};

export const createCommonCallRemark = async (payload: CreateCommonCallRemarkPayload) => {
  await apiClient.post('/api/common-call-remarks', payload);
};

export const updateCommonCallRemark = async (
  id: number,
  payload: UpdateCommonCallRemarkPayload,
) => {
  await apiClient.patch(`/api/common-call-remarks/${id}`, payload);
};

export const deleteCommonCallRemark = async (id: number) => {
  await apiClient.delete(`/api/common-call-remarks/${id}`);
};

export const getActiveCallRemarks = async () => {
  const response = await apiClient.get<string[]>('/api/call-remarks/common');
  return response.data;
};

import type {
  Batch,
  BatchSummary,
  ImportBatchPayload,
  ImportBatchResponse,
  PageResponse,
} from '@/api/types';
import { apiClient } from './client';

export type BatchListParams = {
  page?: number;
  pagesize?: number;
  sort?: string;
  'name-like'?: string;
  'source-like'?: string;
  creatorId?: number;
};

export const importBatch = async (payload: ImportBatchPayload) => {
  const response = await apiClient.post<ImportBatchResponse>('/api/batches/import', payload);
  return response.data;
};

export const getBatches = async (params?: BatchListParams) => {
  const response = await apiClient.get<PageResponse<Batch>>('/api/batches', { params });
  return response.data;
};

export const getBatchSummary = async (id: number) => {
  const response = await apiClient.get<BatchSummary>(`/api/batches/${id}/summary`);
  return response.data;
};

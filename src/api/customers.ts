import type {
  AssignCustomersPayload,
  AssignCustomersResponse,
  BatchUpdateCustomersPayload,
  BatchUpdateCustomersResponse,
  Customer,
  CustomerDetail,
  CustomerStatus,
  CustomerType,
  DeleteCustomerPayload,
  DeleteCustomerResponse,
  PageResponse,
  UpdateCustomerPayload,
} from '@/api/types';
import { apiClient } from './client';

export type CustomerListParams = {
  page?: number;
  pagesize?: number;
  sort?: string;
  'name-like'?: string;
  'phone-like'?: string;
  'company-like'?: string;
  status?: CustomerStatus;
  'status-eq'?: CustomerStatus;
  'status-in'?: string;
  type?: CustomerType;
  'type-in'?: string;
  batchId?: number;
  ownerId?: number;
  is_assigned?: 0 | 1;
  [key: string]: string | number | undefined;
};

export type MyCustomerHistoryParams = {
  page?: number;
  pagesize?: number;
  sort?: string;
  status?: Exclude<CustomerStatus, 0>;
  'status-in'?: string;
  type?: CustomerType;
  'type-in'?: string;
  'name-like'?: string;
  'phone-like'?: string;
  'company-like'?: string;
};

export type MyCustomerListParams = Omit<MyCustomerHistoryParams, 'status' | 'status-in'> & {
  [key: string]: string | number | undefined;
};

export const getCustomers = async (params?: CustomerListParams) => {
  const response = await apiClient.get<PageResponse<Customer>>('/api/customers', { params });
  return response.data;
};

export const getCustomer = async (id: number) => {
  const response = await apiClient.get<CustomerDetail>(`/api/customers/${id}`);
  return response.data;
};

export const updateCustomer = async (id: number, payload: UpdateCustomerPayload) => {
  const response = await apiClient.patch<Customer>(`/api/customers/${id}`, payload);
  return response.data;
};

export const deleteCustomer = async (id: number, payload?: DeleteCustomerPayload) => {
  const response = await apiClient.delete<DeleteCustomerResponse>(`/api/customers/${id}`, {
    data: payload,
  });
  return response.data;
};

export const assignCustomers = async (payload: AssignCustomersPayload) => {
  const response = await apiClient.post<AssignCustomersResponse>('/api/customers/assign', payload);
  return response.data;
};

export const batchUpdateCustomers = async (payload: BatchUpdateCustomersPayload) => {
  const response = await apiClient.post<BatchUpdateCustomersResponse>(
    '/api/customers/batch-update',
    payload,
  );
  return response.data;
};

export const getMyCustomers = async (params?: MyCustomerListParams) => {
  const response = await apiClient.get<PageResponse<Customer>>('/api/my-customers', { params });
  return response.data;
};

export const getMyCustomerHistory = async (params?: MyCustomerHistoryParams) => {
  const response = await apiClient.get<PageResponse<Customer>>('/api/my-customers/history', {
    params,
  });
  return response.data;
};

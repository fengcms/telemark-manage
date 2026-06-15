import type {
  CreateUserPayload,
  DeleteUserResponse,
  PageResponse,
  Role,
  UpdateUserPayload,
  User,
} from '@/api/types';
import { apiClient } from './client';

export type UserListParams = {
  page?: number;
  pagesize?: number;
  sort?: string;
  role?: Role;
  status?: number;
  is_disable?: 0 | 1;
  'username-like'?: string;
  'realName-like'?: string;
  'phone-like'?: string;
};

export const getUsers = async (params?: UserListParams) => {
  const response = await apiClient.get<PageResponse<User>>('/api/users', { params });
  return response.data;
};

export const createUser = async (payload: CreateUserPayload) => {
  const response = await apiClient.post<User>('/api/users', payload);
  return response.data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload) => {
  const response = await apiClient.patch<User>(`/api/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await apiClient.delete<DeleteUserResponse>(`/api/users/${id}`);
  return response.data;
};

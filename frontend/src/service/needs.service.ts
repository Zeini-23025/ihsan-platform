import api from './api';
import type { Need, NeedCreateRequest, PaginatedResponse, ApiResponse } from '../types';

export const getPublicNeeds = async (
  page = 1,
  limit = 12,
  city?: string,
  status?: string
): Promise<PaginatedResponse<Need>> => {
  const params: Record<string, string | number> = { page, limit };
  if (city) params.city = city;
  if (status) params.status = status;
  const response = await api.get('/public/needs', { params });
  // Handle both paginated and array responses gracefully
  const d = response.data;
  if (Array.isArray(d)) return { data: d, total: d.length, page: 1, limit: d.length };
  if (d?.data && Array.isArray(d.data)) return d;
  if (d?.data?.data && Array.isArray(d.data.data)) return d.data;
  return { data: [], total: 0, page: 1, limit };
};

export const getNeedById = async (id: string): Promise<Need> => {
  const response = await api.get(`/public/needs/${id}`);
  const d = response.data;
  if (d?.data?.data) return d.data.data;
  if (d?.data) return d.data;
  return d;
};

export const getValidatorNeeds = async (
  page = 1,
  limit = 12
): Promise<PaginatedResponse<Need>> => {
  const response = await api.get('/validateur/need/all', { params: { page, limit } });
  const d = response.data;
  if (Array.isArray(d)) return { data: d, total: d.length, page: 1, limit: d.length };
  if (d?.data && Array.isArray(d.data)) return d;
  if (d?.data?.data) return d.data;
  return { data: [], total: 0, page: 1, limit };
};

export const createNeed = async (data: NeedCreateRequest): Promise<ApiResponse<Need>> => {
  const response = await api.post('/validateur/need/add', data);
  return response.data;
};

export const completeNeed = async (needId: string, formData: FormData): Promise<ApiResponse<Need>> => {
  const response = await api.patch(`/validateur/need/${needId}/complete`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

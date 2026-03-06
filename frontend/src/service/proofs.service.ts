import api from './api';
import type { Proof, ApiResponse } from '../types';

export const addProof = async (needId: string, amount: number): Promise<ApiResponse<Proof>> => {
  const response = await api.post('/donneur/proof/add', { needId, amount });
  return response.data;
};

export const getMyProofs = async (): Promise<Proof[]> => {
  const response = await api.get('/donneur/proof/all');
  const d = response.data;
  if (Array.isArray(d)) return d;
  if (d?.data && Array.isArray(d.data)) return d.data;
  if (d?.data?.data) return d.data.data;
  return [];
};

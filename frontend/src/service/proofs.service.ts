import api from './api';
import type { Proof, ApiResponse } from '../types';

export const addProof = async (needId: string, amount: number): Promise<ApiResponse<Proof>> => {
  const response = await api.post('/donneur/proof/add', { needId, amount });
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractList = (d: any, label = ''): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  for (const key of ['proofs', 'items', 'data', 'results']) {
    if (Array.isArray(d[key])) {
      if (label) console.log(`[extractList:${label}] found key "${key}"`);
      return d[key];
    }
  }
  if (d.data && typeof d.data === 'object') {
    if (Array.isArray(d.data.items)) return d.data.items;
    if (Array.isArray(d.data.data))  return d.data.data;
  }
  for (const key of Object.keys(d)) {
    if (Array.isArray(d[key])) return d[key];
  }
  return [];
};

export const getMyProofs = async (): Promise<Proof[]> => {
  const response = await api.get('/donneur/proof/all');
  return extractList(response.data, 'myProofs');
};

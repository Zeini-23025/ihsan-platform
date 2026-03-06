import api from './api';
import type { Notification } from '../types';

export const registerPushToken = async (token: string, device?: string): Promise<void> => {
  await api.post('/notifications/register-token', { token, device });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractList = (d: any, label = ''): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  for (const key of ['notifications', 'items', 'data', 'results']) {
    if (Array.isArray(d[key])) {
      if (label) console.log(`[extractList:${label}] found key "${key}"`);
      return d[key];
    }
  }
  if (d.data && typeof d.data === 'object' && Array.isArray(d.data.data)) return d.data.data;
  for (const key of Object.keys(d)) {
    if (Array.isArray(d[key])) return d[key];
  }
  return [];
};

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return extractList(response.data, 'notifications');
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

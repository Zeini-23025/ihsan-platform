import api from './api';
import type { Notification } from '../types';

export const registerPushToken = async (token: string, device?: string): Promise<void> => {
  await api.post('/notifications/register-token', { token, device });
};

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  const d = response.data;
  if (Array.isArray(d)) return d;
  if (d?.data && Array.isArray(d.data)) return d.data;
  return [];
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

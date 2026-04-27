import api from './api';
import { Notification } from '../models';

export const notificationService = {
  /**
   * Get current user's notifications
   */
  getAll: async (): Promise<{ notifications: Notification[] }> => {
    const response = await api.get<{ notifications: Notification[] }>('/notifications');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/notifications/${id}/mark-as-read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/notifications/mark-all-as-read');
    return response.data;
  },

  /**
   * Delete notification
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notifications/${id}`);
    return response.data;
  },
};













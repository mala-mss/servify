import api from './api';
import { Task } from '../models';

export interface CreateTaskRequest {
  service_provider_id: string;
  title: string;
  description?: string;
  due_date?: string;
  booking_id?: string;
}

export const taskService = {
  /**
   * Get all tasks
   */
  getAll: async (): Promise<{ tasks: Task[] }> => {
    const response = await api.get<{ tasks: Task[] }>('/tasks');
    return response.data;
  },

  /**
   * Get tasks for a provider
   */
  getProviderTasks: async (providerId?: string): Promise<{ tasks: Task[] }> => {
    const response = await api.get<{ tasks: Task[] }>(`/tasks/provider/${providerId || ''}`);
    return response.data;
  },

  /**
   * Get tasks for a client
   */
  getClientTasks: async (clientId?: string): Promise<{ tasks: Task[] }> => {
    const response = await api.get<{ tasks: Task[] }>(`/tasks/client/${clientId || ''}`);
    return response.data;
  },

  /**
   * Get task by ID
   */
  getById: async (id: string): Promise<{ task: Task }> => {
    const response = await api.get<{ task: Task }>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  create: async (data: CreateTaskRequest): Promise<{ task: Task }> => {
    const response = await api.post<{ task: Task }>('/tasks', data);
    return response.data;
  },

  /**
   * Update task
   */
  update: async (id: string, data: Partial<Task>): Promise<{ task: Task }> => {
    const response = await api.put<{ task: Task }>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Delete task (admin only)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },
};













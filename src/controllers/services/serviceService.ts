import api from './api';
import { Service, ServiceCategory } from '../models';

export interface CreateServiceRequest {
  name: string;
  description: string;
  base_price: number;
  category_id_fk: string;
}

export const serviceService = {
  /**
   * Get all services
   */
  getAll: async (): Promise<{ services: Service[] }> => {
    const response = await api.get<{ services: Service[] }>('/services');
    return response.data;
  },

  /**
   * Get all service categories
   */
  getCategories: async (): Promise<{ categories: ServiceCategory[] }> => {
    const response = await api.get<{ categories: ServiceCategory[] }>('/controllers/services/categories');
    return response.data;
  },

  /**
   * Get service by ID
   */
  getById: async (id: string): Promise<{ service: Service }> => {
    const response = await api.get<{ service: Service }>(`/controllers/services/${id}`);
    return response.data;
  },

  /**
   * Create a new service (admin/provider)
   */
  create: async (data: CreateServiceRequest): Promise<{ service: Service }> => {
    const response = await api.post<{ service: Service }>('/services', data);
    return response.data;
  },

  /**
   * Update service (admin/provider)
   */
  update: async (id: string, data: Partial<CreateServiceRequest>): Promise<{ service: Service }> => {
    const response = await api.put<{ service: Service }>(`/services/${id}`, data);
    return response.data;
  },

  /**
   * Delete service (admin/provider)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/controllers/services/${id}`);
    return response.data;
  },
};













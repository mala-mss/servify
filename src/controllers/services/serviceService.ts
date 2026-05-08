import api from './api';
import type { Service, ServiceCategory } from '@/models/index';
import axiosInstance from '@/controllers/api/axiosInstance'; 
export interface CreateServiceRequest {
  name: string;
  description: string;
  base_price: number;
  category_id_fk: string;
}

export const serviceService = {
 

  getMyServices: async(): Promise<{services: Service[]}> =>{
    const response = await api.get<{services: Service[]}>('/providers/my-services');
    return response.data;
  },
  
  getAll: async (): Promise<{ services: Service[] }> => {
    const response = await api.get<{ services: Service[] }>('/services');
    return response.data;
  },

  
  getCategories: async (): Promise<{ categories: ServiceCategory[] }> => {
    const response = await api.get<{ categories: ServiceCategory[] }>('/services/categories');
    return response.data;
  },

  getById: async (id: string): Promise<{ service: Service }> => {
    const response = await api.get<{ service: Service }>(`/services/${id}`);
    return response.data;
  },

 
  create: async (data: CreateServiceRequest): Promise<{ service: Service }> => {
    const response = await api.post<{ service: Service }>('/services', data);
    return response.data;
  },

  
  update: async (id: string, data: Partial<CreateServiceRequest>): Promise<{ service: Service }> => {
    const response = await api.put<{ service: Service }>(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/services/${id}`);
    return response.data;
  },
};













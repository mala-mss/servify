import api from './api';
import { ServiceProvider, Service, ProviderAvailability } from '../models';

export interface ProviderSearchFilters {
  service_id?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  availability_date?: string;
  availability_time?: string;
}

export interface ProviderDashboardData {
  totalBookings: number;
  pendingRequests: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
}

export const providerService = {
  /**
   * Search providers with filters
   */
  search: async (filters?: ProviderSearchFilters): Promise<{ providers: ServiceProvider[] }> => {
    const response = await api.get<{ providers: ServiceProvider[] }>('/users/providers/search', { params: filters });
    return response.data;
  },

  /**
   * Get provider by ID with details
   */
  getById: async (id: string): Promise<{ provider: ServiceProvider }> => {
    const response = await api.get<{ provider: ServiceProvider }>(`/users/providers/${id}`);
    return response.data;
  },

  /**
   * Get provider dashboard data
   */
  getDashboard: async (): Promise<{ data: ProviderDashboardData }> => {
    const response = await api.get<{ data: ProviderDashboardData }>('/providers/dashboard');
    return response.data;
  },

  /**
   * Get provider's services
   */
  getServices: async (): Promise<{ services: Service[] }> => {
    const response = await api.get<{ services: Service[] }>('/providers/my-services');
    return response.data;
  },

  /**
   * Add a service to provider's offerings
   */
  addService: async (service_id: string, custom_price?: number): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/providers/my-services', { service_id, custom_price });
    return response.data;
  },

  /**
   * Remove a service from provider's offerings
   */
  removeService: async (service_id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/providers/my-controllers/services/${service_id}`);
    return response.data;
  },

  /**
   * Get provider earnings
   */
  getEarnings: async (): Promise<{ earnings: number; pendingPayments: number }> => {
    const response = await api.get<{ earnings: number; pendingPayments: number }>('/providers/earnings');
    return response.data;
  },

  /**
   * Get provider's profile
   */
  getProfile: async (): Promise<{ provider: ServiceProvider }> => {
    const response = await api.get<{ provider: ServiceProvider }>('/providers/profile');
    return response.data;
  },

  /**
   * Update provider profile
   */
  updateProfile: async (data: Partial<ServiceProvider>): Promise<{ provider: ServiceProvider }> => {
    const response = await api.put<{ provider: ServiceProvider }>('/providers/profile', data);
    return response.data;
  },

  /**
   * Get provider availability/schedule
   */
  getSchedule: async (providerId?: string): Promise<{ schedules: Record<number, ProviderAvailability[]> }> => {
    const response = await api.get<{ schedules: Record<number, ProviderAvailability[]> }>(
      `/availability/provider/${providerId || ''}`
    );
    return response.data;
  },

  /**
   * Check provider availability at specific time
   */
  checkAvailability: async (providerId: string, date: string, time: string): Promise<{ available: boolean }> => {
    const response = await api.get<{ available: boolean }>('/availability/check-availability', {
      params: { providerId, date, time },
    });
    return response.data;
  },
};













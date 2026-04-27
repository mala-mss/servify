import api from './api';
import { Booking, BookingRequest } from '../models';

export interface CreateBookingRequest {
  service_provider_id: string;
  service_id: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export const bookingService = {
  /**
   * Get all bookings for current user
   */
  getAll: async (): Promise<{ bookings: Booking[] }> => {
    const response = await api.get<{ bookings: Booking[] }>('/bookings');
    return response.data;
  },

  /**
   * Get booking statistics
   */
  getStats: async (): Promise<{ stats: BookingStats }> => {
    const response = await api.get<{ stats: BookingStats }>('/bookings/stats');
    return response.data;
  },

  /**
   * Create a new booking
   */
  create: async (data: CreateBookingRequest): Promise<{ booking: Booking }> => {
    const response = await api.post<{ booking: Booking }>('/bookings', data);
    return response.data;
  },

  /**
   * Update booking status
   */
  updateStatus: async (id: string, status: Booking['status']): Promise<{ booking: Booking }> => {
    const response = await api.put<{ booking: Booking }>(`/bookings/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get booking by ID
   */
  getById: async (id: string): Promise<{ booking: Booking }> => {
    const response = await api.get<{ booking: Booking }>(`/bookings/${id}`);
    return response.data;
  },
};













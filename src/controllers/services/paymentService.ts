import api from './api';
import { Payment } from '../models';

export interface CreatePaymentRequest {
  booking_id: string;
  amount: number;
  payment_method: string;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface TransactionSummary {
  total: string;
  pending: string;
  paid: string;
  count: number;
}

export const paymentService = {
  /**
   * Get all payments (admin)
   */
  getAll: async (): Promise<{ payments: Payment[] }> => {
    const response = await api.get<{ payments: Payment[] }>('/payments');
    return response.data;
  },

  /**
   * Get payment by ID
   */
  getById: async (id: string): Promise<{ payment: Payment }> => {
    const response = await api.get<{ payment: Payment }>(`/payments/${id}`);
    return response.data;
  },

  /**
   * Get user transactions
   */
  getUserTransactions: async (userId?: string): Promise<{ payments: Payment[] }> => {
    const response = await api.get<{ payments: Payment[] }>(`/payments/user/${userId || ''}`);
    return response.data;
  },

  /**
   * Get transaction summary
   */
  getSummary: async (userId: string): Promise<TransactionSummary> => {
    const response = await api.get<TransactionSummary>(`/payments/summary/${userId}`);
    return response.data;
  },

  /**
   * Create a new payment (admin)
   */
  create: async (data: CreatePaymentRequest): Promise<{ payment: Payment }> => {
    const response = await api.post<{ payment: Payment }>('/payments', data);
    return response.data;
  },

  /**
   * Update payment
   */
  update: async (id: string, data: Partial<Payment>): Promise<{ payment: Payment }> => {
    const response = await api.put<{ payment: Payment }>(`/payments/${id}`, data);
    return response.data;
  },

  /**
   * Delete payment (admin)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/payments/${id}`);
    return response.data;
  },
};













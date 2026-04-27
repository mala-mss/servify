import api from './api';
import { Feedback } from '../models';

export interface CreateFeedbackRequest {
  booking_id: string;
  rating: number;
  comment?: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export const feedbackService = {
  /**
   * Get all feedback
   */
  getAll: async (): Promise<{ feedbacks: Feedback[] }> => {
    const response = await api.get<{ feedbacks: Feedback[] }>('/feedbacks');
    return response.data;
  },

  /**
   * Get feedback by ID
   */
  getById: async (id: string): Promise<{ feedback: Feedback }> => {
    const response = await api.get<{ feedback: Feedback }>(`/feedbacks/${id}`);
    return response.data;
  },

  /**
   * Get feedback for a specific provider
   */
  getProviderFeedbacks: async (providerId: string): Promise<{ feedbacks: Feedback[] }> => {
    const response = await api.get<{ feedbacks: Feedback[] }>(`/feedbacks/provider/${providerId}`);
    return response.data;
  },

  /**
   * Get feedback stats for a provider
   */
  getProviderStats: async (providerId?: string): Promise<FeedbackStats> => {
    const response = await api.get<FeedbackStats>(`/feedbacks/stats/${providerId || ''}`);
    return response.data;
  },

  /**
   * Create new feedback
   */
  create: async (data: CreateFeedbackRequest): Promise<{ feedback: Feedback }> => {
    const response = await api.post<{ feedback: Feedback }>('/feedbacks', data);
    return response.data;
  },

  /**
   * Update feedback
   */
  update: async (id: string, data: Partial<Feedback>): Promise<{ feedback: Feedback }> => {
    const response = await api.put<{ feedback: Feedback }>(`/feedbacks/${id}`, data);
    return response.data;
  },

  /**
   * Delete feedback
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/feedbacks/${id}`);
    return response.data;
  },
};













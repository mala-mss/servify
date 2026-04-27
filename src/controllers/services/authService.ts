import api from './api';
import { User } from '../models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'client' | 'provider';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Logout user (client-side only)
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get user profile
   */
  getProfile: async (id: string): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>(`/auth/profile/${id}`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (id: string, data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>(`/auth/profile/${id}`, data);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/users/me');
    return response.data;
  },
};













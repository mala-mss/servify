import api from './api';
import { User, Dependant, MedicalInfo, AuthorizedPerson } from '../models';

export interface CreateDependantRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  relationship: string;
}

export interface UpdateDependantRequest {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  relationship?: string;
}

export interface CreateAuthorizedPersonRequest {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship: string;
}

export const userService = {
  /**
   * Get all users (admin only)
   */
  getAll: async (): Promise<{ users: User[] }> => {
    const response = await api.get<{ users: User[] }>('/users');
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>(`/users/${id}`);
    return response.data;
  },

  /**
   * Update current user
   */
  update: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>('/users/me', data);
    return response.data;
  },

  /**
   * Delete user (admin only)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },

  / Dependant Management
  /**
   * Get all dependants for current client
   */
  getDependants: async (): Promise<{ dependants: Dependant[] }> => {
    const response = await api.get<{ dependants: Dependant[] }>('/users/dependants');
    return response.data;
  },

  /**
   * Add a new dependant
   */
  addDependant: async (data: CreateDependantRequest): Promise<{ dependant: Dependant }> => {
    const response = await api.post<{ dependant: Dependant }>('/users/dependants', data);
    return response.data;
  },

  /**
   * Update dependant
   */
  updateDependant: async (id: string, data: UpdateDependantRequest): Promise<{ dependant: Dependant }> => {
    const response = await api.put<{ dependant: Dependant }>(`/users/dependants/${id}`, data);
    return response.data;
  },

  /**
   * Delete dependant
   */
  deleteDependant: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/dependants/${id}`);
    return response.data;
  },

  /**
   * Get medical info for dependant
   */
  getMedicalInfo: async (dependantId: string): Promise<{ medicalInfo: MedicalInfo }> => {
    const response = await api.get<{ medicalInfo: MedicalInfo }>(`/users/dependants/${dependantId}/medical-info`);
    return response.data;
  },

  /**
   * Update medical info for dependant
   */
  updateMedicalInfo: async (dependantId: string, data: Partial<MedicalInfo>): Promise<{ medicalInfo: MedicalInfo }> => {
    const response = await api.put<{ medicalInfo: MedicalInfo }>(`/users/dependants/${dependantId}/medical-info`, data);
    return response.data;
  },

  / Authorized People Management
  /**
   * Get all authorized people for current client
   */
  getAuthorizedPeople: async (): Promise<{ authorizedPeople: AuthorizedPerson[] }> => {
    const response = await api.get<{ authorizedPeople: AuthorizedPerson[] }>('/users/authorized-people');
    return response.data;
  },

  /**
   * Add an authorized person
   */
  addAuthorizedPerson: async (data: CreateAuthorizedPersonRequest): Promise<{ authorizedPerson: AuthorizedPerson }> => {
    const response = await api.post<{ authorizedPerson: AuthorizedPerson }>('/users/authorized-people', data);
    return response.data;
  },

  /**
   * Update authorized person
   */
  updateAuthorizedPerson: async (id: string, data: Partial<AuthorizedPerson>): Promise<{ authorizedPerson: AuthorizedPerson }> => {
    const response = await api.put<{ authorizedPerson: AuthorizedPerson }>(`/users/authorized-people/${id}`, data);
    return response.data;
  },

  /**
   * Remove authorized person
   */
  removeAuthorizedPerson: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/authorized-people/${id}`);
    return response.data;
  },
};













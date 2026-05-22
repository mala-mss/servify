import api from './api';

export interface Report {
  id_reporter: string;
  id_reported: string;
  reason: string;
  description: string;
  created_at: string;
  reporter_fname: string;
  reporter_lname: string;
  reported_fname: string;
  reported_lname: string;
}

export const reportService = {
  getAll: async (): Promise<{ reports: Report[] }> => {
    const response = await api.get<{ reports: Report[] }>('/reports');
    return response.data;
  },

  create: async (data: { id_reported: string, reason: string, description?: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/reports', data);
    return response.data;
  },

  delete: async (id_reporter: string, id_reported: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/reports/${id_reporter}/${id_reported}`);
    return response.data;
  }
};

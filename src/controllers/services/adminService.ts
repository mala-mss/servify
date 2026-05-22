import api from './api';

export interface InscriptionRequest {
  id_r: number;
  id_user: number;
  status: string;
  submitted_at: string;
  fname: string;
  lname: string;
  email: string;
  bio: string;
  years_of_exp: number;
  type?: 'registration' | 'doc_update';
}

export interface Document {
  id_doc: number;
  name: string;
  link: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  id_user: number;
}

export const adminService = {
  getApprovals: async (): Promise<{ requests: InscriptionRequest[] }> => {
    const response = await api.get<{ requests: InscriptionRequest[] }>('/admin/approvals');
    return response.data;
  },

  handleApproval: async (id: number, status: 'approved' | 'rejected'): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/admin/approvals/${id}`, { status });
    return response.data;
  },

  getDocuments: async (id: number, userId?: number): Promise<{ documents: Document[] }> => {
    const response = await api.get<{ documents: Document[] }>(`/admin/approvals/${id}/documents`, {
      params: { userId }
    });
    return response.data;
  },

  verifyDocument: async (docId: number, status: 'approved' | 'rejected', reason?: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/admin/documents/${docId}/verify`, { status, reason });
    return response.data;
  },

  getAnalytics: async (): Promise<any> => {
    const response = await api.get<any>('/admin/analytics');
    return response.data;
  }
};

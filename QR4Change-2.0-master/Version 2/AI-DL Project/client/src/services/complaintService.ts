import api, { mlApi } from './api';
import { Complaint, ComplaintFormData, ApiResponse } from '../types';

export const complaintService = {
  // File complaint
  createComplaint: async (complaintData: ComplaintFormData): Promise<ApiResponse<Complaint>> => {
    try {
      const formData = new FormData();
      Object.entries(complaintData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value as string | Blob);
        }
      });

      const token = localStorage.getItem('token');
      const response = await api.post('/api/complaint/register-complaint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('ComplaintService - Error creating complaint:', error);
      throw error;
    }
  },

  // Get all complaints
  getComplaints: async (): Promise<ApiResponse<Complaint[]>> => {
    try {
      const token = localStorage.getItem('token');
      console.log('ComplaintService - Getting all complaints');
      const response = await api.get('/api/complaint/all', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      console.log('ComplaintService - All complaints response:', response.data);

      if (response.data.success && response.data.complaints) {
        return {
          success: true,
          data: response.data.complaints,
          message: response.data.message || 'Complaints retrieved successfully',
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('ComplaintService - Error getting all complaints:', error);
      throw error;
    }
  },

  // Get user complaints
  getUserComplaints: async (userId?: string): Promise<ApiResponse<Complaint[]>> => {
    try {
      const token = localStorage.getItem('token');
      console.log('ComplaintService - Getting user complaints for userId:', userId);
      const response = await api.get('/api/complaint/user-complaints', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(userId ? { params: { userId } } : {}),
      });
      console.log('ComplaintService - User complaints response:', response.data);

      if (response.data.success && response.data.complaints) {
        return {
          success: true,
          data: response.data.complaints,
          message: response.data.message || 'User complaints retrieved successfully',
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('ComplaintService - Error getting user complaints:', error);
      throw error;
    }
  },

  // Get authority complaints
  getAuthorityComplaints: async (): Promise<ApiResponse<Complaint[]>> => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/authority/complaints', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('ComplaintService - Error getting authority complaints:', error);
      throw error;
    }
  },

  // Get complaint status by ID
  getComplaintStatus: async (complaintId: string): Promise<ApiResponse<Complaint>> => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/complaint/status/${complaintId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`ComplaintService - Error getting complaint status for ID ${complaintId}:`, error);
      throw error;
    }
  },

  // Update complaint
  updateComplaint: async (id: string, data: Partial<Complaint>): Promise<ApiResponse<Complaint>> => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/api/authority/complaint/${id}`, data, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`ComplaintService - Error updating complaint with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete complaint
  deleteComplaint: async (id: string): Promise<ApiResponse> => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/api/complaint/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`ComplaintService - Error deleting complaint with ID ${id}:`, error);
      throw error;
    }
  },

  // Filter complaints
  filterComplaints: async (filters: { city?: string; category?: string }): Promise<ApiResponse<Complaint[]>> => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.category) params.append('category', filters.category);

      const token = localStorage.getItem('token');
      const response = await api.get(`/api/complaint/filter?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('ComplaintService - Error filtering complaints:', error);
      throw error;
    }
  },

  // ML Services
  validateImage: async (image: File): Promise<ApiResponse<{ prediction: string; confidence: number }>> => {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await mlApi.post('/api/predict/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('ComplaintService - Error validating image:', error);
      throw error;
    }
  },

  predictUrgency: async (text: string): Promise<ApiResponse<{ urgency: string; confidence: number }>> => {
    try {
      const response = await mlApi.post('/api/predict-urgency/', { text });
      return response.data;
    } catch (error: any) {
      console.error('ComplaintService - Error predicting urgency:', error);
      throw error;
    }
  },
};

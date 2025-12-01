import api from './api';
import { Complaint, ApiResponse } from '../types';

export const authorityService = {
  // Get complaints for authority
  getAuthorityComplaints: async (): Promise<ApiResponse<Complaint[]>> => {
    const response = await api.get('/api/authority/complaints');
    return response.data;
  },

  // Update complaint status
  updateComplaintStatus: async (
    complaintId: string, 
    update: { status: string; feedback?: string }
  ): Promise<ApiResponse<Complaint>> => {
    const response = await api.put(`/api/authority/complaint/${complaintId}`, update);
    return response.data;
  },
};
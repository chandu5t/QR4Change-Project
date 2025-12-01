import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ComplaintState, Complaint, ComplaintFormData, ApiResponse } from '../../types';
import { complaintService } from '../../services/complaintService';

const initialState: ComplaintState = {
  complaints: [],
  currentComplaint: null,
  loading: false,
  error: null,
  filters: {
    city: '',
    category: '',
    status: '',
    urgency: '',
  },
};

// Async thunks
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complaintService.getComplaints();
      console.log('fetchComplaints - Full response:', response);
      // The API returns { success: true, complaints: [...] }
      return response.data.complaints || response.data;
    } catch (error: any) {
      console.error('fetchComplaints - Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
    }
  }
);

export const fetchUserComplaints = createAsyncThunk(
  'complaints/fetchUserComplaints',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await complaintService.getUserComplaints(userId);
      console.log('fetchUserComplaints - Full response:', response);
      // The API returns { success: true, complaints: [...] }
      return response.data.complaints || response.data;
    } catch (error: any) {
      console.error('fetchUserComplaints - Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user complaints');
    }
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/createComplaint',
  async (complaintData: ComplaintFormData, { rejectWithValue }) => {
    try {
      const response = await complaintService.createComplaint(complaintData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create complaint');
    }
  }
);

export const updateComplaint = createAsyncThunk(
  'complaints/updateComplaint',
  async ({ id, data }: { id: string; data: Partial<Complaint> }, { rejectWithValue }) => {
    try {
      const response = await complaintService.updateComplaint(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update complaint');
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  'complaints/deleteComplaint',
  async (id: string, { rejectWithValue }) => {
    try {
      await complaintService.deleteComplaint(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete complaint');
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setCurrentComplaint: (state, action: PayloadAction<Complaint | null>) => {
      state.currentComplaint = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ComplaintState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Complaints
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload;
        state.error = null;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Complaints
      .addCase(fetchUserComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserComplaints.fulfilled, (state, action) => {
        state.loading = false;
        console.log('ComplaintSlice - Setting complaints:', action.payload);
        state.complaints = action.payload;
        state.error = null;
      })
      .addCase(fetchUserComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Complaint
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints.unshift(action.payload);
        state.error = null;
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Complaint
      .addCase(updateComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComplaint.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.complaints.findIndex(complaint => complaint._id === action.payload._id);
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
        if (state.currentComplaint?._id === action.payload._id) {
          state.currentComplaint = action.payload;
        }
        state.error = null;
      })
      .addCase(updateComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Complaint
      .addCase(deleteComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = state.complaints.filter(complaint => complaint._id !== action.payload);
        if (state.currentComplaint?._id === action.payload) {
          state.currentComplaint = null;
        }
        state.error = null;
      })
      .addCase(deleteComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentComplaint, setFilters, clearError } = complaintSlice.actions;
export default complaintSlice.reducer;
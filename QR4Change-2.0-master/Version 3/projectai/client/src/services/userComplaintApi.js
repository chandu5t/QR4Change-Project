import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const complaintApi = createApi({
  reducerPath: 'complaintApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/complaint/' }),
  tagTypes: ['Complaints'], // Added for cache invalidation
  endpoints: (builder) => ({
    // Register Complaint (POST + image upload)
    registerComplaint: builder.mutation({
      query: ({ formData, access_token }) => ({
        url: 'register-complaint',
        method: 'POST',
        body: formData, // must be FormData with {title, desc, ... , image}
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    }),

    // Get complaints by city + category (query params)
    getComplaintsByCityAndCategory: builder.query({
      query: ({ city, category, access_token }) => ({
        url: `filter?city=${city}&category=${category}`,
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    }),

    // Get complaint status for a user (userId in params)
    getUserComplaintStatus: builder.query({
      query: ({ userId, access_token }) => ({
        url: `status/${userId}`,
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
      providesTags: ['Complaints'], // Cache complaints data
    }),

    // Delete complaint by ID
    deleteComplaint: builder.mutation({
      query: ({ id, access_token }) => ({
        url: `complaint/${id}`,
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
      invalidatesTags: ['Complaints'], // Invalidate complaints cache on delete
    }),

    // ✅ Get all complaints (no auth required)
    getAllComplaints: builder.query({
      query: () => ({
        url: 'all',
        method: 'GET',
      }),
      providesTags: ['Complaints'],
    }),
  }),
});

export const {
  useRegisterComplaintMutation,
  useGetComplaintsByCityAndCategoryQuery,
  useGetUserComplaintStatusQuery,
  useDeleteComplaintMutation,
  useGetAllComplaintsQuery, 
} = complaintApi;

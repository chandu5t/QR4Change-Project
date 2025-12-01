import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const AdminAuthApi = createApi({
  reducerPath: 'AdminAuthApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/authority/' }),
  endpoints: (builder) => ({

    registerAdmin: builder.mutation({
      query: (admin) => ({
        url: 'register/',
        method: 'POST',
        body: admin,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    loginAdmin: builder.mutation({
      query: (admin) => ({
        url: 'login/',
        method: 'POST',
        body: admin,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    getLoggedAdmin: builder.query({
      query: (access_token) => ({
        url: 'loggedAuthority/',
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    }),

    getDepartmentComplaints: builder.query({
      query: (access_token) => ({
        url: 'complaints/',
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    }),

    updateComplaintStatus: builder.mutation({
      query: ({ complaintId,access_token,...complaint }) => ({
        url: `complaint/${complaintId}/`,
        method: 'PUT', 
        body: complaint,
        headers: {
          'Content-Type': 'application/json',
           authorization: `Bearer ${access_token}`,
        },
      }),
    }),

  }),
})

export const { 
  useRegisterAdminMutation, 
  useLoginAdminMutation, 
  useGetLoggedAdminQuery, 
  useGetDepartmentComplaintsQuery,
  useUpdateComplaintStatusMutation
} = AdminAuthApi

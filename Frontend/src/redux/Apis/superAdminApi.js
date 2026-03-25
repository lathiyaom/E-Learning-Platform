import { apiSlice } from "./apiSlice";

export const superAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTenants: builder.query({
      query: () => "/SuperAdmin/Tenants",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Tenant", id: _id })),
              { type: "Tenant", id: "LIST" },
            ]
          : [{ type: "Tenant", id: "LIST" }],
    }),

    getTenantWithUsers: builder.query({
      query: (id) => `/SuperAdmin/Tenant/${id}`,
      providesTags: (result, error, id) => [
        { type: "Tenant", id },
        { type: "User", id: "LIST" },
      ],
    }),

    promoteTenant: builder.mutation({
      query: (id) => ({
        url: `/SuperAdmin/Promote/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Tenant", id },
        { type: "Tenant", id: "LIST" },
      ],
    }),

    demoteTenant: builder.mutation({
      query: (id) => ({
        url: `/SuperAdmin/Demote/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Tenant", id },
        { type: "Tenant", id: "LIST" },
      ],
    }),

    changeTenantStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/SuperAdmin/Status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tenant", id },
        { type: "Tenant", id: "LIST" },
      ],
    }),

    getPlatformStats: builder.query({
      query: (role) => ({
        url: `/SuperAdmin/stats${role ? `?role=${role}` : ''}`,
        method: "GET",
      }),
      providesTags: [{ type: "Stats", id: "LIST" }],
    }),

    getPlatformUsers: builder.query({
      query: ({ page = 1, limit = 20, search = '', roleFilter = 'all', statusFilter = 'all' } = {}) => {
        const params = new URLSearchParams({ 
          page: String(page), 
          limit: String(limit) 
        });
        if (search) params.append('search', search);
        if (roleFilter !== 'all') params.append('roleFilter', roleFilter);
        if (statusFilter !== 'all') params.append('statusFilter', statusFilter);
        return `/SuperAdmin/users?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "User", id: _id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
      transformResponse: (response) => ({
        data: response.data,
        pagination: response.pagination
      }),
    }),
    // Legacy
    getAllPlatformUsers: builder.query({
      query: () => "/SuperAdmin/Users?limit=999",
      transformResponse: (response) => response.data || [],
    }),

    getAllTeachers: builder.query({
      query: ({ search = "", page = 1, limit = 20, unassignedOnly = false } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append("search", search);
        if (unassignedOnly) params.append("unassignedOnly", "true");
        return `/SuperAdmin/Teachers?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Teacher", id: _id })),
              { type: "Teacher", id: "LIST" },
            ]
          : [{ type: "Teacher", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllTenantsQuery,
  useLazyGetAllTenantsQuery,
  useGetTenantWithUsersQuery,
  useLazyGetTenantWithUsersQuery,
  usePromoteTenantMutation,
  useDemoteTenantMutation,
  useChangeTenantStatusMutation,
  useGetPlatformUsersQuery,
  useLazyGetPlatformUsersQuery,
  useGetAllPlatformUsersQuery, // Legacy
  useLazyGetAllPlatformUsersQuery,
  useGetPlatformStatsQuery,
  useLazyGetPlatformStatsQuery,
  useGetAllTeachersQuery,
  useLazyGetAllTeachersQuery,
} = superAdminApi;

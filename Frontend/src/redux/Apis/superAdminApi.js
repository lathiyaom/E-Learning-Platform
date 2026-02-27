import { apiSlice } from "./apiSlice";

export const superAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tenants
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

    // Get tenant with users
    getTenantWithUsers: builder.query({
      query: (id) => `/SuperAdmin/Tenant/${id}`,
      providesTags: (result, error, id) => [
        { type: "Tenant", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // Promote tenant to superadmin
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

    // Demote superadmin to admin
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

    // Change tenant status
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

    // Get all users across platform
    getAllPlatformUsers: builder.query({
      query: () => "/SuperAdmin/Users",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "User", id: _id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // Get platform statistics
    getPlatformStats: builder.query({
      query: () => "/SuperAdmin/Stats",
      providesTags: ["Stats"],
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
  useGetAllPlatformUsersQuery,
  useLazyGetAllPlatformUsersQuery,
  useGetPlatformStatsQuery,
  useLazyGetPlatformStatsQuery,
} = superAdminApi;

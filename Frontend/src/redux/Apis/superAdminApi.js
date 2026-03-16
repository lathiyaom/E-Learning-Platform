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

    getPlatformStats: builder.query({
      query: () => "/SuperAdmin/Stats",
      providesTags: ["Stats"],
    }),

    getAllTeachers: builder.query({
      query: ({ search = "", page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append("search", search);
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

    inviteTeacherToOrg: builder.mutation({
      query: ({ teacherId, organizationId }) => ({
        url: "/SuperAdmin/InviteTeacher",
        method: "POST",
        body: { teacherId, organizationId },
      }),
      invalidatesTags: (result, error, { teacherId }) => [
        { type: "Teacher", id: teacherId },
        { type: "Teacher", id: "LIST" },
      ],
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
  useGetAllTeachersQuery,
  useLazyGetAllTeachersQuery,
  useInviteTeacherToOrgMutation,
} = superAdminApi;

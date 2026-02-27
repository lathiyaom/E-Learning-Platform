import { apiSlice } from "./apiSlice";

export const teacherOrganizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin endpoints
    getUnassignedTeachers: builder.query({
      query: () => "/Teacher/unassigned",
      providesTags: ["Teacher"],
    }),

    getOrganizationTeachers: builder.query({
      query: (tenantId) => `/Teacher/organization/${tenantId}`,
      providesTags: (result, error, tenantId) => [{ type: "Teacher", id: tenantId }],
    }),

    assignTeachersToOrganization: builder.mutation({
      query: (data) => ({
        url: "/Teacher/assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teacher"],
    }),

    removeTeacherFromOrganization: builder.mutation({
      query: (teacherId) => ({
        url: `/Teacher/remove/${teacherId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teacher"],
    }),

    // Teacher endpoints
    getMyOrganizations: builder.query({
      query: () => "/Teacher/my-organizations",
      providesTags: ["TeacherOrg"],
    }),

    switchOrganization: builder.mutation({
      query: (data) => ({
        url: "/Teacher/switch-organization",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TeacherOrg", "Course", "Attendance", "Exam"],
    }),

    getOrgStats: builder.query({
      query: (organizationId) => ({
        url: "/Teacher/org-stats",
        params: organizationId ? { organizationId } : {},
      }),
      providesTags: ["TeacherStats"],
    }),

    getOrgData: builder.query({
      query: ({ dataType, organizationId }) => ({
        url: `/Teacher/org-data/${dataType}`,
        params: organizationId ? { organizationId } : {},
      }),
      providesTags: (result, error, { dataType }) => [{ type: "TeacherData", id: dataType }],
    }),
  }),
});

export const {
  useGetUnassignedTeachersQuery,
  useGetOrganizationTeachersQuery,
  useAssignTeachersToOrganizationMutation,
  useRemoveTeacherFromOrganizationMutation,
  useGetMyOrganizationsQuery,
  useSwitchOrganizationMutation,
  useGetOrgStatsQuery,
  useGetOrgDataQuery,
} = teacherOrganizationApi;

import { apiSlice } from "./apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── User Management ───────────────────────────────────────────────────────
    getAdminUsers: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "",
        userType = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (userType) params.append("userType", userType);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);
        return `/Admin/MyUsers?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.users
          ? [
              ...result.data.users.map(({ _id }) => ({ type: "AdminUser", id: _id })),
              { type: "AdminUser", id: "LIST" },
            ]
          : [{ type: "AdminUser", id: "LIST" }],
    }),

    getAdminUserById: builder.query({
      query: (id) => `/Admin/MyUsers/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminUser", id }],
    }),

    createAdminUser: builder.mutation({
      query: (userData) => ({
        url: "/Admin/CreateUser",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "AdminUser", id: "LIST" }],
    }),

    updateAdminUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/Admin/UpdateUser/${id}`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AdminUser", id },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    suspendAdminUser: builder.mutation({
      query: (id) => ({
        url: `/Admin/SuspendUser/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AdminUser", id },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    activateAdminUser: builder.mutation({
      query: (id) => ({
        url: `/Admin/ActivateUser/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AdminUser", id },
        { type: "AdminUser", id: "LIST" },
      ],
    }),

    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `/Admin/DeleteUser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AdminUser", id },
        { type: "AdminUser", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useSuspendAdminUserMutation,
  useActivateAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminApi;

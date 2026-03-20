import { apiSlice } from "./apiSlice";
import { updateUserProfile } from "../slice/authSlice";

const resolveUpdatedUser = (result) =>
  result?.data?.data || result?.data?.user || result?.user || result?.data || null;

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/Auth/Login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response) => response,
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation({
      query: (data) => ({
        url: "/Auth/Logout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "Course"],
    }),

    refreshToken: builder.mutation({
      query: () => ({
        url: "/Auth/refresh-token",
        method: "POST",
      }),
    }),

    getCurrentUser: builder.query({
      query: () => "/Auth/me",
      providesTags: ["User"],
    }),

    signup: builder.mutation({
      query: (userData) => ({
        url: "/User/Signup",
        method: "POST",
        body: userData,
      }),
    }),

    getAllUsers: builder.query({
      query: () => "/User/AllUsers",
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUserDetails: builder.query({
      query: (email) => `/User/Details/${email}`,
      providesTags: (result, error, email) => [{ type: "User", id: email }],
    }),

    updateUser: builder.mutation({
      query: ({ email, id, ...userData }) => ({
        url: `/User/Update/${id}`,
        method: "PATCH",
        body: userData,
      }),
      async onQueryStarted({ email, id }, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const updatedUser = resolveUpdatedUser(data);
          const currentUser = getState()?.auth?.user;

          if (!updatedUser || !currentUser) return;

          const isCurrentUserMatch =
            (id && (String(currentUser.id || currentUser._id) === String(id))) ||
            (email && String(currentUser.email || "").toLowerCase() === String(email).toLowerCase());

          if (isCurrentUserMatch) {
            dispatch(updateUserProfile(updatedUser));
          }
        } catch {
          // No-op: handled by existing mutation error flow.
        }
      },
      invalidatesTags: (result, error, { email }) => [
        { type: "User", id: email },
        "User",
      ],
    }),

    deleteUser: builder.mutation({
      query: (email) => ({
        url: `/User/Delete`,
        method: "DELETE",
        params: { email },
      }),
      invalidatesTags: ["User"],
    }),

    getOrganizationList: builder.query({
      query: () => "/Tenant/list",
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useSignupMutation,
  useGetAllUsersQuery,
  useGetUserDetailsQuery,
  useLazyGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetOrganizationListQuery,
} = authApi;

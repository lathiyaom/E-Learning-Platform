import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Feedback"],
  endpoints: (builder) => ({
    createFeedback: builder.mutation({
      query: (data) => ({
        url: "/Feedback/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
    getCourseFeedback: builder.query({
      query: (courseId) => `/Feedback/course/${courseId}`,
      providesTags: ["Feedback"],
    }),
    getUserFeedback: builder.query({
      query: (reviewerId) => `/Feedback/user/${reviewerId}`,
      providesTags: ["Feedback"],
    }),
    updateFeedback: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/Feedback/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
    deleteFeedback: builder.mutation({
      query: (id) => ({
        url: `/Feedback/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Feedback"],
    }),
  }),
});

export const {
  useCreateFeedbackMutation,
  useGetCourseFeedbackQuery,
  useGetUserFeedbackQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;

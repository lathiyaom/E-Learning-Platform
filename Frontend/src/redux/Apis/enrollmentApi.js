import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.accessToken;
      const sessionId = getState().auth?.sessionId;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      if (sessionId) headers.set("X-Session-Id", sessionId);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Enrollment"],
  endpoints: (builder) => ({
    enrollStudent: builder.mutation({
      query: (data) => ({
        url: "/Enrollment/enroll",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enrollment"],
    }),
    getStudentEnrollments: builder.query({
      query: (studentId) => `/Enrollment/student/${studentId}`,
      providesTags: ["Enrollment"],
    }),
    getMyEnrollments: builder.query({
      query: () => "/Enrollment/my-courses",
      providesTags: ["Enrollment"],
    }),
    getCourseEnrollments: builder.query({
      query: (courseId) => `/Enrollment/course/${courseId}`,
      providesTags: ["Enrollment"],
    }),
    updateProgress: builder.mutation({
      query: ({ id, progressPercent }) => ({
        url: `/Enrollment/progress/${id}`,
        method: "PATCH",
        body: { progressPercent },
      }),
      invalidatesTags: ["Enrollment"],
    }),
    dropCourse: builder.mutation({
      query: (id) => ({
        url: `/Enrollment/drop/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Enrollment"],
    }),
    deleteEnrollment: builder.mutation({
      query: (id) => ({
        url: `/Enrollment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enrollment"],
    }),
  }),
});

export const {
  useEnrollStudentMutation,
  useGetStudentEnrollmentsQuery,
  useGetMyEnrollmentsQuery,
  useGetCourseEnrollmentsQuery,
  useUpdateProgressMutation,
  useDropCourseMutation,
  useDeleteEnrollmentMutation,
} = enrollmentApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
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
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/Attendance/mark",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),
    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/Attendance/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceReport: builder.query({
      query: (courseId) => `/Attendance/report/${courseId}`,
      providesTags: ["Attendance"],
    }),
    getStudentAttendance: builder.query({
      query: ({ studentId, courseId }) =>
        `/Attendance/student/${studentId}/${courseId}`,
      providesTags: ["Attendance"],
    }),
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/Attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useGetAttendanceReportQuery,
  useGetStudentAttendanceQuery,
  useDeleteAttendanceMutation,
} = attendanceApi;

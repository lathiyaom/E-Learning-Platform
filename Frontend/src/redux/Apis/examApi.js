import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const examApi = createApi({
  reducerPath: "examApi",
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
  tagTypes: ["Exam", "Submission"],
  endpoints: (builder) => ({
    createExam: builder.mutation({
      query: (data) => ({
        url: "/Exam/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Exam"],
    }),
    getExamById: builder.query({
      query: (id) => `/Exam/${id}`,
      providesTags: ["Exam"],
    }),
    getExamsByCourse: builder.query({
      query: (courseId) => `/Exam/course/${courseId}`,
      providesTags: ["Exam"],
    }),
    updateExam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/Exam/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Exam"],
    }),
    deleteExam: builder.mutation({
      query: (id) => ({
        url: `/Exam/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Exam"],
    }),
    submitExam: builder.mutation({
      query: ({ examId, answers }) => ({
        url: `/Exam/submit/${examId}`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["Submission"],
    }),
    gradeSubmission: builder.mutation({
      query: ({ submissionId, gradedAnswers, feedback }) => ({
        url: `/Exam/grade/${submissionId}`,
        method: "POST",
        body: { gradedAnswers, feedback },
      }),
      invalidatesTags: ["Submission"],
    }),
    getStudentExams: builder.query({
      query: () => "/Exam/student/upcoming",
      providesTags: ["Exam"],
    }),
    getStudentSubmissions: builder.query({
      query: ({ studentId, courseId }) => ({
        url: `/Exam/submissions/${studentId}`,
        params: courseId ? { courseId } : undefined,
      }),
      providesTags: ["Submission"],
    }),
  }),
});

export const {
  useCreateExamMutation,
  useGetExamByIdQuery,
  useGetExamsByCourseQuery,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useSubmitExamMutation,
  useGradeSubmissionMutation,
  useGetStudentSubmissionsQuery,
  useGetStudentExamsQuery,
} = examApi;

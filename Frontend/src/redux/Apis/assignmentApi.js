import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthState } from "../slice/authSlice";

// Get auth token for API requests
const prepareHeaders = (headers, { getState }) => {
  const token = getAuthState(getState()).accessToken;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
};

export const assignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_APP_API_URL || "/api"}/Assignment`,
    prepareHeaders,
  }),
  tagTypes: ["Assignment", "Submission"],
  endpoints: (builder) => ({
    // Teacher endpoints
    createAssignment: builder.mutation({
      query: (assignmentData) => ({
        url: "/",
        method: "POST",
        body: assignmentData,
      }),
      invalidatesTags: ["Assignment"],
    }),

    getTeacherAssignments: builder.query({
      query: ({ courseId, status, page = 1, limit = 10 }) => ({
        url: "/teacher",
        params: { courseId, status, page, limit },
      }),
      providesTags: ["Assignment"],
    }),

    updateAssignment: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Assignment"],
    }),

    deleteAssignment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignment"],
    }),

    // Student endpoints
    getStudentAssignments: builder.query({
      query: ({ courseId, status, page = 1, limit = 10 }) => ({
        url: "/student",
        params: { courseId, status, page, limit },
      }),
      providesTags: ["Assignment"],
    }),

    // Common endpoints
    getAssignment: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Assignment"],
    }),

    submitAssignment: builder.mutation({
      query: ({ id, ...submissionData }) => ({
        url: `/${id}/submit`,
        method: "POST",
        body: submissionData,
      }),
      invalidatesTags: ["Submission", "Assignment"],
    }),

    // Teacher grading endpoints
    gradeSubmission: builder.mutation({
      query: ({ submissionId, ...gradeData }) => ({
        url: `/${submissionId}/grade`,
        method: "PUT",
        body: gradeData,
      }),
      invalidatesTags: ["Submission"],
    }),

    getAssignmentSubmissions: builder.query({
      query: ({ id, status, page = 1, limit = 10 }) => ({
        url: `/${id}/submissions`,
        params: { status, page, limit },
      }),
      providesTags: ["Submission"],
    }),

    // Additional utility endpoints
    getAssignmentStats: builder.query({
      query: (courseId) => `/teacher/stats/${courseId}`,
      providesTags: ["Assignment"],
    }),

    bulkGradeSubmissions: builder.mutation({
      query: ({ assignmentId, grades }) => ({
        url: `/${assignmentId}/bulk-grade`,
        method: "POST",
        body: { grades },
      }),
      invalidatesTags: ["Submission"],
    }),

    downloadSubmission: builder.query({
      query: ({ submissionId, fileId }) => ({
        url: `/submissions/${submissionId}/download/${fileId}`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Assignment templates
    getAssignmentTemplates: builder.query({
      query: () => "/templates",
      providesTags: ["Assignment"],
    }),

    createAssignmentFromTemplate: builder.mutation({
      query: ({ templateId, ...assignmentData }) => ({
        url: `/from-template/${templateId}`,
        method: "POST",
        body: assignmentData,
      }),
      invalidatesTags: ["Assignment"],
    }),
  }),
});

export const {
  // Teacher mutations
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGradeSubmissionMutation,
  useBulkGradeSubmissionsMutation,
  useCreateAssignmentFromTemplateMutation,

  // Teacher queries
  useGetTeacherAssignmentsQuery,
  useGetAssignmentSubmissionsQuery,
  useGetAssignmentStatsQuery,
  useGetAssignmentTemplatesQuery,

  // Student queries
  useGetStudentAssignmentsQuery,
  useGetAssignmentQuery,

  // Student mutations
  useSubmitAssignmentMutation,

  // Utility queries
  useDownloadSubmissionQuery,
} = assignmentApi;

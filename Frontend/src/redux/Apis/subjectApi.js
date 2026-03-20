import { apiSlice } from "./apiSlice";

export const subjectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: ({ status } = {}) => {
        const base = "/Subject/All";
        return status ? `${base}?status=${encodeURIComponent(status)}` : base;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((subject) => ({ type: "Subject", id: subject._id || subject.id })),
              { type: "Subject", id: "LIST" },
            ]
          : [{ type: "Subject", id: "LIST" }],
    }),

    createSubject: builder.mutation({
      query: (payload) => ({
        url: "/Subject/Create",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Subject", id: "LIST" }],
    }),

    updateSubject: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/Subject/Update/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Subject", id },
        { type: "Subject", id: "LIST" },
      ],
    }),

    archiveSubject: builder.mutation({
      query: (id) => ({
        url: `/Subject/Archive/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Subject", id },
        { type: "Subject", id: "LIST" },
      ],
    }),

    restoreSubject: builder.mutation({
      query: (id) => ({
        url: `/Subject/Restore/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Subject", id },
        { type: "Subject", id: "LIST" },
      ],
    }),

    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/Subject/Delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Subject", id },
        { type: "Subject", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useArchiveSubjectMutation,
  useRestoreSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;

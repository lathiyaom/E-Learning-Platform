import { apiSlice } from "./apiSlice";

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query({
      query: (sortBy) => {
        const url = "/Course/All";
        return sortBy ? `${url}?sortBy=${sortBy}` : url;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Course", id })),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],
    }),
    getMarketplaceCourses: builder.query({
      query: (sortBy) => {
        const url = "/Course/Marketplace";
        return sortBy ? `${url}?sortBy=${sortBy}` : url;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Course", id: _id })),
              { type: "Course", id: "MARKETPLACE" },
            ]
          : [{ type: "Course", id: "MARKETPLACE" }],
    }),

    getCourseById: builder.query({
      query: (id) => `/Course/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),

    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/Course/Create",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    updateCourse: builder.mutation({
      query: ({ id, ...courseData }) => ({
        url: `/Course/Update/${id}`,
        method: "PATCH",
        body: courseData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/Course/Delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllCoursesQuery,
  useGetMarketplaceCoursesQuery,
  useLazyGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useLazyGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi;

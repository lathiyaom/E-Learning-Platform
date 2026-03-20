import { apiSlice } from "./apiSlice";

export const materialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourseMaterials: builder.query({
      query: (courseId) => `/Material/course/${courseId}`,
      providesTags: (result, error, courseId) =>
        result?.data
          ? [
              ...result.data.map((material) => ({ type: "Material", id: material._id })),
              { type: "Material", id: `LIST_${courseId}` },
            ]
          : [{ type: "Material", id: `LIST_${courseId}` }],
    }),

    uploadMaterial: builder.mutation({
      query: (formData) => ({
        url: "/Material/upload",
        method: "POST",
        body: formData,
        // FormData should not have Content-Type set manually (browser sets it with boundary)
      }),
      invalidatesTags: (result, error, formData) => [
        { type: "Material", id: `LIST_${formData.get("course_id")}` }
      ],
    }),

    updateMaterial: builder.mutation({
      query: ({ id, ...materialData }) => ({
        url: `/Material/${id}`,
        method: "PATCH",
        body: materialData,
      }),
      invalidatesTags: (result, error, { id, course_id }) => [
        { type: "Material", id },
        { type: "Material", id: `LIST_${course_id}` },
      ],
    }),

    deleteMaterial: builder.mutation({
      query: ({ id, course_id }) => ({
        url: `/Material/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id, course_id }) => [
        { type: "Material", id },
        { type: "Material", id: `LIST_${course_id}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCourseMaterialsQuery,
  useLazyGetCourseMaterialsQuery,
  useUploadMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialApi;

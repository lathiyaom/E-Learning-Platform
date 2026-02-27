import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:5000",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Don't set Content-Type for FormData - browser will set it with boundary
      return headers;
    },
  }),
  tagTypes: ["Upload"],
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/Upload/image",
        method: "POST",
        body: formData,
      }),
    }),
    uploadDocument: builder.mutation({
      query: (formData) => ({
        url: "/Upload/document",
        method: "POST",
        body: formData,
      }),
    }),
    uploadVideo: builder.mutation({
      query: (formData) => ({
        url: "/Upload/video",
        method: "POST",
        body: formData,
      }),
    }),
    deleteFile: builder.mutation({
      query: (publicId) => ({
        url: `/Upload/${publicId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadDocumentMutation,
  useUploadVideoMutation,
  useDeleteFileMutation,
} = uploadApi;

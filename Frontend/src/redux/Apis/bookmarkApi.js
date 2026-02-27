import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bookmarkApi = createApi({
  reducerPath: "bookmarkApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:5000",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Bookmark"],
  endpoints: (builder) => ({
    addBookmark: builder.mutation({
      query: (courseId) => ({
        url: "/Bookmark/add",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["Bookmark"],
    }),
    removeBookmark: builder.mutation({
      query: (courseId) => ({
        url: "/Bookmark/remove",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["Bookmark"],
    }),
    getUserBookmarks: builder.query({
      query: () => "/Bookmark/my-bookmarks",
      providesTags: ["Bookmark"],
    }),
    isBookmarked: builder.query({
      query: (courseId) => `/Bookmark/check/${courseId}`,
      providesTags: (result, error, courseId) => [{ type: "Bookmark", id: courseId }],
    }),
  }),
});

export const {
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  useGetUserBookmarksQuery,
  useIsBookmarkedQuery,
} = bookmarkApi;

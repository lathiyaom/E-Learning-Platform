import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const newsletterApi = createApi({
  reducerPath: "newsletterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:5000",
    credentials: "include",
  }),
  tagTypes: ["Newsletter"],
  endpoints: (builder) => ({
    subscribe: builder.mutation({
      query: (email) => ({
        url: "/Newsletter/subscribe",
        method: "POST",
        body: { email },
      }),
    }),
    unsubscribe: builder.mutation({
      query: (email) => ({
        url: "/Newsletter/unsubscribe",
        method: "POST",
        body: { email },
      }),
    }),
    getSubscriberCount: builder.query({
      query: () => "/Newsletter/count",
      providesTags: ["Newsletter"],
    }),
  }),
});

export const {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriberCountQuery,
} = newsletterApi;

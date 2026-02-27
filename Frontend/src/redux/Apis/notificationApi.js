import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
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
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    sendNotification: builder.mutation({
      query: (data) => ({
        url: "/Notification/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),
    sendBulkNotifications: builder.mutation({
      query: (data) => ({
        url: "/Notification/send-bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),
    getUserNotifications: builder.query({
      query: (params) => ({
        url: "/Notification/",
        params,
      }),
      providesTags: ["Notification"],
    }),
    getUnreadCount: builder.query({
      query: () => "/Notification/unread-count",
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/Notification/read/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/Notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/Notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useSendNotificationMutation,
  useSendBulkNotificationsMutation,
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;

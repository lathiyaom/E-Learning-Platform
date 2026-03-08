import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const holidayApi = createApi({
  reducerPath: "holidayApi",
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
  tagTypes: ["Holiday"],
  endpoints: (builder) => ({
    createHoliday: builder.mutation({
      query: (holidayData) => ({
        url: "/Holiday/create",
        method: "POST",
        body: holidayData,
      }),
      invalidatesTags: ["Holiday"],
    }),
    getAllHolidays: builder.query({
      query: () => "/Holiday/all",
      providesTags: ["Holiday"],
    }),
    getUpcomingHolidays: builder.query({
      query: () => "/Holiday/upcoming",
      providesTags: ["Holiday"],
    }),
    getHolidayById: builder.query({
      query: (id) => `/Holiday/${id}`,
      providesTags: (result, error, id) => [{ type: "Holiday", id }],
    }),
    updateHoliday: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/Holiday/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Holiday"],
    }),
    deleteHoliday: builder.mutation({
      query: (id) => ({
        url: `/Holiday/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holiday"],
    }),
  }),
});

export const {
  useCreateHolidayMutation,
  useGetAllHolidaysQuery,
  useGetUpcomingHolidaysQuery,
  useGetHolidayByIdQuery,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} = holidayApi;

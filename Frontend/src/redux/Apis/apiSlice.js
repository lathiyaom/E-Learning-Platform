import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;
    const sessionId = getState().auth?.sessionId;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (sessionId) {
      headers.set("X-Session-Id", sessionId);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// ✅ Base query wrapper with automatic token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // ✅ Handle 401 errors with token refresh
  if (result?.error?.status === 401) {
    console.log("⚠️ Token expired, attempting refresh...");

    // ✅ Prevent multiple simultaneous refresh attempts
    if (!api.getState().auth._refreshing) {
      try {
        const refreshResult = await baseQuery(
          {
            url: "/Auth/refresh-token",
            method: "POST",
          },
          api,
          extraOptions,
        );

        if (refreshResult?.data?.success) {
          const newToken = refreshResult.data.data.accessToken;

          // ✅ Update Redux with new token
          api.dispatch({
            type: "auth/updateAccessToken",
            payload: newToken,
          });

          console.log("✅ Token refreshed successfully");

          // ✅ Retry original request with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // ✅ Refresh failed, logout user
          console.error("❌ Token refresh failed");
          api.dispatch({ type: "auth/logout" });
        }
      } catch (error) {
        console.error("❌ Refresh token error:", error);
        api.dispatch({ type: "auth/logout" });
      }
    }
  }

  // ✅ Handle 403 forbidden
  if (result?.error?.status === 403) {
    console.warn("⚠️ Access forbidden - insufficient permissions");
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Course", "Contact", "Tenant", "Stats"],
  endpoints: (builder) => ({}),
});

export default apiSlice;

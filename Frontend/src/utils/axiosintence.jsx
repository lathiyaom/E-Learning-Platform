import axios from "axios";
import { store } from "../redux/store/store";
import { logout, updateAccessToken } from "../redux/slice/authSlice";

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Include cookies in requests
});

// ✅ Request interceptor - attach token to requests
API.interceptors.request.use(
  (config) => {
    try {
      const state = store.getState();
      const token = state.auth?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error attaching token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Try to refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/Auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        // ✅ Update Redux state
        store.dispatch(updateAccessToken(accessToken));

        // ✅ Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // ✅ Refresh failed, logout user
        console.error("Token refresh failed:", refreshError);
        store.dispatch(logout());
        
        // Redirect to login if not already there
        if (window.location.pathname !== "/Login") {
          window.location.href = "/Login";
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;

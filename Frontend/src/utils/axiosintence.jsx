import axios from "axios";
import { store } from "../redux/store/store";
import { logout, updateAccessToken } from "../redux/slice/authSlice";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    try {
      const state = store.getState();
      const token = state.auth?.accessToken;
      const sessionId = state.auth?.sessionId;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (sessionId) {
        config.headers["X-Session-Id"] = sessionId;
      }
    } catch (error) {
      console.error("Error attaching token:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/Auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const accessToken = response?.data?.data?.accessToken;
        if (!accessToken) {
          throw new Error("Refresh token response missing access token");
        }

        store.dispatch(updateAccessToken(accessToken));
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        store.dispatch(logout());

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

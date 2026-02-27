import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosintence";

const initialState = {
  adminDashboard: null,
  teacherDashboard: null,
  studentDashboard: null,
  courseAnalytics: null,
  enrollmentTrends: [],
  loading: false,
  error: null,
};

// Get admin dashboard
export const getAdminDashboard = createAsyncThunk(
  "analytics/adminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Analytics/admin/dashboard");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

// Get teacher dashboard
export const getTeacherDashboard = createAsyncThunk(
  "analytics/teacherDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Analytics/teacher/dashboard");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

// Get student dashboard
export const getStudentDashboard = createAsyncThunk(
  "analytics/studentDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Analytics/student/dashboard");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

// Get course analytics
export const getCourseAnalytics = createAsyncThunk(
  "analytics/course",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/Analytics/course/${courseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch analytics");
    }
  }
);

// Get enrollment trends
export const getEnrollmentTrends = createAsyncThunk(
  "analytics/enrollmentTrends",
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Analytics/enrollment-trends", {
        params: { days },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch trends");
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.adminDashboard = action.payload;
      })
      .addCase(getAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTeacherDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeacherDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherDashboard = action.payload;
      })
      .addCase(getStudentDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStudentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.studentDashboard = action.payload;
      })
      .addCase(getCourseAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourseAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.courseAnalytics = action.payload;
      })
      .addCase(getEnrollmentTrends.fulfilled, (state, action) => {
        state.enrollmentTrends = action.payload;
      });
  },
});

export default analyticsSlice.reducer;

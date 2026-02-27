import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosintence";

const initialState = {
  timetable: [],
  mySchedule: {},
  loading: false,
  error: null,
};

// Get course timetable
export const getCourseTimetable = createAsyncThunk(
  "timetable/getCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/Timetable/course/${courseId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch timetable");
    }
  }
);

// Get my schedule
export const getMySchedule = createAsyncThunk(
  "timetable/getMySchedule",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Timetable/my-schedule");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch schedule");
    }
  }
);

// Get today's schedule
export const getTodaySchedule = createAsyncThunk(
  "timetable/getTodaySchedule",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Timetable/today");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch today's schedule");
    }
  }
);

// Get week schedule
export const getWeekSchedule = createAsyncThunk(
  "timetable/getWeekSchedule",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Timetable/week");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch week schedule");
    }
  }
);

// Create timetable
export const createTimetable = createAsyncThunk(
  "timetable/create",
  async (timetableData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/Timetable/create", timetableData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create timetable");
    }
  }
);

const timetableSlice = createSlice({
  name: "timetable",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCourseTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetable = action.payload;
      })
      .addCase(getCourseTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMySchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.mySchedule = action.payload;
      })
      .addCase(getMySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default timetableSlice.reducer;

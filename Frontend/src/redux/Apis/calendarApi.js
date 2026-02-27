import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosintence";

const initialState = {
  calendarData: {},
  loading: false,
  error: null,
};

// Get month calendar
export const getMonthCalendar = createAsyncThunk(
  "calendar/getMonth",
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/Calendar/month/${year}/${month}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch calendar");
    }
  }
);

// Get today calendar
export const getTodayCalendar = createAsyncThunk(
  "calendar/getToday",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Calendar/today");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch today's calendar");
    }
  }
);

// Get week calendar
export const getWeekCalendar = createAsyncThunk(
  "calendar/getWeek",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Calendar/week");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch week calendar");
    }
  }
);

// Get upcoming calendar
export const getUpcomingCalendar = createAsyncThunk(
  "calendar/getUpcoming",
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/Calendar/upcoming/${days}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch upcoming");
    }
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getMonthCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMonthCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.calendarData = action.payload;
      })
      .addCase(getMonthCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTodayCalendar.fulfilled, (state, action) => {
        state.calendarData = { today: action.payload };
      })
      .addCase(getWeekCalendar.fulfilled, (state, action) => {
        state.calendarData = action.payload;
      })
      .addCase(getUpcomingCalendar.fulfilled, (state, action) => {
        state.calendarData = action.payload;
      });
  },
});

export default calendarSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosintence";

const initialState = {
  lectures: [],
  loading: false,
  error: null,
  pagination: {},
};

// Get lectures by course
export const getLecturesByCourse = createAsyncThunk(
  "lecture/getLecturesByCourse",
  async ({ courseId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/Lecture/course/${courseId}`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch lectures");
    }
  }
);

// Get today's lectures
export const getTodayLectures = createAsyncThunk(
  "lecture/getTodayLectures",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Lecture/today");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch today's lectures");
    }
  }
);

// Get upcoming lectures
export const getUpcomingLectures = createAsyncThunk(
  "lecture/getUpcomingLectures",
  async ({ days = 7, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Lecture/upcoming", {
        params: { days, page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch upcoming lectures");
    }
  }
);

// Create lecture
export const createLecture = createAsyncThunk(
  "lecture/createLecture",
  async (lectureData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/Lecture/create", lectureData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create lecture");
    }
  }
);

// Update lecture
export const updateLecture = createAsyncThunk(
  "lecture/updateLecture",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/Lecture/update/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update lecture");
    }
  }
);

// Delete lecture
export const deleteLecture = createAsyncThunk(
  "lecture/deleteLecture",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/Lecture/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete lecture");
    }
  }
);

const lectureSlice = createSlice({
  name: "lecture",
  initialState,
  reducers: {
    resetLectureState: (state) => {
      state.lectures = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get lectures by course
      .addCase(getLecturesByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLecturesByCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.lectures = action.payload;
      })
      .addCase(getLecturesByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get today's lectures
      .addCase(getTodayLectures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTodayLectures.fulfilled, (state, action) => {
        state.loading = false;
        state.lectures = action.payload;
      })
      .addCase(getTodayLectures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get upcoming lectures
      .addCase(getUpcomingLectures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUpcomingLectures.fulfilled, (state, action) => {
        state.loading = false;
        state.lectures = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUpcomingLectures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create lecture
      .addCase(createLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLecture.fulfilled, (state, action) => {
        state.loading = false;
        state.lectures.push(action.payload);
      })
      .addCase(createLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update lecture
      .addCase(updateLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLecture.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lectures.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) {
          state.lectures[index] = action.payload;
        }
      })
      .addCase(updateLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete lecture
      .addCase(deleteLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLecture.fulfilled, (state, action) => {
        state.loading = false;
        state.lectures = state.lectures.filter((l) => l._id !== action.payload);
      })
      .addCase(deleteLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLectureState } = lectureSlice.actions;
export default lectureSlice.reducer;

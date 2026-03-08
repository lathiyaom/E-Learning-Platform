import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosintence";

const initialState = {
  events: [],
  upcomingEvents: [],
  loading: false,
  error: null,
  pagination: {},
};

// Get all events
export const getAllEvents = createAsyncThunk(
  "event/getAll",
  async ({ type, status, page = 1, limit = 10, search }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Event/all", {
        params: { type, status, page, limit, search },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch events");
    }
  }
);

// Get upcoming events
export const getUpcomingEvents = createAsyncThunk(
  "event/getUpcoming",
  async ({ days = 30, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Event/upcoming", {
        params: { days, page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch upcoming events");
    }
  }
);

// Register for event
export const registerForEvent = createAsyncThunk(
  "event/register",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/Event/${eventId}/register`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to register");
    }
  }
);

// Create event
export const createEvent = createAsyncThunk(
  "event/create",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/Event/create", eventData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create event");
    }
  }
);

// Update event
export const updateEvent = createAsyncThunk(
  "event/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/Event/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update event");
    }
  }
);

// Delete event
export const deleteEvent = createAsyncThunk(
  "event/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/Event/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete event");
    }
  }
);

const eventSlice = createSlice({
  name: "event",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getAllEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUpcomingEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUpcomingEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingEvents = action.payload.data;
      })
      .addCase(getUpcomingEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.events = state.events.map((e) =>
          e._id === action.payload._id ? action.payload : e
        );
      });
  },
});

export default eventSlice.reducer;

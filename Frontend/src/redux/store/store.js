import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../Apis/apiSlice";
import { attendanceApi } from "../Apis/attendanceApi";
import { notificationApi } from "../Apis/notificationApi";
import { feedbackApi } from "../Apis/feedbackApi";
import { enrollmentApi } from "../Apis/enrollmentApi";
import { assignmentApi } from "../Apis/assignmentApi";

import { bookmarkApi } from "../Apis/bookmarkApi";
import { holidayApi } from "../Apis/holidayApi";
import { uploadApi } from "../Apis/uploadApi";
import { newsletterApi } from "../Apis/newsletterApi";
import authReducer from "../slice/authSlice";
import lectureReducer from "../Apis/lectureApi";
import eventReducer from "../Apis/eventApi";
import analyticsReducer from "../Apis/analyticsApi";
import calendarReducer from "../Apis/calendarApi";
import profileReducer from "../Apis/profileApi";

export const store = configureStore({
  reducer: {
    // Main API slice (includes authApi, courseApi, contactApi, superAdminApi via injectEndpoints)
    [apiSlice.reducerPath]: apiSlice.reducer,
    
    // Separate API slices (created with createApi, not injectEndpoints)
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [feedbackApi.reducerPath]: feedbackApi.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer,
    [assignmentApi.reducerPath]: assignmentApi.reducer,

        [bookmarkApi.reducerPath]: bookmarkApi.reducer,
    [holidayApi.reducerPath]: holidayApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [newsletterApi.reducerPath]: newsletterApi.reducer,
    
    // Auth state
    auth: authReducer,
    
    // Slice reducers (using createSlice with createAsyncThunk)
    lecture: lectureReducer,
        event: eventReducer,
    analytics: analyticsReducer,
    calendar: calendarReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // Only include middleware for APIs created with createApi
      apiSlice.middleware,
      attendanceApi.middleware,
      notificationApi.middleware,
      feedbackApi.middleware,
      enrollmentApi.middleware,
      assignmentApi.middleware,

            bookmarkApi.middleware,
      holidayApi.middleware,
      uploadApi.middleware,
      newsletterApi.middleware
    ),
});

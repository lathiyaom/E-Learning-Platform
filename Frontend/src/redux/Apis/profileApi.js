import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosintence";
import { updateUserProfile } from "../slice/authSlice";

const initialState = {
  profile: null,
  settings: null,
  loading: false,
  error: null,
};

const mapProfilePayloadToAuthShape = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  // Tenant settings payload from /Profile/settings for admin organization account.
  if (payload.organizationName !== undefined) {
    return {
      name: payload.organizationName,
      firstName: payload.organizationName,
      email: payload.organizationEmail,
      phoneNo: payload.organizationPhone,
      OrgOwnerName: payload.ownerName,
      OrgOwnerEmail: payload.ownerEmail,
      OrgOwnerPhone: payload.ownerPhone,
      about: payload.organizationAbout,
    };
  }

  return payload;
};

// Get profile
export const getProfile = createAsyncThunk(
  "profile/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Profile/me");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "profile/update",
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.patch("/Profile/update", profileData);
      const payload = response.data.data;
      const authPatch = mapProfilePayloadToAuthShape(payload);
      if (authPatch) {
        dispatch(updateUserProfile(authPatch));
      }
      return payload;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/Profile/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password");
    }
  }
);

// Upload avatar
export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async (avatarUrl, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post("/Profile/upload-avatar", { avatarUrl });
      const payload = response.data.data;
      const authPatch = mapProfilePayloadToAuthShape(payload);
      if (authPatch) {
        dispatch(updateUserProfile(authPatch));
      }
      return payload;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload avatar");
    }
  }
);

// Get settings
export const getSettings = createAsyncThunk(
  "profile/getSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/Profile/settings");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch settings");
    }
  }
);

// Update settings
export const updateSettings = createAsyncThunk(
  "profile/updateSettings",
  async (settings, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.patch("/Profile/settings", settings);
      const payload = response.data.data;
      const authPatch = mapProfilePayloadToAuthShape(payload);
      if (authPatch) {
        dispatch(updateUserProfile(authPatch));
      }
      return payload;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update settings");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export default profileSlice.reducer;

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../../../redux";
import { SuccessToster, ErrorToster } from "../../../../components/toster";
import { getAuth } from "../../../../utils/users";
import { ProfileContext } from "./ProfileContext.js";

export const ProfileProvider = ({ children }) => {
  const { user } = getAuth();
  const email = user?.email;

  const {
    data: response,
    isLoading,
    error,
  } = useGetUserDetailsQuery(email, {
    skip: !email,
  });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const userData = response?.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    campus: "San Francisco Main",
    about: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNo: userData.phoneNo || "",
        campus: userData.campus || "San Francisco Main",
        about: userData.about || "",
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const userId = userData?._id || userData?.id;
    if (!userId) {
      ErrorToster("Unable to update profile. User ID not found.", 3000);
      return;
    }

    const normalizedPhone = String(formData.phoneNo || "").trim();
    const updatePayload = {
      email: userData?.email,
      id: userId,
      firstName: String(formData.firstName || "").trim(),
      lastName: String(formData.lastName || "").trim(),
      about: String(formData.about || "").trim(),
    };

    if (normalizedPhone) {
      updatePayload.phoneNo = normalizedPhone;
    }

    try {
      await updateUser({
        ...updatePayload,
      }).unwrap();
      SuccessToster("Profile updated successfully!", 3000);
      // Query invalidation from updateUser refreshes user details; avoid refetch errors causing false failure toast.
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to update profile", 3000);
    }
  };

  const value = {
    user,
    userData,
    formData,
    setFormData,
    handleChange,
    handleSave,
    isLoading,
    isUpdating,
    error,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../../../redux";
import { SuccessToster, ErrorToster } from "../../../../components/toster";
import { getAuth } from "../../../../utils/users";
import { ProfileContext } from "./ProfileContext.js";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";
import { useGetAllCoursesQuery } from "../../../../redux/Apis/courseApi";

export const ProfileProvider = ({ children }) => {
  const { user } = getAuth();
  const email = user?.email;
  const userRole = String(user?.userType || "student").toLowerCase();

  const {
    data: response,
    isLoading,
    error,
  } = useGetUserDetailsQuery(email, {
    skip: !email,
  });

  const { data: enrollmentsData } = useGetMyEnrollmentsQuery(undefined, {
    skip: userRole !== "student",
  });

  const { data: coursesData } = useGetAllCoursesQuery(undefined, {
    skip: userRole !== "teacher",
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const userData = response?.user;
  const enrollments = enrollmentsData?.data || [];
  const teacherCourses = (coursesData?.data || []).filter((course) => {
    const currentUserId = String(user?._id || user?.id || "");
    const createdBy = String(course?.createdBy?._id || course?.createdBy || "");
    const teacherId = String(course?.teacher_id?._id || course?.teacher_id || "");
    return createdBy === currentUserId || teacherId === currentUserId;
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    about: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNo: userData.phoneNo || "",
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

    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const firstName = String(formData.firstName || "").trim();
    const lastName = String(formData.lastName || "").trim();
    const phoneNo = String(formData.phoneNo || "").trim();
    const about = String(formData.about || "").trim();

    if (!firstName) {
      nextErrors.firstName = "First name is required.";
    }

    if (!lastName) {
      nextErrors.lastName = "Last name is required.";
    }

    if (phoneNo && !/^\+?[0-9\s\-()]{8,20}$/.test(phoneNo)) {
      nextErrors.phoneNo = "Enter a valid phone number.";
    }

    if (about.length > 500) {
      nextErrors.about = "Bio should be 500 characters or less.";
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    const userId = userData?._id || userData?.id;
    if (!userId) {
      ErrorToster("Unable to update profile. User ID not found.", 3000);
      return;
    }

    if (!validateForm()) {
      ErrorToster("Please fix highlighted fields before saving.", 3000);
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
    userRole,
    userData,
    enrollments,
    teacherCourses,
    formData,
    setFormData,
    handleChange,
    handleSave,
    validationErrors,
    isLoading,
    isUpdating,
    error,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

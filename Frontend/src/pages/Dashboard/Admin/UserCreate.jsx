import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";

import AdminLayout from "../../../utils/Adminlayoute";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import {
  useCreateAdminUserMutation,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
} from "../../../redux/Apis/adminApi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  userType: "student",
  age: "",
  gender: "",
  phoneNo: "",
  about: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[-()\d\s]{7,20}$/;

const PAGE_SHELL_CLASS =
  "min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(77,95,218,0.10),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(180,140,76,0.12),_transparent_45%),linear-gradient(180deg,#f8faff,#F9FAFB)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(176,141,87,0.16),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(77,95,218,0.16),_transparent_42%),linear-gradient(180deg,#0e1424,#0b1020)] ";
const PANEL_CLASS =
  "rounded-2xl border border-studprimary/15 bg-white/92 backdrop-blur-sm shadow-sm dark:border-premium-gold/20 dark:bg-white/5";
const LABEL_CLASS =
  "mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300";
const INPUT_BASE_CLASS =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500";

const validateForm = (formData, isEditMode) => {
  const errors = {};

  if (!String(formData.firstName || "").trim()) errors.firstName = "First name is required.";
  if (!String(formData.lastName || "").trim()) errors.lastName = "Last name is required.";

  if (!String(formData.email || "").trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(String(formData.email).trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!isEditMode && !String(formData.password || "").trim()) {
    errors.password = "Password is required.";
  } else if (String(formData.password || "").trim() && String(formData.password).trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!String(formData.userType || "").trim()) {
    errors.userType = "User role is required.";
  }

  if (String(formData.age || "").trim()) {
    const ageValue = Number(formData.age);
    if (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 120) {
      errors.age = "Age must be between 1 and 120.";
    }
  }

  if (String(formData.phoneNo || "").trim() && !PHONE_REGEX.test(String(formData.phoneNo).trim())) {
    errors.phoneNo = "Enter a valid phone number.";
  }

  if (String(formData.about || "").length > 250) {
    errors.about = "About should be 250 characters or less.";
  }

  return errors;
};

const AdminUserCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const { data: existingUserResponse, isFetching: isUserLoading } = useGetAdminUserByIdQuery(editId, {
    skip: !editId,
  });
  const [createUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const existingUser =
    existingUserResponse?.data?.user || existingUserResponse?.data || existingUserResponse?.user || existingUserResponse;

  useEffect(() => {
    if (!isEditMode || !existingUser) return;

    setFormData({
      firstName: existingUser.firstName || "",
      lastName: existingUser.lastName || "",
      email: existingUser.email || "",
      password: "",
      userType: existingUser.userType || "student",
      age: existingUser.age !== undefined && existingUser.age !== null ? String(existingUser.age) : "",
      gender: existingUser.gender || "",
      phoneNo: existingUser.phoneNo || "",
      about: existingUser.about || "",
    });
  }, [existingUser, isEditMode]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(String(formData.firstName).trim()),
      Boolean(String(formData.lastName).trim()),
      Boolean(String(formData.email).trim()),
      isEditMode ? true : Boolean(String(formData.password).trim()),
      Boolean(String(formData.userType).trim()),
    ];

    const completed = checks.filter(Boolean).length;
    return {
      completed,
      total: checks.length,
      percent: Math.round((completed / checks.length) * 100),
    };
  }, [formData, isEditMode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(formData, isEditMode);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      ErrorToster("Please fix the highlighted fields", 2500);
      return;
    }

    const payload = {
      firstName: String(formData.firstName).trim(),
      lastName: String(formData.lastName).trim(),
      email: String(formData.email).trim(),
      userType: formData.userType,
      ...(String(formData.password).trim() ? { password: formData.password } : {}),
      ...(String(formData.age).trim() ? { age: Number(formData.age) } : {}),
      ...(String(formData.gender).trim() ? { gender: formData.gender } : {}),
      ...(String(formData.phoneNo).trim() ? { phoneNo: String(formData.phoneNo).trim() } : {}),
      ...(String(formData.about).trim() ? { about: String(formData.about).trim() } : {}),
    };

    try {
      if (isEditMode) {
        await updateUser({ id: editId, ...payload }).unwrap();
        SuccessToster("User updated successfully", 2500);
      } else {
        await createUser(payload).unwrap();
        SuccessToster("User created successfully", 2500);
      }
      navigate("/admin/users");
    } catch (error) {
      ErrorToster(error?.data?.message || (isEditMode ? "Failed to update user" : "Failed to create user"), 3000);
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`${PAGE_SHELL_CLASS} min-h-screen p-4 sm:p-6 lg:p-8`}
      >
        <div className="mx-auto max-w-7xl space-y-5">
          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl border border-white/60 bg-lavender-light p-5 shadow-sm dark:border-white/10 dark:bg-navy-charcoal sm:p-6"
          >
            <div className="pointer-events-none absolute -right-14 -top-12 h-40 w-40 rounded-full bg-studprimary/10 blur-3xl dark:bg-premium-gold/10" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
              style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "1.4rem 1.4rem" }}
            />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-studprimary/20 bg-studprimary/10 px-3 py-1 text-xs font-semibold text-studprimary dark:border-premium-gold/20 dark:bg-premium-gold/10 dark:text-premium-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isEditMode ? "Edit User Workspace" : "Create User Workspace"}
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {isEditMode ? "Edit User" : "Create User"}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  {isEditMode
                    ? "Update an existing student or teacher account directly on the page."
                    : "Build student or teacher accounts directly on the page without terms or confirm-password fields."}
                </p>
              </div>

              <div className="min-w-[220px] rounded-2xl border border-studprimary/15 bg-white/80 px-4 py-3 dark:border-premium-gold/20 dark:bg-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Form Completion</p>
                <div className="mt-2 h-2.5 rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-studprimary to-superadminprimary transition-all duration-300 dark:from-premium-gold dark:to-premium-gold/70"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {completion.completed}/{completion.total} core fields ready
                </p>
              </div>
            </div>
          </motion.section>

          {isEditMode && isUserLoading ? (
            <motion.section variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-studprimary dark:border-premium-gold" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">Loading user data...</p>
            </motion.section>
          ) : null}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="space-y-5 xl:col-span-8">
                <motion.div variants={itemVariants}>
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">User Identity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>First Name *</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(event) => handleChange("firstName", event.target.value)}
                            className={`${INPUT_BASE_CLASS} ${errors.firstName ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            placeholder="John"
                          />
                          {errors.firstName ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.firstName}</p> : null}
                        </div>

                        <div>
                          <label className={LABEL_CLASS}>Last Name *</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(event) => handleChange("lastName", event.target.value)}
                            className={`${INPUT_BASE_CLASS} ${errors.lastName ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            placeholder="Doe"
                          />
                          {errors.lastName ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.lastName}</p> : null}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Role *</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: "student", label: "Student" },
                              { value: "teacher", label: "Teacher" },
                            ].map((role) => (
                              <label
                                key={role.value}
                                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                                  formData.userType === role.value
                                    ? "border-studprimary bg-studprimary/10 text-studprimary dark:border-premium-gold dark:bg-premium-gold/10 dark:text-premium-gold"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="userType"
                                  value={role.value}
                                  checked={formData.userType === role.value}
                                  onChange={(event) => handleChange("userType", event.target.value)}
                                  className="sr-only"
                                />
                                {role.label}
                              </label>
                            ))}
                          </div>
                          {errors.userType ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.userType}</p> : null}
                        </div>

                        <div>
                          <label className={LABEL_CLASS}>Age</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={formData.age}
                            onChange={(event) => handleChange("age", event.target.value)}
                            className={`${INPUT_BASE_CLASS} ${errors.age ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            placeholder="Optional"
                          />
                          {errors.age ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.age}</p> : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Access & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <div>
                        <label className={LABEL_CLASS}>Email *</label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(event) => handleChange("email", event.target.value)}
                            disabled={isEditMode}
                            className={`${INPUT_BASE_CLASS} pl-10 disabled:cursor-not-allowed disabled:opacity-60 ${errors.email ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            placeholder="john@example.com"
                          />
                        </div>
                        {errors.email ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.email}</p> : null}
                        {isEditMode ? <p className="mt-1 text-[11px] text-slate-400">Email cannot be changed during edit.</p> : null}
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Password {isEditMode ? "(optional)" : "*"}</label>
                        <div className="relative">
                          <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(event) => handleChange("password", event.target.value)}
                            className={`${INPUT_BASE_CLASS} pl-10 pr-12 ${errors.password ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            placeholder={isEditMode ? "Leave blank to keep current password" : "Minimum 8 characters"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.password}</p> : null}
                        {isEditMode ? (
                          <p className="mt-1 text-[11px] text-slate-400">Leave blank if the current password should stay unchanged.</p>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Phone</label>
                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={formData.phoneNo}
                              onChange={(event) => handleChange("phoneNo", event.target.value)}
                              className={`${INPUT_BASE_CLASS} pl-10 ${errors.phoneNo ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                              placeholder="+1 555 000 0000"
                            />
                          </div>
                          {errors.phoneNo ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.phoneNo}</p> : null}
                        </div>

                        <div>
                          <label className={LABEL_CLASS}>Gender</label>
                          <select
                            value={formData.gender}
                            onChange={(event) => handleChange("gender", event.target.value)}
                            className={`${INPUT_BASE_CLASS} border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20`}
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <div>
                        <label className={LABEL_CLASS}>About</label>
                        <textarea
                          rows={4}
                          value={formData.about}
                          onChange={(event) => handleChange("about", event.target.value)}
                          className={`${INPUT_BASE_CLASS} resize-none border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20 ${errors.about ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : ""}`}
                          placeholder="Optional short description about this user."
                        />
                        <div className="mt-1 flex items-center justify-between">
                          {errors.about ? <p className="text-xs font-semibold text-red-600 dark:text-red-300">{errors.about}</p> : <span />}
                          <p className="text-[11px] text-slate-400">{String(formData.about || "").length}/250</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="xl:col-span-4">
                <div className="sticky top-4 space-y-4">
                  <motion.div variants={itemVariants}>
                    <Card className={PANEL_CLASS}>
                      <CardHeader className="pb-0">
                        <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{isEditMode ? "Update Summary" : "Create Summary"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-5">
                        <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Selected Role</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white capitalize">{formData.userType || "Not selected"}</p>
                        </div>

                        <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email Preview</p>
                          <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{formData.email || "No email entered"}</p>
                        </div>

                        <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Password</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {formData.password ? `${String(formData.password).length} characters entered` : isEditMode ? "Optional" : "Not set"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <div className="flex items-start gap-1.5">
                            <BadgeCheck className="mt-0.5 h-4 w-4" />
                            <span>This form sends only admin-safe fields to the user API.</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className={PANEL_CLASS}>
                      <CardContent className="space-y-3 py-4">
                        <Button
                          type="submit"
                          disabled={isCreating || isUpdating || isUserLoading}
                          className="h-11 w-full rounded-xl bg-studprimary text-sm font-bold text-white hover:bg-studprimary/90 disabled:opacity-60 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                        >
                          {isCreating || isUpdating || isUserLoading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="mr-1.5 h-4 w-4" />
                              {isEditMode ? "Update User" : "Create User"}
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          onClick={() => navigate("/admin/users")}
                          variant="outline"
                          className="h-11 w-full rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/10"
                        >
                          <ArrowLeft className="mr-1.5 h-4 w-4" />
                          Back to Users
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminUserCreate;
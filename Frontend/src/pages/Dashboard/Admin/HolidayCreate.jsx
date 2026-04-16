import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Globe2,
  Palette,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

import AdminLayout from "../../../utils/Adminlayoute";
import { holidayApi } from "../../../api/holidayApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32 },
  },
};

const HOLIDAY_TYPE_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "restricted", label: "Restricted" },
  { value: "optional", label: "Optional" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
];

const ROLE_OPTIONS = ["all", "student", "teacher", "admin"];

const initialForm = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  holiday_type: "public",
  status: "active",
  color: "#EF4444",
  affects_roles: ["all"],
  tags: "",
};

const validateHolidayForm = (form) => {
  const errors = {};
  if (!form.title?.trim()) errors.title = "Title is required";
  if (!form.date) errors.date = "Start date is required";
  if (!form.holiday_type?.trim()) errors.holiday_type = "Holiday type is required";
  if (form.endDate && form.date && new Date(form.endDate) < new Date(form.date)) {
    errors.endDate = "End date must be after start date";
  }
  if (!form.affects_roles || form.affects_roles.length === 0) {
    errors.affects_roles = "At least one role must be selected";
  }
  return errors;
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const PAGE_SHELL_CLASS =
  "min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(77,95,218,0.12),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(180,140,76,0.14),_transparent_44%),linear-gradient(180deg,#f8faff,#F8FAFC)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(176,141,87,0.20),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(77,95,218,0.20),_transparent_43%),linear-gradient(180deg,#0e1424,#0a1222)]";
const PANEL_CLASS =
  "rounded-2xl border border-studprimary/15 bg-white/90 shadow-sm backdrop-blur-sm dark:border-premium-gold/20 dark:bg-white/5";
const LABEL_CLASS =
  "mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300";
const INPUT_BASE_CLASS =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500";

const HolidayCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const [form, setForm] = useState(initialForm);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const errors = useMemo(() => validateHolidayForm(form), [form]);

  useEffect(() => {
    const fetchHoliday = async () => {
      if (!editId) {
        setForm(initialForm);
        return;
      }

      try {
        setLoadingExisting(true);
        const res = await holidayApi.getHoliday(editId);
        const holiday = res?.data?.data || res?.data;

        if (!holiday?._id) {
          ErrorToster("Holiday not found", 2500);
          navigate("/admin/holidays");
          return;
        }

        setForm({
          title: holiday.title || "",
          description: holiday.description || "",
          date: toDateInput(holiday.date),
          endDate: toDateInput(holiday.endDate),
          holiday_type: holiday.holiday_type || "public",
          status: holiday.status || "active",
          color: holiday.color || "#EF4444",
          affects_roles: holiday.affects_roles?.length ? holiday.affects_roles : ["all"],
          tags: Array.isArray(holiday.tags) ? holiday.tags.join(", ") : "",
        });
      } catch (error) {
        ErrorToster(error?.response?.data?.message || "Failed to load holiday", 3000);
        navigate("/admin/holidays");
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchHoliday();
  }, [editId, navigate]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(String(form.title).trim()),
      Boolean(form.date),
      Boolean(form.holiday_type),
      Array.isArray(form.affects_roles) && form.affects_roles.length > 0,
    ];

    const completed = checks.filter(Boolean).length;
    return {
      completed,
      total: checks.length,
      percent: Math.round((completed / checks.length) * 100),
    };
  }, [form]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRole = (role) => {
    setForm((prev) => {
      const exists = prev.affects_roles.includes(role);
      if (role === "all") {
        return { ...prev, affects_roles: ["all"] };
      }

      const next = exists
        ? prev.affects_roles.filter((item) => item !== role)
        : [...prev.affects_roles.filter((item) => item !== "all"), role];

      return { ...prev, affects_roles: next.length ? next : ["all"] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateHolidayForm(form);
    if (Object.keys(nextErrors).length > 0) {
      ErrorToster("Please fix the highlighted fields", 2500);
      return;
    }

    if (form.endDate && form.date && new Date(form.endDate) < new Date(form.date)) {
      ErrorToster("End date must be after start date", 2500);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        endDate: form.endDate || form.date,
        tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      };

      if (isEditMode) {
        await holidayApi.updateHoliday(editId, payload);
        SuccessToster("Holiday updated", 2500);
      } else {
        await holidayApi.createHoliday(payload);
        SuccessToster("Holiday created", 2500);
      }
      navigate("/admin/holidays");
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to save holiday", 3000);
    } finally {
      setSaving(false);
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
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-studprimary/15 blur-3xl dark:bg-premium-gold/10" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "1.3rem 1.3rem" }}
            />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-studprimary/25 bg-studprimary/10 px-3 py-1 text-xs font-semibold text-studprimary dark:border-premium-gold/20 dark:bg-premium-gold/10 dark:text-premium-gold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isEditMode ? "Holiday Update Studio" : "Holiday Creation Studio"}
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {isEditMode ? "Edit Holiday" : "Create Holiday"}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  {isEditMode
                    ? "Update holiday windows and role coverage from a dedicated page without modal interactions."
                    : "Configure holiday windows and affected roles so schedules remain aligned across the admin workspace."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/holidays")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back To Holidays
              </button>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <article className={`${PANEL_CLASS} xl:col-span-8`}>
              {loadingExisting ? (
                <div className="p-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Loading holiday details...</div>
              ) : null}
              <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
                <fieldset className="space-y-4 border-b border-slate-200/80 pb-6 dark:border-white/10">
                  <legend className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Holiday Basics</legend>

                  <label className="block">
                    <span className={LABEL_CLASS}>Title</span>
                    <input
                      className={`${INPUT_BASE_CLASS} ${
                        errors.title
                          ? "border-red-400 ring-2 ring-red-200/70 dark:ring-red-500/20"
                          : "border-slate-300 focus:border-studprimary focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
                      }`}
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Enter holiday name"
                    />
                    {errors.title ? <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.title}</p> : null}
                  </label>

                  <label className="block">
                    <span className={LABEL_CLASS}>Description</span>
                    <textarea
                      rows={4}
                      className={`${INPUT_BASE_CLASS} resize-none border-slate-300 focus:border-studprimary focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-premium-gold/20`}
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Optional note for academic/admin teams"
                    />
                  </label>
                </fieldset>

                <fieldset className="space-y-4 border-b border-slate-200/80 pb-6 dark:border-white/10">
                  <legend className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Type, Status & Dates</legend>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className={LABEL_CLASS}>Holiday Type</span>
                      <select
                        className={`${INPUT_BASE_CLASS} border-slate-300 focus:border-studprimary focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-premium-gold/20`}
                        value={form.holiday_type}
                        onChange={(e) => handleChange("holiday_type", e.target.value)}
                      >
                        {HOLIDAY_TYPE_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={LABEL_CLASS}>Status</span>
                      <select
                        className={`${INPUT_BASE_CLASS} border-slate-300 focus:border-studprimary focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-premium-gold/20`}
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                      >
                        {STATUS_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={LABEL_CLASS}>Start Date</span>
                      <input
                        type="date"
                        className={`${INPUT_BASE_CLASS} ${
                          errors.date
                            ? "border-red-400 ring-2 ring-red-200/70 dark:ring-red-500/20"
                            : "border-slate-300 focus:border-studprimary focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
                        }`}
                        value={form.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                      />
                      {errors.date ? <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.date}</p> : null}
                    </label>

                    <label className="block">
                      <span className={LABEL_CLASS}>End Date (Optional)</span>
                      <input
                        type="date"
                        className={`${INPUT_BASE_CLASS} ${
                          errors.endDate
                            ? "border-red-400 ring-2 ring-red-200/70 dark:ring-red-500/20"
                            : "border-slate-300 focus:border-studprimary focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
                        }`}
                        value={form.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                      />
                      {errors.endDate ? <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.endDate}</p> : null}
                    </label>
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Access & Metadata</legend>

                  <div className={`rounded-xl border p-3 ${errors.affects_roles ? "border-red-400 bg-red-50/70 dark:bg-red-500/10" : "border-slate-300 dark:border-white/10"}`}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300">Affected Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_OPTIONS.map((role) => {
                        const active = form.affects_roles.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleRole(role)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                              active
                                ? "border-studprimary bg-studprimary text-white dark:border-premium-gold dark:bg-premium-gold dark:text-deep-charcoal"
                                : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30"
                            }`}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>
                    {errors.affects_roles ? <p className="mt-2 text-xs font-semibold text-red-500">{errors.affects_roles}</p> : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className={LABEL_CLASS}>Color</span>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-3 py-2 dark:border-white/10 dark:bg-deep-charcoal">
                        <input
                          type="color"
                          value={form.color}
                          onChange={(e) => handleChange("color", e.target.value)}
                          className="h-9 w-14 cursor-pointer rounded border border-slate-300 dark:border-white/10"
                        />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{form.color}</span>
                      </div>
                    </label>

                    <label className="block">
                      <span className={LABEL_CLASS}>Tags</span>
                      <input
                        className={`${INPUT_BASE_CLASS} border-slate-300 focus:border-studprimary focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:focus:border-premium-gold dark:focus:ring-premium-gold/20`}
                        value={form.tags}
                        onChange={(e) => handleChange("tags", e.target.value)}
                        placeholder="festival, campus, exam-break"
                      />
                    </label>
                  </div>
                </fieldset>

                <div className="flex flex-col gap-2 border-t border-slate-200 pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/holidays")}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || loadingExisting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-studprimary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-premium-gold dark:text-deep-charcoal"
                  >
                    <Plus className="h-4 w-4" />
                    {saving ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Holiday" : "Create Holiday"}
                  </button>
                </div>
              </form>
            </article>

            <aside className="space-y-4 xl:col-span-4">
              <article className={`${PANEL_CLASS} p-5`}>
                <h2 className="text-sm font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
                  Completion Pulse
                </h2>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-studprimary transition-all duration-300 dark:bg-premium-gold"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {completion.completed}/{completion.total} sections complete
                </p>
              </article>

              <article className={`${PANEL_CLASS} p-5`}>
                <h2 className="text-sm font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
                  Coverage Plan
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-studprimary dark:text-premium-gold" /> Date range</li>
                  <li className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-studprimary dark:text-premium-gold" /> Holiday type</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-studprimary dark:text-premium-gold" /> Role scope</li>
                  <li className="flex items-center gap-2"><Tag className="h-4 w-4 text-studprimary dark:text-premium-gold" /> Tags for categorization</li>
                </ul>
              </article>

              <article className={`${PANEL_CLASS} p-5`}>
                <h2 className="text-sm font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
                  Live Preview
                </h2>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-deep-charcoal">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    <Palette className="h-4 w-4" />
                    {form.holiday_type || "holiday"}
                  </div>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {form.title.trim() || "Untitled Holiday"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2 dark:text-slate-300">
                    {form.description.trim() || "Add a brief holiday context for admin and staff."}
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {form.date || "No start date"}</p>
                    <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> {(form.affects_roles || ["all"]).join(", ")}</p>
                    <p className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {form.status}</p>
                  </div>
                </div>
              </article>
            </aside>
          </motion.section>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default HolidayCreate;

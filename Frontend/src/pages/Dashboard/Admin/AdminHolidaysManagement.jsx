import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import { holidayApi } from "../../../api/holidayApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import {
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import holidayVisual from "../../../assets/imgs/hero-students.jpg";

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

const TYPE_FILTER_OPTIONS = [{ value: "all", label: "All Types" }, ...HOLIDAY_TYPE_OPTIONS];
const STATUS_FILTER_OPTIONS = [{ value: "all", label: "All Statuses" }, ...STATUS_OPTIONS];

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

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

const HolidayModal = ({ form, setForm, editing, onClose, onSubmit, saving }) => {
  const errors = React.useMemo(() => validateHolidayForm(form), [form]);
  const isFormValid = Object.keys(errors).length === 0;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl lg:max-w-4xl rounded-[24px] bg-white dark:bg-navy-charcoal border border-slate-200 dark:border-premium-gold/15 shadow-xl flex flex-col max-h-[95vh] sm:max-h-[92vh]">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white dark:bg-navy-charcoal">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {editing ? "Edit Holiday" : "Create Holiday"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure holiday dates and affected roles
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <fieldset className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/5">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Basic Information</legend>
              
              <label className="block">
                <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title <span className="text-red-500 ml-1">*</span>
                </span>
                <input
                  className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm ${
                    errors.title
                      ? "border-red-400 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-500/20"
                      : "border-slate-300 dark:border-white/10 focus:border-studprimary dark:focus:border-premium-gold focus:ring-1 focus:ring-studprimary/20 dark:focus:ring-premium-gold/20"
                  }`}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter holiday name"
                />
                {errors.title && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.title}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Description</span>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm resize-none transition-colors"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional holiday description"
                />
              </label>
            </fieldset>

            {/* Type & Status Section */}
            <fieldset className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/5">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Type & Status</legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Holiday Type <span className="text-red-500 ml-1">*</span>
                  </span>
                  <select
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm ${
                      errors.holiday_type
                        ? "border-red-400 dark:border-red-400"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                    value={form.holiday_type}
                    onChange={(e) => setForm((prev) => ({ ...prev, holiday_type: e.target.value }))}
                  >
                    {HOLIDAY_TYPE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  {errors.holiday_type && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.holiday_type}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Status</span>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm transition-colors"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            {/* Dates Section */}
            <fieldset className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/5">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Dates</legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="date"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm ${
                      errors.date
                        ? "border-red-400 dark:border-red-400"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                  {errors.date && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.date}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">End Date (Optional)</span>
                  <input
                    type="date"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm ${
                      errors.endDate
                        ? "border-red-400 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-500/20"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                    value={form.endDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                  {errors.endDate && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.endDate}</p>}
                </label>
              </div>
            </fieldset>

            {/* Affected Roles Section */}
            <fieldset className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/5">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Affected Roles <span className="text-red-500">*</span>
              </legend>
              <div className={`flex flex-wrap gap-2 p-3 rounded-xl border transition-colors ${
                errors.affects_roles
                  ? "border-red-400 dark:border-red-400 bg-red-50 dark:bg-red-500/10"
                  : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
              }`}>
                {ROLE_OPTIONS.map((role) => {
                  const active = form.affects_roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize ${
                        active
                          ? "bg-studprimary text-white border-studprimary dark:bg-premium-gold dark:border-premium-gold dark:text-deep-charcoal"
                          : "border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
              {errors.affects_roles && <p className="text-xs text-red-500 font-medium">{errors.affects_roles}</p>}
            </fieldset>

            {/* Settings Section */}
            <fieldset className="space-y-4 pb-6">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Settings</legend>
              
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Color</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="h-10 w-16 rounded-lg border border-slate-300 dark:border-white/10 cursor-pointer"
                    value={form.color}
                    onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{form.color}</span>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Tags</span>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm transition-colors placeholder-slate-500 dark:placeholder-slate-400"
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="festival, exam-break, campus (comma-separated)"
                />
              </label>
            </fieldset>
          </div>
        </form>

        <div className="sticky bottom-0 flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-deep-charcoal/40 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            disabled={saving || !isFormValid}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal text-sm font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? "Saving..." : editing ? "Update Holiday" : "Create Holiday"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminHolidaysManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await holidayApi.getAllHolidays({ limit: 100 });
      setHolidays(res?.data?.data || []);
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to load holidays", 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const filteredHolidays = useMemo(() => {
    const term = search.trim().toLowerCase();
    return holidays.filter((holiday) => {
      const matchesSearch = !term ||
        [holiday.title, holiday.description, holiday.holiday_type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesType = typeFilter === "all" || (holiday.holiday_type || "public") === typeFilter;
      const matchesStatus = statusFilter === "all" || (holiday.status || "active") === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [holidays, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = holidays.filter((holiday) => holiday.status === "active").length;
    const draft = holidays.filter((holiday) => holiday.status === "draft").length;
    const upcoming = holidays.filter((holiday) => {
      const date = new Date(holiday.date);
      return !Number.isNaN(date.getTime()) && date >= new Date(new Date().setHours(0, 0, 0, 0));
    }).length;

    return { total: holidays.length, active, draft, upcoming };
  }, [holidays]);

  const resetForm = () => {
    setEditing(null);
    setForm(initialForm);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (holiday) => {
    setEditing(holiday);
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
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

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

      if (editing?._id) {
        await holidayApi.updateHoliday(editing._id, payload);
        SuccessToster("Holiday updated", 2500);
      } else {
        await holidayApi.createHoliday(payload);
        SuccessToster("Holiday created", 2500);
      }

      setShowForm(false);
      resetForm();
      fetchHolidays();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to save holiday", 3000);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await holidayApi.deleteHoliday(id);
      SuccessToster("Holiday deleted", 2500);
      fetchHolidays();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to delete holiday", 3000);
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-0">
      <div className="space-y-6 px-4 py-4 sm:px-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 md:p-6 shadow-sm">
          <div className="pointer-events-none absolute -top-20 -right-14 h-44 w-44 rounded-full bg-lavender-light dark:bg-premium-gold/10 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-studprimary dark:text-premium-gold" />
                Holiday Governance
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Holidays Management
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Configure holidays and role visibility so class schedules and planning stay aligned across the platform.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal font-semibold shadow-sm hover:brightness-110"
              >
                <Plus className="h-4 w-4" /> Add Holiday
              </button>
            </div>

            <div className="lg:col-span-4">
              <article className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 h-44">
                <img src={holidayVisual} alt="Holiday planning board" className="h-full w-full object-cover" />
              </article>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: CalendarDays },
            { label: "Upcoming", value: stats.upcoming, icon: Sparkles },
            { label: "Active", value: stats.active, icon: ShieldCheck },
            { label: "Draft", value: stats.draft, icon: Sparkles },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.label} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  <IconComponent className="h-4 w-4 text-studprimary dark:text-premium-gold" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 md:p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description, holiday type"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal text-slate-900 dark:text-white"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal text-slate-900 dark:text-white"
              >
                {TYPE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal text-slate-900 dark:text-white"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-navy-charcoal rounded-[24px] border border-slate-200 dark:border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">Loading holidays...</div>
          ) : filteredHolidays.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">No holidays found for the selected filters.</div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredHolidays.map((holiday) => (
                <div key={holiday._id} className="p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300">
                        {holiday.holiday_type || "public"}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300">
                        {(holiday.affects_roles || ["all"]).join(", ")}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300">
                        {holiday.status || "active"}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{holiday.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{holiday.description || "No description"}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(holiday.date)}
                      </span>
                      {holiday.endDate && holiday.endDate !== holiday.date ? (
                        <span>Ends {formatDate(holiday.endDate)}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(holiday)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(holiday._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showForm ? (
        <HolidayModal
          form={form}
          setForm={setForm}
          editing={editing}
          onClose={() => setShowForm(false)}
          onSubmit={onSubmit}
          saving={saving}
        />
      ) : null}
    </AdminLayout>
  );
};

export default AdminHolidaysManagement;

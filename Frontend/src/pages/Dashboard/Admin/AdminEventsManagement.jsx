import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import { eventApi } from "../../../api/eventApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import teamworkImg from "../../../assets/imgs/signup-community.jpg";

const EVENT_TYPE_OPTIONS = [
  { value: "meeting", label: "Meeting" },
  { value: "workshop", label: "Workshop" },
  { value: "deadline", label: "Deadline" },
  { value: "celebration", label: "Celebration" },
  { value: "holiday", label: "Holiday" },
  { value: "other", label: "Other" },
];

const TARGET_ROLE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "student", label: "Students" },
  { value: "teacher", label: "Teachers" },
  { value: "admin", label: "Admins" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const EVENT_FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  ...EVENT_TYPE_OPTIONS,
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...STATUS_OPTIONS,
];

const initialForm = {
  title: "",
  description: "",
  event_type: "meeting",
  start_date: "",
  end_date: "",
  location: "",
  target_role: "all",
  status: "published",
  color: "#3B82F6",
  requires_registration: false,
  max_participants: "",
  tags: "",
};

const toLocalDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const formatDateTime = (value) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const validateEventForm = (form) => {
  const errors = {};
  if (!form.title?.trim()) errors.title = "Title is required";
  if (!form.description?.trim()) errors.description = "Description is required";
  if (!form.event_type?.trim()) errors.event_type = "Event type is required";
  if (!form.start_date) errors.start_date = "Start date is required";
  if (!form.end_date) errors.end_date = "End date is required";
  if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
    errors.end_date = "End date must be after start date";
  }
  if (form.max_participants && isNaN(Number(form.max_participants))) {
    errors.max_participants = "Must be a valid number";
  }
  if (form.max_participants && Number(form.max_participants) < 1) {
    errors.max_participants = "Must be at least 1";
  }
  return errors;
};

const EventModal = ({ form, setForm, editing, onClose, onSubmit, saving }) => {
  const errors = React.useMemo(() => validateEventForm(form), [form]);
  const isFormValid = Object.keys(errors).length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl lg:max-w-4xl rounded-[24px] bg-white dark:bg-navy-charcoal border border-slate-200 dark:border-premium-gold/15 shadow-xl flex flex-col max-h-[95vh] sm:max-h-[92vh]">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white dark:bg-navy-charcoal">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {editing ? "Edit Event" : "Create Event"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Full event details for dashboard visibility
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
                  placeholder="Enter event title"
                />
                {errors.title && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.title}</p>}
              </label>

              <label className="block">
                <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description <span className="text-red-500 ml-1">*</span>
                </span>
                <textarea
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm resize-none ${
                    errors.description
                      ? "border-red-400 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-500/20"
                      : "border-slate-300 dark:border-white/10 focus:border-studprimary dark:focus:border-premium-gold focus:ring-1 focus:ring-studprimary/20 dark:focus:ring-premium-gold/20"
                  }`}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the event purpose and details"
                />
                {errors.description && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.description}</p>}
              </label>
            </fieldset>

            {/* Type & Target Section */}
            <fieldset className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/5">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Type & Target</legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Event Type <span className="text-red-500 ml-1">*</span>
                  </span>
                  <select
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm ${
                      errors.event_type
                        ? "border-red-400 dark:border-red-400"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                    value={form.event_type}
                    onChange={(e) => setForm((prev) => ({ ...prev, event_type: e.target.value }))}
                  >
                    {EVENT_TYPE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  {errors.event_type && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.event_type}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Target Role</span>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm transition-colors"
                    value={form.target_role}
                    onChange={(e) => setForm((prev) => ({ ...prev, target_role: e.target.value }))}
                  >
                    {TARGET_ROLE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            {/* Date & Time Section */}
            <fieldset className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/5">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Date & Time</legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm ${
                      errors.start_date
                        ? "border-red-400 dark:border-red-400"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                    value={form.start_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                  />
                  {errors.start_date && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.start_date}</p>}
                </label>

                <label className="block">
                  <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date <span className="text-red-500 ml-1">*</span>
                  </span>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm ${
                      errors.end_date
                        ? "border-red-400 dark:border-red-400 ring-1 ring-red-200 dark:ring-red-500/20"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                    value={form.end_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                  />
                  {errors.end_date && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.end_date}</p>}
                </label>
              </div>
            </fieldset>

            {/* Location & Details Section */}
            <fieldset className="space-y-4 pb-6 border-b border-slate-200 dark:border-white/5">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Location & Details</legend>
              
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Location</span>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm transition-colors placeholder-slate-500 dark:placeholder-slate-400"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Physical or virtual location"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Max Participants</span>
                  <input
                    type="number"
                    min="1"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm ${
                      errors.max_participants
                        ? "border-red-400 dark:border-red-400"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                    value={form.max_participants}
                    onChange={(e) => setForm((prev) => ({ ...prev, max_participants: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                  />
                  {errors.max_participants && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.max_participants}</p>}
                </label>
              </div>
            </fieldset>

            {/* Status & Settings Section */}
            <fieldset className="space-y-4 pb-6">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Status & Settings</legend>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <label className="block pt-4 sm:pt-0">
                  <div className="flex items-center h-10 gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      id="requires_reg"
                      checked={form.requires_registration}
                      onChange={(e) => setForm((prev) => ({ ...prev, requires_registration: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-studprimary dark:border-white/10 dark:accent-premium-gold"
                    />
                    <label htmlFor="requires_reg" className="font-medium cursor-pointer">Require registration</label>
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Tags</span>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm transition-colors placeholder-slate-500 dark:placeholder-slate-400"
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="exam, campus, live (comma-separated)"
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
            {saving ? "Saving..." : editing ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminEventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getAllEvents({ limit: 100 });
      setEvents(res?.data?.data || []);
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to load events", 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesSearch = !term ||
        [event.title, event.description, event.location, event.event_type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesType = typeFilter === "all" || (event.event_type || "other") === typeFilter;
      const matchesStatus = statusFilter === "all" || (event.status || "draft") === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const published = events.filter((event) => event.status === "published").length;
    const draft = events.filter((event) => event.status === "draft").length;
    const upcoming = events.filter((event) => {
      const start = new Date(event.start_date || event.eventDate);
      return !Number.isNaN(start.getTime()) && start >= new Date();
    }).length;

    return { total: events.length, published, draft, upcoming };
  }, [events]);

  const resetForm = () => {
    setEditing(null);
    setForm(initialForm);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      title: event.title || "",
      description: event.description || "",
      event_type: event.event_type || "meeting",
      start_date: toLocalDateTime(event.start_date || event.eventDate),
      end_date: toLocalDateTime(event.end_date || event.eventDate),
      location: event.location || "",
      target_role: event.target_role || "all",
      status: event.status || "published",
      color: event.color || "#3B82F6",
      requires_registration: Boolean(event.requires_registration ?? event.registrationRequired),
      max_participants: event.max_participants ?? event.maxParticipants ?? "",
      tags: Array.isArray(event.tags) ? event.tags.join(", ") : "",
    });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
      ErrorToster("End date must be after start date", 2500);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        tags: form.tags
          ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
      };

      if (editing?._id) {
        await eventApi.updateEvent(editing._id, payload);
        SuccessToster("Event updated", 2500);
      } else {
        await eventApi.createEvent(payload);
        SuccessToster("Event created", 2500);
      }

      setShowForm(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to save event", 3000);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await eventApi.deleteEvent(id);
      SuccessToster("Event deleted", 2500);
      fetchEvents();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to delete event", 3000);
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
                <Sparkles className="h-3.5 w-3.5 text-studprimary dark:text-premium-gold" />
                Events Workflow Hub
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Events Management
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Create, schedule, and publish events with clear visibility for students, teachers, and admins.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal font-semibold shadow-sm hover:brightness-110"
              >
                <Plus className="h-4 w-4" /> Add Event
              </button>
            </div>

            <div className="lg:col-span-4">
              <article className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 h-44">
                <img src={teamworkImg} alt="Team event planning" className="h-full w-full object-cover" />
              </article>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: CalendarDays },
            { label: "Upcoming", value: stats.upcoming, icon: Clock3 },
            { label: "Published", value: stats.published, icon: Sparkles },
            { label: "Draft", value: stats.draft, icon: Users },
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
                placeholder="Search by title, description, location"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal text-slate-900 dark:text-white"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal text-slate-900 dark:text-white"
              >
                {EVENT_FILTER_OPTIONS.map((option) => (
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
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">No events found for the selected filters.</div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredEvents.map((event) => (
                <div key={event._id} className="p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-studprimary/10 text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold">
                        {event.event_type || "other"}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300">
                        {event.target_role || "all"}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300">
                        {event.status || "draft"}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{event.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{event.description || "No description"}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDateTime(event.start_date || event.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location || "No location"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(event)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(event._id)}
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
        <EventModal
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

export default AdminEventsManagement;

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  UserPlus,
  Settings,
  BarChart3,
  Building,
  GraduationCap,
  MessageSquare,
  CalendarDays,
  CalendarX2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Bell,
} from "lucide-react";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";
import { courseApi } from "../../../api/courseApi";
import { eventApi } from "../../../api/eventApi";
import { holidayApi } from "../../../api/holidayApi";
import signupCommunityImg from "../../../assets/imgs/signup-community.jpg";
import { motion } from "framer-motion";

const extractCollection = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatDate = (value) => {
  if (!value) return "Date TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateRange = (startVal, endVal) => {
  const startStr = formatDate(startVal);
  if (!endVal) return startStr;
  const endStr = formatDate(endVal);
  return (startStr === endStr || endStr === "Date TBD") ? startStr : `${startStr} - ${endStr}`;
};

function AdminDashboard() {
  const breadcrumbItems = getBreadcrumbs("DASHBOARD");

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const loadDashboardMeta = async () => {
      setLoading(true);
      try {
        const [coursesRes, eventsRes, holidaysRes] = await Promise.allSettled([
          courseApi.getAllCourses(),
          eventApi.getUpcomingEvents({ limit: 5, days: 365 }),
          holidayApi.getUpcomingHolidays({ limit: 5, days: 365 }),
        ]);

        setCourses(
          coursesRes.status === "fulfilled"
            ? extractCollection(coursesRes.value)
            : [],
        );
        setEvents(
          eventsRes.status === "fulfilled"
            ? extractCollection(eventsRes.value)
            : [],
        );
        setHolidays(
          holidaysRes.status === "fulfilled"
            ? extractCollection(holidaysRes.value)
            : [],
        );
      } catch (error) {
        setCourses([]);
        setEvents([]);
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardMeta();
  }, []);

  const quickActions = useMemo(
    () => [
      {
        id: "manage-users",
        title: "Manage Users",
        description: "View and manage all users in your organization",
        icon: Users,
        link: "/admin/users",
      },
      {
        id: "add-user",
        title: "Create User",
        description: "Create new student or teacher accounts",
        icon: UserPlus,
        link: "/admin/users/create",
      },
      {
        id: "manage-courses",
        title: "Manage Courses",
        description: "View and manage all courses",
        icon: BookOpen,
        link: "/managecourses",
      },
      {
        id: "add-course",
        title: "Create Course",
        description: "Create new courses for your organization",
        icon: GraduationCap,
        link: "/admin/courses/create",
      },
    ],
    [],
  );

  const supportActions = useMemo(
    () => [
      {
        id: "chat",
        title: "Messages",
        subtitle: "Chat with users",
        icon: MessageSquare,
        link: "/admin/chat",
      },
      {
        id: "settings",
        title: "Settings",
        subtitle: "Configure options",
        icon: Settings,
        link: "/settings",
      },
    ],

    [],
  );

  const nextEventDate = useMemo(() => {
    if (!events.length) return "No event scheduled";
    return formatDate(events[0]?.startDate || events[0]?.eventDate);
  }, [events]);

  const nextHolidayDate = useMemo(() => {
    if (!holidays.length) return "No holiday scheduled";
    return formatDate(holidays[0]?.date || holidays[0]?.startDate || holidays[0]?.holidayDate);
  }, [holidays]);

  const kpis = useMemo(
    () => [
      {
        id: "courses",
        label: "Total Courses",
        value: courses.length,
        hint: "Learning catalog",
        icon: BookOpen,
      },
      {
        id: "events",
        label: "Upcoming Events",
        value: events.length,
        hint: nextEventDate,
        icon: CalendarDays,
      },
      {
        id: "holidays",
        label: "Upcoming Holidays",
        value: holidays.length,
        hint: nextHolidayDate,
        icon: CalendarX2,
      },
      {
        id: "actions",
        label: "Operational Actions",
        value: quickActions.length + supportActions.length,
        hint: "Admin shortcuts",
        icon: Sparkles,
      },
    ],
    [courses.length, events.length, holidays.length, nextEventDate, nextHolidayDate, quickActions.length, supportActions.length],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <AdminLayout
      showSearch={false}
      className="p-0"
      breadcrumbItems={breadcrumbItems}
    >
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 px-4 py-4 sm:px-6 lg:px-6"
      >
        <motion.section 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-6 md:p-7 shadow-sm"
        >
          <div className="pointer-events-none absolute -top-24 -right-16 h-52 w-52 rounded-full bg-lavender-light dark:bg-premium-gold/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-studprimary dark:text-premium-gold" />
                Admin Control Center
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Welcome back, Admin
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                Monitor operations, manage users and courses, and stay ahead of upcoming events from one unified dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all hover:border-studprimary/30 dark:hover:border-premium-gold/30 hover:text-studprimary dark:hover:text-premium-gold"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-studprimary dark:bg-premium-gold px-4 py-2.5 text-sm font-semibold text-white dark:text-deep-charcoal transition-all hover:brightness-110"
              >
                Home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.article
                key={item.id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lavender-light text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Live
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : item.value}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {loading ? "Syncing data..." : item.hint}
                </p>
              </motion.article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <motion.div 
            variants={itemVariants}
            className="xl:col-span-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Primary Actions
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Fast access to high-frequency administrative tasks.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-studprimary dark:text-premium-gold" />
                {quickActions.length} actions
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={action.id}
                    to={action.link}
                    className="group rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-4 transition-all hover:-translate-y-0.5 hover:border-studprimary/30 dark:hover:border-premium-gold/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-light text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold transition-colors group-hover:bg-studprimary/10 dark:group-hover:bg-premium-gold/15">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {action.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-studprimary dark:text-premium-gold">
                      Open
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <motion.aside 
            variants={itemVariants}
            className="xl:col-span-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Operations Pulse
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Snapshot of what needs attention this week.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Upcoming Event
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {events[0]?.title || "No scheduled event"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {nextEventDate}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Upcoming Holiday
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {holidays[0]?.title || "No scheduled holiday"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {nextHolidayDate}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Platform Note
                </p>
                <div className="mt-1 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Bell className="mt-0.5 h-4 w-4 text-studprimary dark:text-premium-gold" />
                  Review holiday and event timelines weekly to reduce schedule conflicts.
                </div>
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <motion.div 
            variants={itemVariants}
            className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upcoming Events
              </h2>
              <Link
                to="/admin/events"
                className="text-xs font-semibold text-studprimary dark:text-premium-gold hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  No upcoming events are scheduled.
                </p>
              ) : (
                events.slice(0, 4).map((event) => (
                  <div
                    key={event._id || event.id || event.title}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 px-3 py-3"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {event.title || "Untitled Event"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateRange(event.startDate || event.start_date || event.eventDate, event.endDate || event.end_date)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upcoming Holidays
              </h2>
              <Link
                to="/admin/holidays"
                className="text-xs font-semibold text-studprimary dark:text-premium-gold hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {holidays.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  No upcoming holidays are scheduled.
                </p>
              ) : (
                holidays.slice(0, 4).map((holiday) => (
                  <div
                    key={holiday._id || holiday.id || holiday.title}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 px-3 py-3"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {holiday.title || "Untitled Holiday"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateRange(holiday.date || holiday.startDate || holiday.start_date || holiday.holidayDate, holiday.endDate || holiday.end_date)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </section>

        <motion.section 
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Operational Shortcuts
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                High-priority tools for daily admin workflows.
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Admin Toolkit
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <article className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 h-full min-h-[250px]">
                <img
                  src={signupCommunityImg}
                  alt="Admin collaboration workspace"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    Team Operations
                  </p>
                  <h3 className="mt-1 text-lg font-bold">Build Better Admin Flow</h3>
                  <p className="mt-1 text-sm text-white/85 leading-relaxed">
                    Keep user support and platform settings aligned with a streamlined operational hub.
                  </p>
                </div>
              </article>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {supportActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <Link
                      key={action.id}
                      to={action.link}
                      className="group flex h-full items-start gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-4 transition-all hover:border-studprimary/30 dark:hover:border-premium-gold/30 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lavender-light text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold">
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {action.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {action.subtitle}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="rounded-xl border border-studprimary/20 dark:border-premium-gold/25 bg-lavender-light/60 dark:bg-premium-gold/10 px-4 py-3.5">
                <div className="flex items-start gap-2.5">
                  <BarChart3 className="mt-0.5 h-5 w-5 text-studprimary dark:text-premium-gold" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Admin Insight
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      This dashboard combines live course, event, and holiday summaries to help you make faster operational decisions with better visibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-light text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Organization Admin Scope
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Manage users, courses, events, holidays, and platform operations in one place. The dashboard layout is optimized for daily admin workflows, quick actions, and upcoming schedule visibility.
              </p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AdminLayout>
  );
}

export default AdminDashboard;

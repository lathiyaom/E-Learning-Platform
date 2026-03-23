import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { eventApi } from "../../../api/eventApi";
import { holidayApi } from "../../../api/holidayApi";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import { gsap } from "gsap";
import teacherHeroImage from "../../../assets/imgs/teacher-dashboard-hero.jpg";

const formatDateRange = (startVal, endVal) => {
  if (!startVal) return "Date TBD";
  const startStr = new Date(startVal).toLocaleDateString();
  if (!endVal) return startStr;
  const endStr = new Date(endVal).toLocaleDateString();
  return (startStr === endStr || endStr === "Invalid Date") ? startStr : `${startStr} - ${endStr}`;
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

const normalizeDate = (record) =>
  record?.start_date ||
  record?.eventDate ||
  record?.startDate ||
  record?.date ||
  record?.holidayDate ||
  null;

const TeacherDashboard = () => {
  const containerRef = useRef(null);
  const { user } = useSelector((state) => state.auth || {});
  const {
    data: coursesData,
    isLoading: coursesLoading,
    isFetching: coursesFetching,
  } = useGetAllCoursesQuery();

  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  const teacherId = String(user?._id || user?.id || "");

  useEffect(() => {
    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError("");

      try {
        const [eventRes, holidayRes] = await Promise.allSettled([
          eventApi.getUpcomingEvents({ limit: 5 }),
          holidayApi.getUpcomingHolidays({ limit: 5 }),
        ]);

        setEvents(eventRes.status === "fulfilled" ? eventRes.value?.data?.data || [] : []);
        setHolidays(holidayRes.status === "fulfilled" ? holidayRes.value?.data?.data || [] : []);

        if (eventRes.status === "rejected" || holidayRes.status === "rejected") {
          setMetaError("Some dashboard widgets are temporarily unavailable.");
        }
      } catch (error) {
        setEvents([]);
        setHolidays([]);
        setMetaError("Failed to load dashboard metadata.");
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, []);

  const courses = coursesData?.data || [];

  const myCourses = useMemo(
    () =>
      courses.filter((course) => {
        const createdById = String(course?.createdBy?._id || course?.createdBy || "");
        const teacherOwnerId = String(course?.teacher_id?._id || course?.teacher_id || "");
        return createdById === teacherId || teacherOwnerId === teacherId;
      }),
    [courses, teacherId]
  );

  const totalStudents = useMemo(
    () =>
      myCourses.reduce(
        (sum, c) => sum + Number(c.totalStudents || c.studentCount || c.enrollmentCount || 0),
        0
      ),
    [myCourses]
  );

  const avgRating = useMemo(() => {
    const ratings = myCourses
      .map((c) => Number(c.rating || 0))
      .filter((value) => value > 0);

    return ratings.length > 0
      ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)
      : "0.0";
  }, [myCourses]);

  const statCards = useMemo(
    () => [
      {
        id: "my-courses",
        label: "My Courses",
        value: myCourses.length,
        hint: "Active teaching catalog",
        icon: BookOpen,
      },
      {
        id: "total-students",
        label: "Total Students",
        value: totalStudents,
        hint: "Across all my courses",
        icon: Users,
      },
      {
        id: "avg-rating",
        label: "Average Rating",
        value: avgRating,
        hint: "Student course feedback",
        icon: Star,
      },
      {
        id: "upcoming-items",
        label: "Upcoming Items",
        value: events.length + holidays.length,
        hint: "Events and holidays",
        icon: CalendarDays,
      },
    ],
    [myCourses.length, totalStudents, avgRating, events.length, holidays.length]
  );

  const activityFeed = useMemo(() => {
    const courseActivity = myCourses.slice(0, 3).map((course, index) => ({
      id: `course-${course._id || index}`,
      title: course.title || "Course updated",
      subtitle: `${course.category || "General"} · ${course.level || "Level not set"}`,
      time: formatDate(course.updatedAt || course.createdAt),
      type: "course",
    }));

    const eventActivity = events.slice(0, 2).map((event, index) => ({
      id: `event-${event._id || index}`,
      title: event.title || "Upcoming event",
      subtitle: (event.event_type || event.type || "event").toUpperCase(),
      time: formatDate(normalizeDate(event)),
      type: "event",
    }));

    const holidayActivity = holidays.slice(0, 2).map((holiday, index) => ({
      id: `holiday-${holiday._id || index}`,
      title: holiday.title || holiday.name || "Upcoming holiday",
      subtitle: (holiday.holiday_type || "holiday").toUpperCase(),
      time: formatDate(normalizeDate(holiday)),
      type: "holiday",
    }));

    return [...eventActivity, ...holidayActivity, ...courseActivity].slice(0, 7);
  }, [myCourses, events, holidays]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-animate='teacher-hero']", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from("[data-animate='teacher-stat']", {
        y: 18,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.1,
      });

      gsap.from("[data-animate='teacher-section']", {
        y: 16,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.16,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [myCourses.length, events.length, holidays.length]);

  return (
    <AdminLayout showSearch={false} className="p-0">
      <div ref={containerRef} className="space-y-6 px-4 py-4 sm:px-6 lg:px-6">
        <section
          data-animate="teacher-hero"
          className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-premium-gold/20 bg-gradient-to-br from-navy-charcoal via-background-dark to-deep-charcoal p-6 md:p-7 shadow-sm"
        >
          <div className="pointer-events-none absolute -top-24 -right-16 h-52 w-52 rounded-full bg-premium-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-studprimary/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-premium-gold/30 bg-premium-gold/10 px-3 py-1 text-xs font-semibold text-premium-gold">
                <GraduationCap className="h-3.5 w-3.5 text-studprimary dark:text-premium-gold" />
                Teacher Command Center
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Welcome back, {user?.firstName || "Teacher"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">
                Track your teaching progress, monitor your courses, and stay on top of upcoming events and holidays.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-studprimary dark:bg-premium-gold px-4 py-2.5 text-sm font-semibold text-white dark:text-deep-charcoal transition-all hover:brightness-110">
                  View Schedule
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-all hover:border-premium-gold/50 hover:text-premium-gold">
                  Class Analytics
                </button>
              </div>
            </div>

            <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-premium-gold/25 shadow-[0_10px_30px_rgba(176,141,87,0.2)] lg:w-72">
              <img
                src={teacherHeroImage}
                alt="Teacher dashboard hero"
                className="h-44 w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {metaError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            {metaError}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const IconComponent = item.icon;

            return (
              <Card
                key={item.id}
                data-animate="teacher-stat"
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lavender-light text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge className="border border-card-border bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-[10px] uppercase tracking-wider">
                      Live
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {coursesLoading || coursesFetching || metaLoading ? "..." : item.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.hint}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section
          data-animate="teacher-section"
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Courses</h2>
            <Badge className="border border-card-border bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold hover:bg-lavender-light dark:hover:bg-premium-gold/20">
              {myCourses.length} Active
            </Badge>
          </div>

          {myCourses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No courses assigned or created yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {myCourses.map((course) => (
                <article
                  key={course._id}
                  className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img
                    src={course.image || teacherHeroImage}
                    alt={course.title}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.category || "General"}</p>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{course.level || "Level N/A"}</span>
                      <span>{Number(course.totalStudents || course.studentCount || course.enrollmentCount || 0)} students</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3" data-animate="teacher-section">
          <Card className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Teaching Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              {activityFeed.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No activity available.</p>
              ) : (
                activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 hover:bg-lavender-light/50 dark:hover:bg-premium-gold/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Academic Calendar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              {[...events, ...holidays].slice(0, 6).length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming items.</p>
              ) : (
                [...events, ...holidays]
                  .slice(0, 6)
                  .map((item) => {
                    const dateValue = normalizeDate(item);
                    const isEvent = Boolean(item.event_type || item.eventType || item.type);
                    return (
                      <div
                        key={item._id}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 hover:bg-lavender-light/40 dark:hover:bg-premium-gold/10 transition-colors"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white">{item.title || item.name || "Calendar item"}</p>
                          <Badge className="border border-card-border bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold hover:bg-lavender-light dark:hover:bg-premium-gold/20">
                            {isEvent ? "Event" : "Holiday"}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateRange(
                            item.start_date || item.eventDate || item.startDate || item.date,
                            item.end_date || item.endDate
                          )}
                        </p>

                        {dateValue && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {formatDate(dateValue)}
                          </p>
                        )}
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
};

export default TeacherDashboard;

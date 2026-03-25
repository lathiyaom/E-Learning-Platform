import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { enrollmentApi } from "../../../redux/Apis/enrollmentApi";
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
import { Button } from './../../../components/Button';

const CARD_SHELL_CLASS =
  "rounded-2xl border border-studprimary/15 dark:border-white/10 bg-background-light dark:bg-transparent dark:dark-glass shadow-sm hover:shadow-md hover:border-studprimary/25 transition-all duration-300";

const SOFT_ITEM_CLASS =
  "rounded-xl border border-studprimary/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-lavender-light/40 dark:hover:bg-premium-gold/10 transition-colors duration-200";

const LIVE_BADGE_CLASS =
  "border border-studprimary/30 bg-lavender-light dark:bg-premium-gold/10 text-premium-gold/90 dark:text-premium-gold text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 hover:bg-lavender-light/40 dark:hover:bg-premium-gold/10 transition-colors duration-200";

const FILTER_BUTTON_CLASS =
  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border";

const toValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateRange = (startVal, endVal) => {
  const startDate = toValidDate(startVal);
  if (!startDate) return "Date TBD";
  const startStr = startDate.toLocaleDateString();
  if (!endVal) return startStr;
  const endDate = toValidDate(endVal);
  if (!endDate) return startStr;
  const endStr = endDate.toLocaleDateString();
  return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
};

const formatDate = (value) => {
  const date = toValidDate(value);
  if (!date) return "Date TBD";
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

const extractCollection = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload)) return payload;
  return [];
};

const getItemKey = (item, prefix, index) =>
  String(item?._id || item?.id || `${prefix}-${item?.title || item?.name || index}`);

const SectionTitle = ({ title, subtitle, rightNode }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {rightNode}
  </div>
);

const EmptyState = ({ text }) => (
  <p className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
    {text}
  </p>
);

const StatCard = ({ item, loading }) => {
  const IconComponent = item.icon;

  return (
    <Card className={CARD_SHELL_CLASS}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-lavender-light to-lavender dark:from-premium-gold/15 dark:to-premium-gold/10 text-studprimary dark:text-premium-gold shadow-sm">
            <IconComponent className="h-5 w-5" />
          </div>
          <Badge className={LIVE_BADGE_CLASS}>Live</Badge>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-studprimary dark:text-premium-gold">{item.label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          {loading ? "..." : item.value}
        </p>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{item.hint}</p>
      </CardContent>
    </Card>
  );
};

const CourseCard = ({ course }) => (
  <article className="overflow-hidden rounded-2xl border border-studprimary/10 bg-white dark:bg-white/5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-studprimary/20 dark:hover:border-premium-gold/30">
    <img
      src={course.image || teacherHeroImage}
      alt={course.title || "Course"}
      className="h-40 w-full object-cover"
      loading="lazy"
    />
    <div className="p-5">
      <h3 className="line-clamp-1 font-bold text-slate-900 dark:text-white text-base">{course.title || "Untitled Course"}</h3>
      <p className="mt-1.5 text-sm text-studprimary dark:text-premium-gold font-medium">{course.category || "General"}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-lavender-light/60 dark:bg-premium-gold/10 px-2 py-1 rounded-md">
          {course.level || "Level N/A"}
        </span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-background-light dark:bg-white/5 px-2 py-1 rounded-md border border-studprimary/10">
          {Number(course.totalStudents || course.studentCount || course.enrollmentCount || 0)} students
        </span>
      </div>
    </div>
  </article>
);

const ActivityCard = ({ item }) => (
  <div className={`${SOFT_ITEM_CLASS} p-4 border border-studprimary/10 dark:border-white/10`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</p>
        <p className="mt-1.5 text-xs text-studprimary dark:text-premium-gold font-medium">{item.subtitle}</p>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-studprimary dark:text-premium-gold bg-lavender-light/60 dark:bg-premium-gold/15 px-2 py-1 rounded-md whitespace-nowrap">
        {item.time}
      </span>
    </div>
  </div>
);

const CalendarCard = ({ item }) => {
  const isEvent = item.kind === "event";
  const dateValue = normalizeDate(item.record);

  return (
    <div className={`${SOFT_ITEM_CLASS} p-4 border border-studprimary/10 dark:border-white/10`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white text-sm">
          {item.record.title || item.record.name || "Calendar item"}
        </p>
        <Badge className="bg-studprimary/15 dark:bg-premium-gold/20 text-studprimary dark:text-premium-gold text-[8px] font-bold uppercase tracking-wider px-2 py-1 border-0">
          {isEvent ? "Event" : "Holiday"}
        </Badge>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        {formatDateRange(
          item.record.start_date || item.record.eventDate || item.record.startDate || item.record.date,
          item.record.end_date || item.record.endDate
        )}
      </p>

      {dateValue && (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-studprimary dark:text-premium-gold font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {formatDate(dateValue)}
        </p>
      )}
    </div>
  );
};

const OverviewPanel = ({ events, holidays, metaLoading }) => {
  const nextEvent = events[0];
  const nextHoliday = holidays[0];

  return (
    <Card className={`${CARD_SHELL_CLASS} h-full`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Teaching Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        <div className={`${SOFT_ITEM_CLASS} p-4 border border-studprimary/10`}>
          <p className="text-xs font-bold uppercase tracking-wider text-studprimary dark:text-premium-gold">Upcoming Event</p>
          <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
            {metaLoading ? "Loading..." : nextEvent?.title || "No scheduled event"}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            {metaLoading ? "Syncing..." : formatDate(normalizeDate(nextEvent))}
          </p>
        </div>

        <div className={`${SOFT_ITEM_CLASS} p-4 border border-studprimary/10`}>
          <p className="text-xs font-bold uppercase tracking-wider text-studprimary dark:text-premium-gold">Upcoming Holiday</p>
          <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
            {metaLoading ? "Loading..." : nextHoliday?.title || nextHoliday?.name || "No scheduled holiday"}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            {metaLoading ? "Syncing..." : formatDate(normalizeDate(nextHoliday))}
          </p>
        </div>

        <div className="rounded-xl border-2 border-studprimary/25 dark:border-premium-gold/30 bg-gradient-to-br from-lavender-light/80 to-lavender-light/40 dark:from-premium-gold/15 dark:to-premium-gold/5 px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <CalendarDays className="mt-1 h-5 w-5 text-studprimary dark:text-premium-gold flex-shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Planning Tip</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                Align lesson plans with event and holiday windows to keep class momentum consistent.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TeacherDashboard = () => {
  const containerRef = useRef(null);
  const dispatch = useDispatch();
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

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

        setEvents(eventRes.status === "fulfilled" ? extractCollection(eventRes.value) : []);
        setHolidays(holidayRes.status === "fulfilled" ? extractCollection(holidayRes.value) : []);

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

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(myCourses.map((c) => c.category || "General"))];
    return categories.sort();
  }, [myCourses]);

  const uniqueLevels = useMemo(() => {
    const levels = [...new Set(myCourses.map((c) => c.level || "Level N/A"))];
    return levels.sort();
  }, [myCourses]);

  const filteredCourses = useMemo(() => {
    return myCourses.filter((course) => {
      const catMatch = selectedCategory === "all" || course.category === selectedCategory;
      const levelMatch = selectedLevel === "all" || course.level === selectedLevel;
      return catMatch && levelMatch;
    });
  }, [myCourses, selectedCategory, selectedLevel]);

  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    if (myCourses.length === 0) return;
    let mounted = true;

    const fetchAllEnrollments = async () => {
      let total = 0;
      for (const course of myCourses) {
        try {
          const result = await dispatch(
            enrollmentApi.endpoints.getCourseEnrollments.initiate(course._id || course.id)
          ).unwrap();
          
          if (result?.data) {
            total += result.data.length;
          }
        } catch (error) {
          // Ignore
        }
      }
      if (mounted) setTotalStudents(total);
    };

    fetchAllEnrollments();
    return () => { mounted = false; };
  }, [myCourses, dispatch]);

  const avgRating = useMemo(() => {
    const ratings = myCourses
      .map((c) => Number(c.rating || 0))
      .filter((value) => value > 0);

    return ratings.length > 0
      ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)
      : "0.0";
  }, [myCourses]);

  const loadingDashboard = coursesLoading || coursesFetching || metaLoading;

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

  const calendarItems = useMemo(() => {
    const eventItems = events.map((record, index) => ({
      key: getItemKey(record, "event", index),
      kind: "event",
      sortDate: normalizeDate(record),
      record,
    }));

    const holidayItems = holidays.map((record, index) => ({
      key: getItemKey(record, "holiday", index),
      kind: "holiday",
      sortDate: normalizeDate(record),
      record,
    }));

    return [...eventItems, ...holidayItems]
      .sort((a, b) => {
        const aTime = toValidDate(a.sortDate)?.getTime() || Number.POSITIVE_INFINITY;
        const bTime = toValidDate(b.sortDate)?.getTime() || Number.POSITIVE_INFINITY;
        return aTime - bTime;
      })
      .slice(0, 6);
  }, [events, holidays]);

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

  const animatedRef = useRef(false);

  useEffect(() => {
    if (loadingDashboard || animatedRef.current) return;
    animatedRef.current = true;

    const ctx = gsap.context(() => {
      gsap.from("[data-animate='teacher-hero']", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });


      gsap.from("[data-animate='teacher-section']", {
        y: 16,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loadingDashboard]);

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
                <Button className="inline-flex items-center gap-2 rounded-xl bg-studprimary hover:bg-studprimary/90 dark:bg-premium-gold dark:hover:bg-premium-gold/90 px-5 py-2.5 text-sm font-semibold text-white dark:text-deep-charcoal transition-all shadow-md hover:shadow-lg">
                  View Schedule
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" className="inline-flex items-center gap-2 rounded-xl border border-studprimary/30 bg-lavender-light/20 dark:bg-white/10 px-5 py-2.5 text-sm font-semibold text-studprimary dark:text-premium-gold hover:bg-lavender-light/40 dark:hover:bg-white/15 transition-all">
                  Class Analytics
                </Button>
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
          {statCards.map((item) => (
            <StatCard key={item.id} item={item} loading={loadingDashboard} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12" data-animate="teacher-section">
          <Card className={`${CARD_SHELL_CLASS} xl:col-span-8`}>
            <CardHeader className="border-b border-studprimary/10">
              <div className="mb-4">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">My Courses</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Your current teaching catalog with quick visibility into levels and enrollment.</p>
              </div>

              {myCourses.length > 0 && (
                <div className="space-y-3 pt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wide text-studprimary dark:text-premium-gold">Category:</span>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`${FILTER_BUTTON_CLASS} ${
                        selectedCategory === "all"
                          ? "bg-studprimary text-white border-studprimary dark:bg-premium-gold dark:text-deep-charcoal"
                          : "bg-background-light dark:bg-white/5 text-slate-700 dark:text-slate-300 border-studprimary/15"
                      }`}
                    >
                      All ({myCourses.length})
                    </button>
                    {uniqueCategories.map((category) => {
                      const count = myCourses.filter((c) => c.category === category).length;
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`${FILTER_BUTTON_CLASS} ${
                            selectedCategory === category
                              ? "bg-studprimary text-white border-studprimary dark:bg-premium-gold dark:text-deep-charcoal"
                              : "bg-background-light dark:bg-white/5 text-slate-700 dark:text-slate-300 border-studprimary/15"
                          }`}
                        >
                          {category} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wide text-studprimary dark:text-premium-gold">Level:</span>
                    <button
                      onClick={() => setSelectedLevel("all")}
                      className={`${FILTER_BUTTON_CLASS} ${
                        selectedLevel === "all"
                          ? "bg-studprimary text-white border-studprimary dark:bg-premium-gold dark:text-deep-charcoal"
                          : "bg-background-light dark:bg-white/5 text-slate-700 dark:text-slate-300 border-studprimary/15"
                      }`}
                    >
                      All
                    </button>
                    {uniqueLevels.map((level) => {
                      const count = myCourses.filter((c) => c.level === level).length;
                      return (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`${FILTER_BUTTON_CLASS} ${
                            selectedLevel === level
                              ? "bg-studprimary text-white border-studprimary dark:bg-premium-gold dark:text-deep-charcoal"
                              : "bg-background-light dark:bg-white/5 text-slate-700 dark:text-slate-300 border-studprimary/15"
                          }`}
                        >
                          {level} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {myCourses.length === 0 ? (
                <EmptyState text="No courses assigned or created yet." />
              ) : filteredCourses.length === 0 ? (
                <EmptyState text="No courses match the selected filters." />
              ) : (
                <div className="modal-scrollbar overflow-y-auto max-h-[420px] lg:max-h-[480px] pr-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredCourses.map((course, index) => (
                      <CourseCard key={getItemKey(course, "course", index)} course={course} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="xl:col-span-4">
            <OverviewPanel events={events} holidays={holidays} metaLoading={metaLoading} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-animate="teacher-section">
          <Card className={`${CARD_SHELL_CLASS} lg:col-span-7`}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Teaching Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {activityFeed.length === 0 ? (
                <EmptyState text="No activity available." />
              ) : (
                <div className="modal-scrollbar overflow-y-auto max-h-[420px] lg:max-h-[480px] pr-2">
                  <div className="space-y-3">
                    {activityFeed.map((item) => (
                      <ActivityCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`${CARD_SHELL_CLASS} lg:col-span-5`}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Academic Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {calendarItems.length === 0 ? (
                <EmptyState text="No upcoming items." />
              ) : (
                <div className="modal-scrollbar overflow-y-auto max-h-[420px] lg:max-h-[480px] pr-2">
                  <div className="space-y-3">
                    {calendarItems.map((item) => (
                      <CalendarCard key={item.key} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
};

export default TeacherDashboard;

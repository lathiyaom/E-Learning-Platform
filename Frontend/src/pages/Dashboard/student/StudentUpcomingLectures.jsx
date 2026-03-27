import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getUpcomingLectures } from "../../../redux/Apis/lectureApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";
import { CalendarDays } from "lucide-react";

// Shared components (no duplication)
import LectureCard from "./ConductedLectures/LectureCard";

// Upcoming-specific components
import UpcomingPoster from "./UpcomingLectures/UpcomingPoster";
import UpcomingEmpty from "./UpcomingLectures/UpcomingEmpty";
import UpcomingFilters from "./UpcomingLectures/UpcomingFilters";
import UpcomingSkeleton from "./UpcomingLectures/UpcomingSkeleton";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

/** Returns a YYYY-MM-DD string in local time (no UTC shift) */
function toLocalDateStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Friendly day label for a group header */
function dayLabel(dateStr) {
  const today = toLocalDateStr(new Date());
  const tomorrow = toLocalDateStr(new Date(Date.now() + 86400000));

  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";

  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Add N days to today, return YYYY-MM-DD */
function addDays(n) {
  return toLocalDateStr(new Date(Date.now() + n * 86400000));
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

const DEFAULT_FILTERS = { days: "all", course: "all" };

const StudentUpcomingLectures = () => {
  const dispatch = useDispatch();
  const { lectures, loading } = useSelector((state) => state.lecture);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    dispatch(getUpcomingLectures({ days: 7, page: 1, limit: 50 }));
  }, [dispatch]);

  /* ── BUG FIX: exclude today's lectures (API returns today + future) ── */
  const todayStr = toLocalDateStr(new Date());

  const futureOnly = useMemo(() => {
    if (!lectures?.length) return [];
    return lectures.filter((l) => {
      const d = toLocalDateStr(l.lectureDate);
      return d > todayStr; // strictly after today
    });
  }, [lectures, todayStr]);

  /* ── Build unique course list for filter dropdown ── */
  const courses = useMemo(() => {
    const map = new Map();
    futureOnly.forEach((l) => {
      if (l.courseId?._id)
        map.set(l.courseId._id, l.courseId.title || "Untitled");
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [futureOnly]);

  /* ── Apply filters ── */
  const filtered = useMemo(() => {
    let result = [...futureOnly];

    // Day range filter
    if (filters.days !== "all") {
      const cutoff = addDays(Number(filters.days));
      result = result.filter((l) => toLocalDateStr(l.lectureDate) <= cutoff);
    }

    // Course filter
    if (filters.course !== "all") {
      result = result.filter((l) => l.courseId?._id === filters.course);
    }

    return result;
  }, [futureOnly, filters]);

  /* ── Group by date ── */
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((l) => {
      const key = toLocalDateStr(l.lectureDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(l);
    });
    // Sort groups by date ascending
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  /* ── Stats for poster ── */
  const dayCount = grouped.length;
  const courseCount = courses.length;

  return (
    <AdminLayout
      showSearch={false}
      breadcrumbItems={getBreadcrumbs("DASHBOARD")}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <UpcomingPoster
              totalCount={loading ? 0 : filtered.length}
              dayCount={loading ? 0 : dayCount}
              courseCount={loading ? 0 : courseCount}
            />
          </motion.div>

          {/* Filter bar */}
          <AnimatePresence mode="wait">
            {!loading && futureOnly.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <UpcomingFilters
                  courses={courses}
                  filters={filters}
                  onChange={setFilters}
                  onClear={() => setFilters(DEFAULT_FILTERS)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {loading ? (
            <UpcomingSkeleton />
          ) : filtered.length === 0 ? (
            <UpcomingEmpty
              filtered={futureOnly.length > 0 && filtered.length === 0}
            />
          ) : (
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              {grouped.map(([dateStr, dayLectures]) => (
                <motion.section 
                  key={dateStr}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
                  }}
                >
                  {/* Day group header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 border border-studprimary/20 dark:border-premium-gold/20 shadow-sm">
                      <CalendarDays className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                      <span className="text-sm font-bold text-studprimary dark:text-premium-gold uppercase tracking-wider">
                        {dayLabel(dateStr)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">
                      {dayLectures.length}{" "}
                      {dayLectures.length === 1 ? "lecture" : "lectures"}
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  </div>

                  {/* Lecture cards for this day */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                    className="space-y-5"
                  >
                    {dayLectures.map((lecture) => (
                      <motion.div 
                        key={lecture._id}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <LectureCard
                          lecture={lecture}
                          hideAction
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default StudentUpcomingLectures;

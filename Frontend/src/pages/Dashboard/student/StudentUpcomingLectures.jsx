import React, { useEffect, useMemo, useState } from "react";
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
      if (l.courseId?._id) map.set(l.courseId._id, l.courseId.title || "Untitled");
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
    <AdminLayout showSearch={false} breadcrumbItems={getBreadcrumbs("DASHBOARD")}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-6">

        {/* Hero poster */}
        <UpcomingPoster
          totalCount={loading ? 0 : filtered.length}
          dayCount={loading ? 0 : dayCount}
          courseCount={loading ? 0 : courseCount}
        />

        {/* Filter bar */}
        {!loading && futureOnly.length > 0 && (
          <UpcomingFilters
            courses={courses}
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
        )}

        {/* Content */}
        {loading ? (
          <UpcomingSkeleton />
        ) : filtered.length === 0 ? (
          <UpcomingEmpty filtered={futureOnly.length > 0 && filtered.length === 0} />
        ) : (
          <div className="space-y-8">
            {grouped.map(([dateStr, dayLectures]) => (
              <section key={dateStr}>
                {/* Day group header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 border border-studprimary/20 dark:border-premium-gold/20">
                    <CalendarDays className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                    <span className="text-sm font-bold text-studprimary dark:text-premium-gold">
                      {dayLabel(dateStr)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {dayLectures.length} {dayLectures.length === 1 ? "lecture" : "lectures"}
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </div>

                {/* Lecture cards for this day */}
                <div className="space-y-4">
                  {dayLectures.map((lecture) => (
                    <LectureCard key={lecture._id} lecture={lecture} hideAction />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StudentUpcomingLectures;

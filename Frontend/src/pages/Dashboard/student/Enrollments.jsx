import React, { useMemo, useState } from "react";
import { useGetMyEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";
import { Card } from "../../../components/Card";
import { CalendarX, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

import EnrollmentsPoster from "./Enrollments/EnrollmentsPoster";
import EnrollmentsStats from "./Enrollments/EnrollmentsStats";
import EnrollmentsFilters from "./Enrollments/EnrollmentsFilters";
import EnrollmentCard from "./Enrollments/EnrollmentCard";

const PAGE_SIZE = 6;
const DEFAULT_FILTERS = { search: "", status: "all" };

/* ── Skeleton card ── */
function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200 dark:bg-white/10" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
        <div className="h-16 bg-slate-100 dark:bg-white/5 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

const Enrollments = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetMyEnrollmentsQuery();
  const enrollments = data?.data || [];

  /* ── Stats ── */
  const counts = useMemo(
    () => ({
      active: enrollments.filter((e) => e.status === "active").length,
      completed: enrollments.filter((e) => e.status === "completed").length,
      dropped: enrollments.filter((e) => e.status === "dropped").length,
      certificates: enrollments.filter((e) => e.certificate_issued).length,
    }),
    [enrollments],
  );

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let result = enrollments;
    if (filters.status !== "all") {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((e) => {
        const course = e.courseId || e.course_id || {};
        return (
          course.title?.toLowerCase().includes(q) ||
          course.category?.toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [enrollments, filters]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleFilterChange = (f) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <AdminLayout
      showSearch={false}
      breadcrumbItems={getBreadcrumbs("DASHBOARD")}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero */}
        <EnrollmentsPoster total={isLoading ? 0 : enrollments.length} />

        {/* Stats */}
        {!isLoading && <EnrollmentsStats counts={counts} />}

        {/* Filters */}
        <EnrollmentsFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(1);
          }}
        />

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-0 gap-0">
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
                  {filters.search || filters.status !== "all" ? (
                    <BookOpen className="w-12 h-12 text-studprimary dark:text-premium-gold" />
                  ) : (
                    <CalendarX className="w-12 h-12 text-studprimary dark:text-premium-gold" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-3xl border-2 border-studprimary/20 dark:border-premium-gold/20 scale-110 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {filters.search || filters.status !== "all"
                  ? "No matching courses"
                  : "No enrollments yet"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
                {filters.search || filters.status !== "all"
                  ? "Try adjusting your filters."
                  : "Enroll in a course to start your learning journey."}
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((enrollment) => (
                <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 px-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-studprimary dark:hover:border-premium-gold hover:text-studprimary dark:hover:text-premium-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            p === safePage
                              ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-studprimary dark:hover:border-premium-gold hover:text-studprimary dark:hover:text-premium-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Enrollments;

import React, { useMemo, useState } from "react";
import {
  useGetStudentAssignmentsQuery,
  useSubmitAssignmentMutation,
  useGetAssignmentQuery,
} from "../../../redux/Apis/assignmentApi";
import { useGetMyEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";
import { SuccessToster, ErrorToster } from "../../../components/toster";
import { Card } from "../../../components/Card";

import AssignmentsPoster from "./Assignments/AssignmentsPoster";
import AssignmentsFilters from "./Assignments/AssignmentsFilters";
import AssignmentsTable from "./Assignments/AssignmentsTable";
import AssignmentDetailModal from "./Assignments/AssignmentDetailModal";
import SubmitModal from "./Assignments/SubmitModal";

/* ── Skeleton shimmer ── */
function Shimmer({ className }) {
  return <div className={`rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse ${className}`} />;
}
function TableSkeleton() {
  return (
    <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl p-0 gap-0 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          {[35, 20, 15, 12, 10, 8].map((w, i) => (
            <Shimmer key={i} className={`h-4 w-[${w}%]`} />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            <Shimmer className="h-10 w-[35%]" />
            <Shimmer className="h-4 w-[20%] self-center" />
            <Shimmer className="h-4 w-[15%] self-center" />
            <Shimmer className="h-6 w-[12%] rounded-full self-center" />
            <Shimmer className="h-4 w-[10%] self-center" />
            <Shimmer className="h-8 w-[8%] rounded-lg self-center" />
          </div>
        ))}
      </div>
    </Card>
  );
}

const DEFAULT_FILTERS = { search: "", course: "", status: "all" };

const StudentAssignments = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [submitAssignment, setSubmitAssignment] = useState(null);

  /* ── API ── */
  const { data: assignmentsData, isLoading, refetch } = useGetStudentAssignmentsQuery({
    courseId: filters.course || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    page: currentPage,
    limit: 10,
  });

  const { data: enrollmentsData } = useGetMyEnrollmentsQuery();

  // Fetch full assignment details when viewing
  const { data: assignmentDetails } = useGetAssignmentQuery(viewAssignment?._id, {
    skip: !viewAssignment,
  });

  const [submitMutation] = useSubmitAssignmentMutation();

  /* ── Derived data ── */
  const assignments = assignmentsData?.data || [];
  const pagination = assignmentsData?.pagination || {};

  // Unique enrolled courses for filter dropdown
  const courses = useMemo(() => {
    const raw = enrollmentsData?.data?.map((e) => e.courseId).filter(Boolean) || [];
    return Array.from(new Map(raw.map((c) => [c._id, c])).values());
  }, [enrollmentsData]);

  // Client-side search filter (server handles course/status)
  const filtered = useMemo(() => {
    if (!filters.search) return assignments;
    const q = filters.search.toLowerCase();
    return assignments.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );
  }, [assignments, filters.search]);

  /* ── Stats for poster ── */
  const stats = useMemo(() => {
    const all = assignments;
    return {
      total: pagination.total || all.length,
      pending: all.filter((a) => a.submissionStatus !== "submitted" && a.submissionStatus !== "graded" && !a.isOverdue).length,
      submitted: all.filter((a) => a.submissionStatus === "submitted" || a.submissionStatus === "graded").length,
      overdue: all.filter((a) => a.isOverdue).length,
    };
  }, [assignments, pagination.total]);

  /* ── Handlers ── */
  const handleSubmit = async (formData) => {
    try {
      await submitMutation({ id: submitAssignment._id, ...formData }).unwrap();
      SuccessToster("Assignment submitted successfully");
      setSubmitAssignment(null);
      setViewAssignment(null);
      refetch();
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to submit assignment");
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <AdminLayout showSearch={false} breadcrumbItems={getBreadcrumbs("DASHBOARD")}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-6">

        {/* Hero poster */}
        <AssignmentsPoster
          total={stats.total}
          pending={stats.pending}
          submitted={stats.submitted}
          overdue={stats.overdue}
        />

        {/* Filters */}
        <AssignmentsFilters
          courses={courses}
          filters={filters}
          onChange={handleFilterChange}
          onClear={() => { setFilters(DEFAULT_FILTERS); setCurrentPage(1); }}
        />

        {/* Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <AssignmentsTable
            assignments={filtered}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onView={(a) => setViewAssignment(a)}
            onSubmit={(a) => setSubmitAssignment(a)}
          />
        )}
      </div>

      {/* Detail modal */}
      {viewAssignment && !submitAssignment && (
        <AssignmentDetailModal
          assignment={assignmentDetails?.data || viewAssignment}
          onClose={() => setViewAssignment(null)}
          onSubmit={() => setSubmitAssignment(viewAssignment)}
        />
      )}

      {/* Submit modal */}
      {submitAssignment && (
        <SubmitModal
          assignment={submitAssignment}
          onClose={() => setSubmitAssignment(null)}
          onSubmit={handleSubmit}
        />
      )}
    </AdminLayout>
  );
};

export default StudentAssignments;

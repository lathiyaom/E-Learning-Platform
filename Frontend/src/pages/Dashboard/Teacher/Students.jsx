import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetCourseEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../../components/Breadcrumb";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../components/table";
import { Card } from "../../../components/Card";
import { DataTablePagination } from "../../../components/data-table-pagination";
import {
  Users,
  BookOpen,
  Search,
  X,
  ChevronDown,
  GraduationCap,
  CalendarDays,
  Mail,
  User2,
  BadgeCheck,
  Clock3,
  UserX,
  TrendingUp,
  Sparkles,
  Filter,
} from "lucide-react";

/* ─── Design tokens (Help page + Admin Dashboard parity) ─── */
const CARD =
  "bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm";
const INPUT =
  "w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-deep-charcoal border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 focus:border-studprimary dark:focus:border-premium-gold/50 transition-all";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const DEFAULT_PAGE_SIZE = 10;

/* ─── Status badge config ─── */
const STATUS_MAP = {
  active: {
    label: "Active",
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400",
    dot: "#10b981",
  },
  completed: {
    label: "Completed",
    cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-400",
    dot: "#3b82f6",
  },
  dropped: {
    label: "Dropped",
    cls: "bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-400",
    dot: "#ef4444",
  },
  pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400",
    dot: "#f59e0b",
  },
};
const getStatus = (s) => STATUS_MAP[s] || STATUS_MAP.pending;

/* ─── Helpers ─── */
const studentName = (e) =>
  e.studentId?.firstName
    ? `${e.studentId.firstName} ${e.studentId.lastName || ""}`.trim()
    : e.studentId?.email || String(e.studentId || "—");

const studentEmail = (e) => e.studentId?.email || "—";

const enrollDate = (e) => {
  const d = e.enrollmentDate || e.enrolledAt || e.enrolled_at;
  return d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
};

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/* ─── Stat card ─── */
const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div
    className={`${CARD} p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300"
      style={{ background: accent + "18" }}
    >
      <Icon size={20} style={{ color: accent }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
        {label}
      </p>
      {sub && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          {sub}
        </p>
      )}
    </div>
  </div>
);

/* ─── Inline detail chip (read-only) ─── */
const InfoChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
    <Icon size={12} className="flex-shrink-0 text-slate-400 dark:text-slate-500" />
    <span className="font-medium text-slate-400 dark:text-slate-500">{label}:</span>
    <span className="text-slate-700 dark:text-slate-200 font-semibold">{value}</span>
  </div>
);

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const Students = () => {
  const { user } = useSelector((state) => state.auth || {});
  const teacherId = String(user?._id || user?.id || "");

  /* local state */
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);          // 0-based for DataTablePagination
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /* RTK queries */
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetCourseEnrollmentsQuery(selectedCourse, { skip: !selectedCourse });

  /* derived */
  const myCourses =
    coursesData?.data?.filter(
      (c) =>
        String(c?.createdBy?._id || c?.createdBy || "") === teacherId ||
        String(c?.teacher_id?._id || c?.teacher_id || "") === teacherId
    ) || [];

  const allStudents = enrollmentsData?.data || [];
  const selectedCourseObj = myCourses.find(
    (c) => (c._id || c.id) === selectedCourse
  );

  /* filter + search */
  const filtered = useMemo(() => {
    let list = allStudents;
    if (statusFilter !== "all")
      list = list.filter((e) => e.status === statusFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          studentName(e).toLowerCase().includes(q) ||
          studentEmail(e).toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStudents, statusFilter, searchTerm]);

  /* pagination */
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeIndex = Math.min(pageIndex, pageCount - 1);
  const paginated = filtered.slice(safeIndex * pageSize, (safeIndex + 1) * pageSize);
  const showPagination = filtered.length > DEFAULT_PAGE_SIZE;

  /* ── DataTablePagination adapter ──
     Mirrors the TanStack Table interface that DataTablePagination expects,
     using only local state — no tanstack/react-table dependency needed. */
  const tableAdapter = {
    getState: () => ({
      pagination: { pageIndex: safeIndex, pageSize },
    }),
    getPageCount: () => pageCount,
    getCanPreviousPage: () => safeIndex > 0,
    getCanNextPage: () => safeIndex < pageCount - 1,
    setPageIndex: (idx) => {
      const target = typeof idx === "function" ? idx(safeIndex) : idx;
      setPageIndex(Math.max(0, Math.min(target, pageCount - 1)));
    },
    setPageSize: (size) => {
      setPageSize(size);
      setPageIndex(0); // reset to first page when page size changes
    },
    previousPage: () => setPageIndex(Math.max(0, safeIndex - 1)),
    nextPage: () => setPageIndex(Math.min(pageCount - 1, safeIndex + 1)),
    /* row counts — shows "X of Y rows" in DataTablePagination */
    getFilteredRowModel: () => ({ rows: { length: filtered.length } }),
    getFilteredSelectedRowModel: () => ({ rows: { length: 0 } }),
  };

  /* handlers */
  const onCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setSearchTerm("");
    setStatusFilter("all");
    setPageIndex(0);
  };

  /* stats */
  const activeCount = allStudents.filter((e) => e.status === "active").length;
  const completedCount = allStudents.filter((e) => e.status === "completed").length;
  const inProgressCount = Math.max(
    0,
    allStudents.length - completedCount -
      allStudents.filter(
        (e) => e.status === "dropped" || e.status === "inactive"
      ).length
  );

  return (
    <AdminLayout showSearch={false}>
      <div className="p-4 md:p-6 space-y-6 min-h-full bg-background-light dark:bg-transparent">

        {/* ── Breadcrumb ── */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/teacher/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Students</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ── Hero header (Help page poster style) ── */}
        <section className={`relative ${CARD} px-5 py-8 md:px-8 md:py-10 overflow-hidden`}>
          {/* decorative glow blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-studprimary/8 dark:bg-premium-gold/8 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-500/8 dark:bg-premium-gold/5 rounded-full blur-[60px] translate-y-1/2 translate-x-1/2" />
            {/* dot-grid (same as Help poster) */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
              style={{
                backgroundImage:
                  "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "1.5rem 1.5rem",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0">
                <Users size={26} className="text-studprimary dark:text-premium-gold" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 border border-studprimary/20 dark:border-premium-gold/20 text-studprimary dark:text-premium-gold text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={10} />
                  Teacher Dashboard
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  My Students
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  View enrolled students and their details for your courses
                </p>
              </div>
            </div>

            {/* Course picker */}
            <div className="relative md:w-72 flex-shrink-0">
              <BookOpen
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
              />
              <select
                value={selectedCourse}
                onChange={onCourseChange}
                disabled={coursesLoading}
                className={`${INPUT} pl-9 pr-9 appearance-none cursor-pointer`}
              >
                <option value="" disabled>
                  {coursesLoading ? "Loading courses…" : "Select a course…"}
                </option>
                {myCourses.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </section>

        {/* ── No course selected ── */}
        {!selectedCourse ? (
          <div
            className={`${CARD} flex flex-col items-center text-center gap-4 py-20 px-6`}
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <GraduationCap size={30} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-600 dark:text-slate-300">
                No course selected
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                Choose one of your courses from the dropdown above to view
                enrolled students.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Enrolled"
                value={allStudents.length}
                accent="#b48c4c"
                sub={
                  selectedCourseObj?.title?.slice(0, 18) +
                  (selectedCourseObj?.title?.length > 18 ? "…" : "") || ""
                }
              />
              <StatCard
                icon={BadgeCheck}
                label="Active"
                value={activeCount}
                accent="#10b981"
              />
              <StatCard
                icon={GraduationCap}
                label="Completed"
                value={completedCount}
                accent="#3b82f6"
              />
              <StatCard
                icon={TrendingUp}
                label="In Progress"
                value={inProgressCount}
                accent="#8b5cf6"
              />
            </div>

            {/* ── Filter bar ── */}
            <div className={`${CARD} p-3 md:p-4`}>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPageIndex(0);
                    }}
                    placeholder="Search by name or email…"
                    className={`${INPUT} pl-9 ${searchTerm ? "pr-9" : ""}`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setPageIndex(0);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status filter */}
                <div className="relative">
                  <Filter
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPageIndex(0);
                    }}
                    className={`${INPUT} pl-9 pr-8 appearance-none cursor-pointer min-w-[150px]`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* ── Table / content ── */}
            {enrollmentsLoading ? (
              <div className={`${CARD} flex items-center justify-center py-20`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-studprimary/20 border-t-studprimary dark:border-premium-gold/20 dark:border-t-premium-gold animate-spin" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading students…
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div
                className={`${CARD} flex flex-col items-center text-center gap-4 py-16 px-6`}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  {searchTerm || statusFilter !== "all" ? (
                    <Search size={26} className="text-slate-300 dark:text-slate-600" />
                  ) : (
                    <UserX size={26} className="text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {searchTerm || statusFilter !== "all"
                      ? "No results found"
                      : "No students enrolled yet"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                    {searchTerm || statusFilter !== "all"
                      ? "Try a different search term or status filter."
                      : "When students enroll in this course, they'll appear here."}
                  </p>
                </div>
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPageIndex(0);
                    }}
                    className="text-xs font-semibold text-studprimary dark:text-premium-gold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              /* ─ Table wrapper ─ */
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-transparent dark:dark-glass">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 dark:bg-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5">
                        <TableHead className="pl-5 w-12">Id</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead>Enrolled On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="pr-5">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((enrollment, idx) => {
                        const name = studentName(enrollment);
                        const email = studentEmail(enrollment);
                        const status = getStatus(enrollment.status);
                        const rowNum = safeIndex * pageSize + idx + 1;
                        return (
                          <TableRow key={enrollment._id || enrollment.id}>
                            {/* Row # */}
                            <TableCell className="pl-5 text-slate-400 dark:text-slate-500 text-xs font-medium">
                              {rowNum}
                            </TableCell>

                            {/* Student avatar + name */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                  style={{
                                    background:
                                      "linear-gradient(135deg,#b48c4c,#a37c3c)",
                                  }}
                                >
                                  {initials(name) || <User2 size={14} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                                    {name}
                                  </p>
                                  {/* show email under name on mobile */}
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 md:hidden truncate">
                                    {email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Email — hidden on small */}
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1.5">
                                <Mail
                                  size={12}
                                  className="text-slate-400 flex-shrink-0"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                                  {email}
                                </span>
                              </div>
                            </TableCell>

                            {/* Enrolled date */}
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <CalendarDays
                                  size={12}
                                  className="text-slate-400 flex-shrink-0"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                  {enrollDate(enrollment)}
                                </span>
                              </div>
                            </TableCell>

                            {/* Status badge */}
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.cls}`}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ background: status.dot }}
                                />
                                {status.label}
                              </span>
                            </TableCell>

                            {/* Informative detail chips — read only */}
                            <TableCell className="pr-5">
                              <div className="flex flex-col gap-1">
                                {enrollment.completedLessons !== undefined && (
                                  <InfoChip
                                    icon={BookOpen}
                                    label="Lessons"
                                    value={`${enrollment.completedLessons ?? 0} done`}
                                  />
                                )}
                                {enrollment.lastAccessedAt && (
                                  <InfoChip
                                    icon={Clock3}
                                    label="Last seen"
                                    value={new Date(
                                      enrollment.lastAccessedAt
                                    ).toLocaleDateString()}
                                  />
                                )}
                                {enrollment.grade && (
                                  <InfoChip
                                    icon={TrendingUp}
                                    label="Grade"
                                    value={enrollment.grade}
                                  />
                                )}
                                {!enrollment.completedLessons &&
                                  !enrollment.lastAccessedAt &&
                                  !enrollment.grade && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                      —
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* ── Pagination — only shown when records > DEFAULT_PAGE_SIZE (10) ── */}
                {showPagination && (
                  <DataTablePagination
                    table={tableAdapter}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    showPageSize={true}
                  />
                )}
              </div>
            )}

            {/* ── Read-only notice ── */}
            <Card className="bg-studprimary/5 dark:bg-premium-gold/5 border border-studprimary/15 dark:border-premium-gold/15 rounded-2xl p-4 md:p-5 flex items-start gap-3 shadow-none">
              <div className="w-8 h-8 rounded-lg bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles
                  size={15}
                  className="text-studprimary dark:text-premium-gold"
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Student Records — View Only
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This panel shows read-only enrollment data for your course.
                  Student information cannot be edited, deleted or updated from
                  here. Use the Assignments page to manage submissions and grades.
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Students;

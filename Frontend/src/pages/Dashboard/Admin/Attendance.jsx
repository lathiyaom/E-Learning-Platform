import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Search,
  Users,
} from "lucide-react";

import AdminLayout from "../../../utils/Adminlayoute";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetAttendanceReportQuery } from "../../../redux/Apis/attendanceApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";

const PAGE_SIZE = 8;

const STATUS_BADGES = {
  present:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  absent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const normalizeDateKey = (dateLike) => {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateLike) => {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTimeLabel = (dateLike) => {
  if (!dateLike) return "--:--";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const buildStudentCode = (student) => {
  const rawId = String(student?._id || student?.id || "");
  if (!rawId) return "N/A";
  return `ST-${rawId.slice(-6).toUpperCase()}`;
};

const MetricCard = ({ title, value, accentClass }) => (
  <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4">
    <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
      {title}
    </p>
    <p className={`mt-1 text-3xl font-bold ${accentClass}`}>{value}</p>
  </article>
);

const Attendance = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("name");
  const [page, setPage] = useState(1);

  const { data: coursesData } = useGetAllCoursesQuery();
  const {
    data: attendanceData,
    isLoading,
    isFetching,
    error,
  } = useGetAttendanceReportQuery(selectedCourse, {
    skip: !selectedCourse,
  });

  const courses = coursesData?.data || [];
  const records = attendanceData?.data || [];

  const selectedCourseData = useMemo(
    () => courses.find((course) => (course._id || course.id) === selectedCourse),
    [courses, selectedCourse]
  );

  const dateOptions = useMemo(() => {
    const keys = Array.from(
      new Set(records.map((record) => normalizeDateKey(record.classDate)).filter(Boolean))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return keys;
  }, [records]);

  useEffect(() => {
    if (!selectedCourse) {
      setSelectedDate("");
      setPage(1);
      return;
    }

    if (!dateOptions.length) {
      setSelectedDate("");
      setPage(1);
      return;
    }

    if (!selectedDate || !dateOptions.includes(selectedDate)) {
      setSelectedDate(dateOptions[0]);
      setPage(1);
    }
  }, [selectedCourse, selectedDate, dateOptions]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, sortMode, selectedDate]);

  const activeRecord = useMemo(() => {
    if (!selectedDate) return null;
    return records.find((record) => normalizeDateKey(record.classDate) === selectedDate) || null;
  }, [records, selectedDate]);

  const allRowsForDate = useMemo(() => {
    if (!activeRecord?.attendanceRecords) return [];

    return activeRecord.attendanceRecords.map((entry, index) => {
      const student = entry.studentId || {};
      const name = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown Student";

      return {
        id: entry._id || `${student._id || student.id || "student"}-${index}`,
        name,
        email: student.email || "-",
        studentCode: buildStudentCode(student),
        status: entry.status || "absent",
        checkInTime: formatTimeLabel(entry.markedAt),
      };
    });
  }, [activeRecord]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    let list = [...allRowsForDate].filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        row.name.toLowerCase().includes(normalizedSearch) ||
        row.email.toLowerCase().includes(normalizedSearch) ||
        row.studentCode.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    if (sortMode === "checkIn") {
      list.sort((a, b) => a.checkInTime.localeCompare(b.checkInTime));
    } else if (sortMode === "status") {
      const rank = { present: 1, late: 2, absent: 3 };
      list.sort((a, b) => (rank[a.status] || 99) - (rank[b.status] || 99));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [allRowsForDate, search, sortMode, statusFilter]);

  const stats = useMemo(() => {
    const total = allRowsForDate.length;
    const present = allRowsForDate.filter((row) => row.status === "present").length;
    const absent = allRowsForDate.filter((row) => row.status === "absent").length;
    const late = allRowsForDate.filter((row) => row.status === "late").length;

    return { total, present, absent, late };
  }, [allRowsForDate]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportReport = () => {
    if (!allRowsForDate.length) {
      ErrorToster("No attendance data to export", 2000);
      return;
    }

    const header = ["Name", "Student ID", "Email", "Status", "Check-in Time"];
    const rows = allRowsForDate.map((row) =>
      [
        `"${row.name.replace(/"/g, '""')}"`,
        row.studentCode,
        `"${row.email.replace(/"/g, '""')}"`,
        row.status,
        row.checkInTime,
      ].join(",")
    );

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `attendance-${selectedDate || "report"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    SuccessToster("Attendance report exported", 2000);
  };

  return (
    <AdminLayout showSearch={false}>
      <div className="p-4 sm:p-6 space-y-6">
        <section className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-lavender-light dark:bg-navy-charcoal p-5 md:p-6 shadow-sm dark:shadow-none">
          <div className="pointer-events-none absolute -top-16 -right-14 h-40 w-40 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold pointer-events-none" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "1.5rem 1.5rem" }} />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-studprimary/20 dark:border-premium-gold/20 bg-studprimary/10 dark:bg-premium-gold/10 px-3 py-1 text-xs font-semibold text-studprimary dark:text-premium-gold">
                <Calendar className="h-3.5 w-3.5" />
                Attendance Management
              </div>
              <h1 className="mt-2 text-2xl md:text-[1.75rem] font-bold text-slate-900 dark:text-slate-100">
                Attendance Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">
                Manage and track daily student presence with dynamic course-based reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportReport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 md:p-5 shadow-sm dark:shadow-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="">Choose course</option>
                {courses.map((course) => {
                  const courseId = course._id || course.id;
                  return (
                    <option key={courseId} value={courseId}>
                      {course.title}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                Select Date
              </label>
              <select
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                disabled={!dateOptions.length}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 disabled:opacity-50"
              >
                {!dateOptions.length && <option value="">No dates available</option>}
                {dateOptions.map((dateKey) => (
                  <option key={dateKey} value={dateKey}>
                    {formatDateLabel(dateKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                Search Student
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, email, ID"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {selectedCourseData ? `Course: ${selectedCourseData.title}` : "Select a course to view report"}
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setSearch("");
                setSortMode("name");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <Filter className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard title="Total Students" value={stats.total} accentClass="text-slate-900 dark:text-white" />
          <MetricCard title="Present" value={stats.present} accentClass="text-emerald-600 dark:text-emerald-300" />
          <MetricCard title="Absent" value={stats.absent} accentClass="text-red-600 dark:text-red-300" />
          <MetricCard title="Late" value={stats.late} accentClass="text-amber-600 dark:text-amber-300" />
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-red-700 dark:text-red-300">
            {error?.data?.message || "Failed to load attendance records"}
          </section>
        ) : !selectedCourse ? (
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-12 text-center text-slate-500 dark:text-slate-400">
            Select a course to view attendance report.
          </section>
        ) : isLoading || isFetching ? (
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-12 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-studprimary dark:border-premium-gold" />
          </section>
        ) : !activeRecord ? (
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-12 text-center text-slate-500 dark:text-slate-400">
            No attendance records found for selected course/date.
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass shadow-sm dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-100/80 dark:bg-premium-surface-2/70">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Student Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Student ID
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Attendance Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Check-in Time
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-premium-surface-2/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300">{row.studentCode}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGES[row.status] || STATUS_BADGES.absent}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300">{row.checkInTime}</td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-white/10"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {paginatedRows.length} of {filteredRows.length} students
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                  className="h-8 px-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-xs"
                >
                  <option value="name">Sort: Name</option>
                  <option value="status">Sort: Status</option>
                  <option value="checkIn">Sort: Check-in</option>
                </select>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage <= 1}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {safePage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage >= totalPages}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5">
            <h3 className="text-lg font-bold text-studprimary dark:text-premium-gold">Automated Reports</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Weekly attendance summaries are generated from marked records and filtered by the selected course/date.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal px-4 py-2 text-sm font-semibold">
              <Users className="h-4 w-4" />
              {stats.total} Students Tracked
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Need Help?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Contact the school IT support for assistance with bulk attendance updates or integration issues.
            </p>
            <button className="mt-4 rounded-xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              Support Center
            </button>
          </article>
        </section>
      </div>
    </AdminLayout>
  );
};

export default Attendance;

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetCourseEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import {
  useDeleteAttendanceMutation,
  useGetAttendanceReportQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
} from "../../../redux/Apis/attendanceApi";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/Card";
import { Button } from "../../../components/Button";
import { Badge } from "../../../components/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/table";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

const Attendance = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector(selectCurrentUser);

  const { data: coursesData } = useGetAllCoursesQuery();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetCourseEnrollmentsQuery(selectedCourse, { skip: !selectedCourse });
  const { data: attendanceReportData, refetch: refetchAttendanceReport } =
    useGetAttendanceReportQuery(selectedCourse, {
      skip: !selectedCourse,
    });
  const [markAttendance, { isLoading: submitting }] =
    useMarkAttendanceMutation();
  const [updateAttendance, { isLoading: updating }] =
    useUpdateAttendanceMutation();
  const [deleteAttendance, { isLoading: deleting }] =
    useDeleteAttendanceMutation();

  const courseId = selectedCourse;
  const courseList = coursesData?.data || [];
  const teacherId = String(user?._id || user?.id || "");
  const myCourses = courseList.filter(
    (course) =>
      String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
      String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId,
  );
  const students = enrollmentsData?.data || [];
  const attendanceReport = attendanceReportData?.data || [];

  const existingAttendance = attendanceReport.find((record) => {
    const recordDate = new Date(record.classDate).toISOString().split("T")[0];
    return recordDate === selectedDate;
  });

  React.useEffect(() => {
    if (existingAttendance?._id) {
      const next = {};
      existingAttendance.attendanceRecords?.forEach((record) => {
        const studentObj = record.studentId;
        const sid = typeof studentObj === 'object' && studentObj !== null ? studentObj._id : studentObj;
        next[sid] = record.status;
      });
      setAttendanceData(next);
      return;
    }

    setAttendanceData({});
  }, [existingAttendance, selectedDate]);

  const statusBreakdown = students.reduce(
    (acc, enrollment) => {
      const studentObj = enrollment.studentId || enrollment.student_id;
      const sid = studentObj?._id || studentObj || enrollment.studentId || enrollment.student_id;
      const status = attendanceData[sid] || "present";

      if (status === "present") acc.present += 1;
      if (status === "absent") acc.absent += 1;
      if (status === "late") acc.late += 1;

      return acc;
    },
    { present: 0, absent: 0, late: 0 },
  );

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  const handleSubmit = async () => {
    if (!courseId || !selectedDate) {
      alert("Please select a course and date");
      return;
    }

    try {
      const attendanceRecords = students.map((enrollment) => {
        const studentObj = enrollment.studentId || enrollment.student_id;
        const sid = studentObj?._id || studentObj || enrollment.studentId || enrollment.student_id;
        return {
          studentId: sid,
          status: attendanceData[sid] || "present",
        };
      });

      if (existingAttendance?._id) {
        await updateAttendance({
          id: existingAttendance._id,
          attendanceRecords,
        }).unwrap();
        alert("Attendance updated successfully!");
      } else {
        await markAttendance({
          courseId,
          classDate: selectedDate,
          attendanceRecords,
        }).unwrap();
        alert("Attendance marked successfully!");
      }

      setAttendanceData({});
      refetchAttendanceReport();
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert(
        "Failed to mark attendance: " +
          (error?.data?.message || error?.message),
      );
    }
  };

  const handleDeleteAttendance = async () => {
    if (!existingAttendance?._id) {
      alert("No attendance record found for selected date.");
      return;
    }

    if (!window.confirm("Delete attendance for selected date?")) {
      return;
    }

    try {
      await deleteAttendance(existingAttendance._id).unwrap();
      alert("Attendance deleted successfully.");
      setAttendanceData({});
      refetchAttendanceReport();
    } catch (error) {
      alert(
        "Failed to delete attendance: " +
          (error?.data?.message || error?.message),
      );
    }
  };

  const statusToneClass = (status) => {
    if (status === "present") {
      return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300";
    }

    if (status === "absent") {
      return "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-300";
    }

    return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300";
  };

  const selectClassName =
    "w-full rounded-lg border border-studprimary/15 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-studprimary/40 focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-navy-charcoal dark:text-slate-100 dark:focus:border-premium-gold/45 dark:focus:ring-premium-gold/20";

  const ITEMS_PER_PAGE = 8;

  const studentRows = React.useMemo(() => {
    return students.map((enrollment) => {
      const studentObj = enrollment.studentId || enrollment.student_id;
      const sid =
        studentObj?._id ||
        studentObj ||
        enrollment.studentId ||
        enrollment.student_id;

      const sInfo = typeof studentObj === "object" ? studentObj : null;
      const displayName = sInfo?.firstName
        ? `${sInfo.firstName} ${sInfo.lastName || ""}`.trim()
        : sid && typeof sid === "string"
          ? `Student (${sid.substring(0, 8)}...)`
          : "Unknown Student";

      const enrollmentDate =
        enrollment.enrolledAt ||
        enrollment.enrolled_at ||
        enrollment.createdAt ||
        enrollment.enrollmentDate;

      return {
        enrollment,
        sid,
        displayName,
        enrollmentDate,
        selectedStatus: attendanceData[sid] || "present",
      };
    });
  }, [students, attendanceData]);

  const filteredRows = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return studentRows.filter((row) => {
      const matchSearch =
        !normalizedSearch ||
        row.displayName.toLowerCase().includes(normalizedSearch);
      const matchStatus =
        statusFilter === "all" || row.selectedStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [studentRows, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / ITEMS_PER_PAGE),
  );

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const formatEnrollmentTenure = (enrollmentDate) => {
    if (!enrollmentDate) {
      return "N/A";
    }

    const enrolledDate = new Date(enrollmentDate);
    if (Number.isNaN(enrolledDate.getTime())) {
      return "N/A";
    }

    const now = new Date();
    const diff = Math.max(0, now.getTime() - enrolledDate.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 30) {
      return `${days} day${days === 1 ? "" : "s"}`;
    }

    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? "" : "s"}`;
  };

  return (
    <AdminLayout showSearch={false} className="p-0">
      <div className="min-h-screen bg-background-light p-4 dark:bg-transparent sm:p-6 lg:p-8">
        <section className="mb-5 rounded-2xl border border-studprimary/12 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-studprimary/15 bg-background-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-studprimary dark:border-premium-gold/30 dark:bg-premium-gold/10 dark:text-premium-gold">
                <ClipboardList className="h-3.5 w-3.5" />
                Attendance Studio
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Mark Course Attendance
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Select a class date, update student status, and keep attendance
                records accurate in one streamlined workflow.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
              <Card className="rounded-xl border-studprimary/12 !py-3 dark:border-white/10">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Students
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {students.length}
                    </p>
                  </div>
                  <Users className="h-4 w-4 text-studprimary dark:text-premium-gold" />
                </CardContent>
              </Card>

              <Card className="rounded-xl border-studprimary/12 !py-3 dark:border-white/10">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Present
                    </p>
                    <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-300">
                      {statusBreakdown.present}
                    </p>
                  </div>
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                </CardContent>
              </Card>

              <Card className="rounded-xl border-studprimary/12 !py-3 dark:border-white/10 sm:col-span-2 lg:col-span-1">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Needs Attention
                    </p>
                    <p className="text-lg font-extrabold text-rose-600 dark:text-rose-300">
                      {statusBreakdown.absent + statusBreakdown.late}
                    </p>
                  </div>
                  <UserX className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
          <Card className="rounded-2xl border-studprimary/15 bg-white/85 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <BookOpen className="h-4 w-4 text-studprimary dark:text-premium-gold" />
                Attendance Register
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Choose course and class date before taking attendance.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      setAttendanceData({});
                    }}
                    className={selectClassName}
                  >
                    <option value="">-- Select Course --</option>
                    {myCourses.map((course) => (
                      <option
                        key={course._id || course.id}
                        value={course._id || course.id}
                      >
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Class Date
                  </label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`${selectClassName} pl-9`}
                    />
                  </div>
                </div>
              </div>

              {selectedCourse && students.length > 0 && (
                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Search Student
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by student name"
                      className={selectClassName}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Status Filter
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={selectClassName}
                    >
                      <option value="all">All</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                </div>
              )}

              {!selectedCourse && (
                <div className="rounded-xl border border-dashed border-studprimary/25 bg-background-light px-4 py-8 text-center dark:border-premium-gold/30 dark:bg-white/5">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-studprimary dark:text-premium-gold" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Select a course to begin attendance tracking.
                  </p>
                </div>
              )}

              {selectedCourse && (
                <>
                  {enrollmentsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-studprimary dark:border-premium-gold" />
                    </div>
                  ) : students.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-studprimary/25 bg-background-light px-4 py-8 text-center dark:border-premium-gold/30 dark:bg-white/5">
                      <Users className="mx-auto mb-2 h-8 w-8 text-studprimary dark:text-premium-gold" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        No students are enrolled in this course yet.
                      </p>
                    </div>
                  ) : filteredRows.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-studprimary/25 bg-background-light px-4 py-8 text-center dark:border-premium-gold/30 dark:bg-white/5">
                      <Users className="mx-auto mb-2 h-8 w-8 text-studprimary dark:text-premium-gold" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        No students matched your filter.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Enrollment Date</TableHead>
                            <TableHead>Enrolled Since</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedRows.map((row) => {
                              const {
                                enrollment,
                                sid,
                                displayName,
                                enrollmentDate,
                                selectedStatus,
                              } = row;

                            return (
                              <TableRow key={enrollment._id || enrollment.id}>
                                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                  {displayName}
                                </TableCell>
                                <TableCell>
                                  {enrollmentDate
                                    ? new Date(enrollmentDate).toLocaleDateString()
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <span className="inline-flex min-w-[90px] justify-center rounded-md bg-background-light px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                                    {formatEnrollmentTenure(enrollmentDate)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Badge
                                      variant="outline"
                                      className={`w-fit border ${statusToneClass(selectedStatus)}`}
                                    >
                                      {selectedStatus}
                                    </Badge>
                                    <select
                                      value={selectedStatus}
                                      onChange={(e) =>
                                        handleStatusChange(sid, e.target.value)
                                      }
                                      className="w-full rounded-md border border-studprimary/20 bg-white px-2.5 py-1.5 text-xs font-semibold capitalize text-slate-700 outline-none transition focus:border-studprimary/40 focus:ring-2 focus:ring-studprimary/20 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:focus:border-premium-gold/45 dark:focus:ring-premium-gold/20 sm:w-[130px]"
                                    >
                                      <option value="present">Present</option>
                                      <option value="absent">Absent</option>
                                      <option value="late">Late</option>
                                    </select>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-studprimary/10 bg-white/70 px-3.5 py-3 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Showing {paginatedRows.length} of{" "}
                          {filteredRows.length} matched students
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                            className="h-8 border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/30 dark:text-premium-gold dark:hover:bg-premium-gold/10"
                          >
                            Previous
                          </Button>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="h-8 border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/30 dark:text-premium-gold dark:hover:bg-premium-gold/10"
                          >
                            Next
                          </Button>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 border-t border-studprimary/10 pt-4 sm:flex-row sm:items-center sm:justify-end dark:border-white/10">
                        {existingAttendance && (
                          <Button
                            onClick={handleDeleteAttendance}
                            disabled={deleting}
                            variant="outline"
                            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-400/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting ? "Deleting..." : "Delete Attendance"}
                          </Button>
                        )}
                        <Button
                          onClick={handleSubmit}
                          disabled={submitting || updating}
                          className="bg-studprimary text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {submitting || updating
                            ? existingAttendance
                              ? "Updating..."
                              : "Submitting..."
                            : existingAttendance
                              ? "Update Attendance"
                              : "Submit Attendance"}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-studprimary/15 bg-white/85 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Session Insights
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Quick overview for the selected date and class.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Attendance Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Attendance Mode
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {existingAttendance
                    ? "Edit Existing Record"
                    : "Create New Record"}
                </p>
              </div>

              <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status Split
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                  >
                    Present: {statusBreakdown.present}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-300"
                  >
                    Absent: {statusBreakdown.absent}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300"
                  >
                    Late: {statusBreakdown.late}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
};

export default Attendance;

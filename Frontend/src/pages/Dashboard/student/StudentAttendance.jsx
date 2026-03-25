import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { AlertCircle } from "lucide-react";
import { useGetMyEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import { useGetStudentAttendanceQuery } from "../../../redux/Apis/attendanceApi";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";

import AttendancePoster from "./Attendance/AttendancePoster";
import AttendanceCourseFilter from "./Attendance/AttendanceCourseFilter";
import AttendanceTable from "./Attendance/AttendanceTable";
import AttendanceSkeleton from "./Attendance/AttendanceSkeleton";

const StudentAttendance = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const user = useSelector(selectCurrentUser);
  const studentId = user?._id || user?.id;

  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetMyEnrollmentsQuery(undefined, { skip: !studentId });

  const { data: attendanceResponse, isLoading: attendanceLoading } =
    useGetStudentAttendanceQuery(
      { studentId, courseId: selectedCourse },
      { skip: !selectedCourse || !studentId }
    );

  const attendanceError =
    attendanceResponse?.success === false ? attendanceResponse?.message : null;

  const enrollments = enrollmentsData?.data || [];
  const rawData = attendanceResponse?.data || {};
  const backendRecords = rawData.records || [];

  const attendanceRecords = useMemo(() => {
    if (!studentId) return [];
    return backendRecords.map((rec) => {
      const studentRec = (rec.attendanceRecords || []).find(
        (r) => (r.studentId?._id || r.studentId)?.toString() === studentId?.toString()
      );
      return {
        id: rec._id,
        date: rec.classDate,
        status: studentRec?.status || "absent",
        remarks: studentRec?.remarks,
      };
    });
  }, [backendRecords, studentId]);

  const stats = useMemo(() => {
    if (attendanceRecords.length === 0) {
      return { present: 0, absent: 0, late: 0, percentage: rawData.attendancePercentage ?? 0 };
    }
    const present = attendanceRecords.filter((r) => r.status === "present").length;
    const absent = attendanceRecords.filter((r) => r.status === "absent").length;
    const late = attendanceRecords.filter((r) => r.status === "late").length;
    const percentage = ((present + late) / attendanceRecords.length * 100).toFixed(1);
    return { present, absent, late, percentage };
  }, [attendanceRecords, rawData]);

  const showStats = selectedCourse && !attendanceLoading && !attendanceError && attendanceRecords.length > 0;

  return (
    <AdminLayout showSearch={false} breadcrumbItems={getBreadcrumbs("ATTENDANCE")}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-6">

        {/* Hero poster — stats update when a course is selected */}
        <AttendancePoster
          present={showStats ? stats.present : 0}
          absent={showStats ? stats.absent : 0}
          late={showStats ? stats.late : 0}
          percentage={showStats ? stats.percentage : 0}
        />

        {/* Course selector */}
        <AttendanceCourseFilter
          enrollments={enrollments}
          selectedCourse={selectedCourse}
          onChange={setSelectedCourse}
          isLoading={enrollmentsLoading}
        />

        {/* Content area */}
        {!selectedCourse ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-studprimary dark:text-premium-gold" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">No course selected</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select a course above to view your attendance records.
              </p>
            </div>
          </div>
        ) : attendanceLoading ? (
          <AttendanceSkeleton />
        ) : attendanceError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <p className="font-semibold text-red-600 dark:text-red-400">{attendanceError}</p>
          </div>
        ) : (
          <AttendanceTable records={attendanceRecords} />
        )}
      </div>
    </AdminLayout>
  );
};

export default StudentAttendance;

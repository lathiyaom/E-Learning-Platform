import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMyEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import { useGetStudentAttendanceQuery } from "../../../redux/Apis/attendanceApi";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";

import AttendancePoster from "./Attendance/AttendancePoster";
import AttendanceCourseFilter from "./Attendance/AttendanceCourseFilter";
import AttendanceTable from "./Attendance/AttendanceTable";
import AttendanceSkeleton from "./Attendance/AttendanceSkeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

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
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* Hero poster */}
        <motion.div variants={itemVariants}>
          <AttendancePoster
            present={showStats ? stats.present : 0}
            absent={showStats ? stats.absent : 0}
            late={showStats ? stats.late : 0}
            percentage={showStats ? stats.percentage : 0}
          />
        </motion.div>

        {/* Course selector */}
        <motion.div variants={itemVariants}>
          <AttendanceCourseFilter
            enrollments={enrollments}
            selectedCourse={selectedCourse}
            onChange={setSelectedCourse}
            isLoading={enrollmentsLoading}
          />
        </motion.div>

        {/* Content area with AnimatePresence for smooth state switching */}
        <AnimatePresence mode="wait">
          {!selectedCourse ? (
            <motion.div 
              key="no-course"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center py-20 gap-6 text-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-[2rem] bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center relative z-10">
                  <AlertCircle className="w-10 h-10 text-studprimary dark:text-premium-gold" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-[2rem] border-2 border-studprimary/20 dark:border-premium-gold/20 scale-110" 
                />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-900 dark:text-white">Waiting for course selection</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Please select a course from the dropdown menu above to retrieve your detailed attendance records and statistics.
                </p>
              </div>
            </motion.div>
          ) : attendanceLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AttendanceSkeleton />
            </motion.div>
          ) : attendanceError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-red-50/30 dark:bg-red-900/5 rounded-3xl border border-red-100/50 dark:border-red-900/10"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-sm">
                <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{attendanceError}</p>
                <p className="text-xs text-red-500/70 dark:text-red-400/50">Try selecting another course or contact support if the problem persists.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AttendanceTable records={attendanceRecords} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  );
};

export default StudentAttendance;

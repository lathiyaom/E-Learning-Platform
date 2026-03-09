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

const Attendance = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const user = useSelector(selectCurrentUser);

  const { data: coursesData } = useGetAllCoursesQuery();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetCourseEnrollmentsQuery(
    selectedCourse,
    { skip: !selectedCourse }
  );
  const { data: attendanceReportData, refetch: refetchAttendanceReport } = useGetAttendanceReportQuery(selectedCourse, {
    skip: !selectedCourse,
  });
  const [markAttendance, { isLoading: submitting }] = useMarkAttendanceMutation();
  const [updateAttendance, { isLoading: updating }] = useUpdateAttendanceMutation();
  const [deleteAttendance, { isLoading: deleting }] = useDeleteAttendanceMutation();

  const courseId = selectedCourse;
  const courseList = coursesData?.data || [];
  const teacherId = String(user?._id || user?.id || "");
  const myCourses = courseList.filter(
    (course) =>
      String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
      String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
  );
  const students = enrollmentsData?.data || [];
  const attendanceReport = attendanceReportData?.data || [];

  const existingAttendance = attendanceReport.find((record) => {
    const recordDate = new Date(record.classDate).toISOString().split("T")[0];
    return recordDate === selectedDate;
  });

  React.useEffect(() => {
    if (existingAttendance?.attendanceRecords?.length) {
      const next = {};
      existingAttendance.attendanceRecords.forEach((record) => {
        next[record.studentId] = record.status;
      });
      setAttendanceData(next);
    }
  }, [existingAttendance?._id]);

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
        const sid = enrollment.studentId?._id || enrollment.studentId;
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
      alert("Failed to mark attendance: " + (error?.data?.message || error?.message));
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
      alert("Failed to delete attendance: " + (error?.data?.message || error?.message));
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setAttendanceData({});
              }}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">-- Select Course --</option>
              {myCourses.map((course) => (
                <option key={course._id || course.id} value={course._id || course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>

        {selectedCourse && (
          <>
            {enrollmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students enrolled in this course yet.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Enrollment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((enrollment) => {
                          const sid = enrollment.studentId?._id || enrollment.studentId;
                          const displayName = enrollment.studentId?.firstName
                            ? `${enrollment.studentId.firstName} ${enrollment.studentId.lastName || ""}`.trim()
                            : sid;
                          return (
                        <tr key={enrollment._id || enrollment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {displayName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {enrollment.enrollmentDate
                              ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {enrollment.progressPercent ?? 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={attendanceData[sid] || "present"}
                              onChange={(e) =>
                                handleStatusChange(sid, e.target.value)
                              }
                              className="px-3 py-1 border rounded"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                            </select>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  {existingAttendance && (
                    <button
                      onClick={handleDeleteAttendance}
                      disabled={deleting}
                      className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete Attendance"}
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || updating}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting || updating
                      ? existingAttendance
                        ? "Updating..."
                        : "Submitting..."
                      : existingAttendance
                        ? "Update Attendance"
                        : "Submit Attendance"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Attendance;

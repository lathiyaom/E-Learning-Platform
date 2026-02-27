import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetStudentEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import { useGetStudentAttendanceQuery } from "../../../redux/Apis/attendanceApi";
import { selectCurrentUser } from "../../../redux/slice/authSlice";

const StudentAttendance = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const user = useSelector(selectCurrentUser);

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetStudentEnrollmentsQuery(
    user?.id,
    { skip: !user?.id }
  );
  const { data: attendanceResponse, isLoading: attendanceLoading } = useGetStudentAttendanceQuery(
    { studentId: user?.id, courseId: selectedCourse },
    { skip: !selectedCourse || !user?.id }
  );

  const enrollments = enrollmentsData?.data || [];
  const rawData = attendanceResponse?.data || {};
  const backendRecords = rawData.records || [];
  const attendanceRecords = useMemo(() => {
    if (!user?.id) return [];
    return backendRecords.map((rec) => {
      const studentRec = (rec.attendanceRecords || []).find(
        (r) => (r.studentId?._id || r.studentId)?.toString() === (user.id || user._id)?.toString()
      );
      return {
        id: rec._id,
        date: rec.classDate,
        status: studentRec?.status || "absent",
        remarks: studentRec?.remarks,
      };
    });
  }, [backendRecords, user?.id, user?._id]);

  const stats = useMemo(() => {
    if (attendanceRecords.length === 0) {
      const pct = rawData.attendancePercentage ?? 0;
      return { present: 0, absent: 0, late: 0, percentage: pct };
    }
    const present = attendanceRecords.filter((r) => r.status === "present").length;
    const absent = attendanceRecords.filter((r) => r.status === "absent").length;
    const late = attendanceRecords.filter((r) => r.status === "late").length;
    const percentage = ((present + late) / attendanceRecords.length * 100).toFixed(1);
    return { present, absent, late, percentage };
  }, [attendanceRecords, rawData]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Attendance</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border rounded"
            disabled={enrollmentsLoading}
          >
            <option value="">-- Select Course --</option>
            {enrollments.map((enrollment) => {
              const cid = enrollment.courseId?._id || enrollment.courseId;
              const title = enrollment.courseId?.title || enrollment.courseTitle || `Course ${cid}`;
              return (
                <option key={enrollment._id || enrollment.id} value={cid}>
                  {title}
                </option>
              );
            })}
          </select>
        </div>

        {selectedCourse && (
          <>
            {attendanceLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No attendance records found for this course.
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 text-sm font-medium mb-1">Present</div>
                    <div className="text-2xl font-bold text-green-700">{stats.present}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 text-sm font-medium mb-1">Absent</div>
                    <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-yellow-600 text-sm font-medium mb-1">Late</div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.late}</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-600 text-sm font-medium mb-1">Attendance %</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.percentage}%</div>
                  </div>
                </div>

                {/* Attendance Records Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={record.id || record.date}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.date ? new Date(record.date).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {record.remarks || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;

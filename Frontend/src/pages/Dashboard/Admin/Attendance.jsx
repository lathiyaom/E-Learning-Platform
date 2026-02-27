import React, { useState } from "react";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetAttendanceReportQuery } from "../../../redux/Apis/attendanceApi";

const Attendance = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: coursesData } = useGetAllCoursesQuery();
  const { data: attendanceData, isLoading } = useGetAttendanceReportQuery(
    selectedCourse,
    { skip: !selectedCourse }
  );

  const courses = coursesData?.data || [];
  const attendanceRecords = attendanceData?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Attendance Reports</h1>
        <p className="text-gray-600">View and manage attendance records</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a course --</option>
          {courses.map((course) => (
            <option key={course._id || course.id} value={course._id || course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="text-xl">Loading attendance records...</div>
        </div>
      )}

      {!isLoading && selectedCourse && attendanceRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map((record) => {
                const present = record.attendanceRecords.filter(
                  (r) => r.status === "present"
                ).length;
                const absent = record.attendanceRecords.filter(
                  (r) => r.status === "absent"
                ).length;
                const late = record.attendanceRecords.filter(
                  (r) => r.status === "late"
                ).length;

                return (
                  <tr key={record._id || record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.classDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.attendanceRecords.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {absent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-semibold">
                      {late}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && selectedCourse && attendanceRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No attendance records found for this course</p>
        </div>
      )}

      {!selectedCourse && (
        <div className="text-center py-12">
          <p className="text-gray-500">Please select a course to view attendance</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Users, BookOpen, BarChart3 } from "lucide-react";
import { getAdminDashboard } from "../../../redux/Apis/analyticsApi";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { adminDashboard, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(getAdminDashboard());
  }, [dispatch]);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (!adminDashboard) {
    return <div className="p-8">No data available</div>;
  }

  const { stats, trends, topCourses } = adminDashboard;

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-charcoal dark:to-deep-charcoal min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of your EduVers platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Users
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        {/* Students */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Students
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {stats?.totalStudents || 0}
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Courses
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {stats?.totalCourses || 0}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        {/* Enrollments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Enrollments
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {stats?.totalEnrollments || 0}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Top Courses by Enrollment
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">
                  Course Name
                </th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400">
                  Enrollments
                </th>
              </tr>
            </thead>
            <tbody>
              {topCourses?.map((course, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white">
                    {course.course?.[0]?.title || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {course.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition">
          Manage Users
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition">
          View Reports
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition">
          System Settings
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

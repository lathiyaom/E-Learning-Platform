import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Users, BookOpen, BarChart3 } from "lucide-react";
import { getAdminDashboard } from "../../../redux/Apis/analyticsApi";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-charcoal dark:to-deep-charcoal min-h-screen"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of your EduVers platform
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
        >
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
        </motion.div>

        {/* Students */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500"
        >
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
        </motion.div>

        {/* Courses */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
        >
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
        </motion.div>

        {/* Enrollments */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
        >
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
        </motion.div>
      </div>

      {/* Top Courses */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
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
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-blue-500/20 active:scale-95">
          Manage Users
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-purple-500/20 active:scale-95">
          View Reports
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-green-500/20 active:scale-95">
          System Settings
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
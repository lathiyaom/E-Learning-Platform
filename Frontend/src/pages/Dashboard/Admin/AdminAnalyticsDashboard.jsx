import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, BookOpen, TrendingUp, DollarSign, Loader2 } from "lucide-react";
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

const AdminAnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { adminDashboard, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(getAdminDashboard(user.tenantId));
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  const stats = adminDashboard || {};
  const enrollmentTrend = stats.enrollmentTrend || [];
  const coursePerformance = stats.coursePerformance || [];
  const userDistribution = stats.userDistribution || [];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 bg-slate-100 min-h-screen"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6">Admin Analytics Dashboard</motion.h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<Users />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses || 0}
          icon={<BookOpen />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalEnrollments || 0}
          icon={<TrendingUp />}
          color="bg-purple-500"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue || 0}`}
          icon={<DollarSign />}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Enrollment Trend */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Enrollment Trend</h2>
          {enrollmentTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No enrollment data available</p>
          )}
        </motion.div>

        {/* Course Performance */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Course Performance</h2>
          {coursePerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No course data available</p>
          )}
        </motion.div>
      </div>

      {/* User Distribution */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-slate-800">User Distribution</h2>
        {userDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No user distribution data available</p>
        )}
      </motion.div>
    </motion.div>
   
  );
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
    className="bg-white p-6 rounded-lg shadow flex items-center justify-between cursor-default"
  >
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1 text-slate-900">{value}</p>
    </div>
    <div className={`${color} p-3 rounded-lg text-white shadow-lg`}>{icon}</div>
  </motion.div>
);

export default AdminAnalyticsDashboard;


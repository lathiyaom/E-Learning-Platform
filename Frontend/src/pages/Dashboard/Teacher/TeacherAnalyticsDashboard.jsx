import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, BookOpen, TrendingUp, Award, Loader2 } from "lucide-react";
import { getTeacherDashboard } from "../../../redux/Apis/analyticsApi";

const TeacherAnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { teacherDashboard, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    if (user?._id || user?.id) {
      dispatch(getTeacherDashboard(user._id || user.id));
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  const stats = teacherDashboard || {};
  const attendanceTrend = stats.attendanceTrend || [];
  const studentProgress = stats.studentProgress || [];

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Teacher Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses || 0}
          icon={<BookOpen />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={<Users />}
          color="bg-green-500"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats.avgAttendance || 0}%`}
          icon={<TrendingUp />}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Rating"
          value={stats.avgRating || "N/A"}
          icon={<Award />}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Attendance Trend</h2>
          {attendanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance data available</p>
          )}
        </div>

        {/* Student Progress */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Student Progress</h2>
          {studentProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No progress data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
    <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
  </div>
);

export default TeacherAnalyticsDashboard;

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetCourseEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import AdminLayout from "../../../utils/Adminlayoute";

const TeacherAnalyticsDashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const teacherId = String(user?._id || user?.id || "");
  const { data: coursesData, isLoading } = useGetAllCoursesQuery();

  const myCourses = useMemo(() => {
    const courses = coursesData?.data || [];
    return courses.filter(
      (course) =>
        String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
        String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId,
    );
  }, [coursesData?.data, teacherId]);

  const firstCourseId = myCourses[0]?._id || myCourses[0]?.id;
  const { data: enrollmentData } = useGetCourseEnrollmentsQuery(firstCourseId, {
    skip: !firstCourseId,
  });

  const totalStudents = enrollmentData?.data?.length || 0;
  const avgRating =
    myCourses.length > 0
      ? (
          myCourses.reduce((sum, course) => sum + Number(course.rating || 0), 0) / myCourses.length
        ).toFixed(1)
      : "0.0";

  const chartData = myCourses.map((course) => ({
    name: course.title?.slice(0, 12) || "Course",
    rating: Number(course.rating || 0),
    reviews: Number(course.reviewCount || 0),
  }));

  if (isLoading) {
    return (
      <AdminLayout showSearch={false} className="p-8">
        <p>Loading analytics...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSearch={false} className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Teacher Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Courses" value={myCourses.length} icon={<BookOpen />} color="bg-blue-500" />
        <StatCard title="Total Students" value={totalStudents} icon={<Users />} color="bg-green-500" />
        <StatCard title="Avg Rating" value={avgRating} icon={<Award />} color="bg-yellow-500" />
        <StatCard
          title="Review Volume"
          value={myCourses.reduce((sum, c) => sum + Number(c.reviewCount || 0), 0)}
          icon={<TrendingUp />}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Course Ratings</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rating" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No teacher analytics available yet.</p>
        )}
      </div>
    </AdminLayout>
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

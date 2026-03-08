import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  BarChart3,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useGetMyEnrollmentsQuery } from "../../redux/Apis/enrollmentApi";
import { useGetAllCoursesQuery } from "../../redux/Apis/courseApi";
import { useGetAllUsersQuery } from "../../redux";
import { useGetPlatformStatsQuery } from "../../redux/Apis/superAdminApi";

const DashboardHome = () => {
  const { user } = useSelector((state) => state.auth || { user: null });
  const userRole = user?.userType || "student";

  const { data: myEnrollmentsData } = useGetMyEnrollmentsQuery(undefined, {
    skip: userRole !== "student",
  });
  const { data: allCoursesData } = useGetAllCoursesQuery(undefined, {
    skip: userRole !== "teacher" && userRole !== "admin",
  });
  const { data: allUsersData } = useGetAllUsersQuery(undefined, {
    skip: userRole !== "teacher" && userRole !== "admin",
  });
  const { data: platformStats } = useGetPlatformStatsQuery(undefined, {
    skip: userRole !== "superadmin",
  });

  const adminCards = [
    {
      title: "Lectures",
      description: "Manage all course lectures and materials",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      link: "/dashboard/admin/lectures",
    },
    {
      title: "Events",
      description: "Create and manage platform events",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      link: "/dashboard/admin/events",
    },
    {
      title: "Holidays",
      description: "Manage holidays and vacation days",
      icon: FileText,
      color: "from-green-500 to-green-600",
      link: "/dashboard/admin/holidays",
    },
    {
      title: "Analytics",
      description: "View platform statistics and metrics",
      icon: BarChart3,
      color: "from-orange-500 to-orange-600",
      link: "/dashboard/admin/analytics",
    },
  ];

  const teacherCards = [
    {
      title: "Lectures",
      description: "Conduct lectures and upload materials",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      link: "/dashboard/teacher/lectures",
    },
    {
      title: "Timetable",
      description: "View your course schedule",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      link: "/dashboard/teacher/timetable",
    },
    {
      title: "Analytics",
      description: "Student progress and performance metrics",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      link: "/dashboard/teacher/analytics",
    },
  ];

  const studentCards = [
    {
      title: "Explore Courses",
      description: "Browse courses from all organizations",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      link: "/Explorecourses",
    },
    {
      title: "My Enrollments",
      description: "View all your enrolled courses",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      link: "/student/enrollments",
    },
    {
      title: "Feedback",
      description: "Share feedback about courses",
      icon: MessageSquare,
      color: "from-green-500 to-green-600",
      link: "/student/feedback",
    },
  ];

  const getCards = () => {
    if (userRole === "admin" || userRole === "superadmin") return adminCards;
    if (userRole === "teacher") return teacherCards;
    return studentCards;
  };

  const cards = getCards();
  const enrollments = myEnrollmentsData?.data || [];
  const courses = allCoursesData?.data || [];
  const users = allUsersData?.users || [];

  const completedEnrollments = enrollments.filter(
    (item) => Number(item.progressPercent || item.progress || 0) >= 100,
  ).length;
  const avgProgress = enrollments.length
    ? Math.round(
        enrollments.reduce(
          (sum, item) => sum + Number(item.progressPercent || item.progress || 0),
          0,
        ) / enrollments.length,
      )
    : 0;

  const statsByRole = {
    student: [
      { label: "Enrolled Courses", value: enrollments.length, detail: "Active learning" },
      { label: "Completed", value: completedEnrollments, detail: "Finished courses" },
      { label: "Avg Progress", value: `${avgProgress}%`, detail: "Across enrollments" },
    ],
    teacher: [
      { label: "Courses", value: courses.length, detail: "Available courses" },
      {
        label: "Students",
        value: users.filter((u) => u.userType === "student").length,
        detail: "Visible in tenant",
      },
      {
        label: "Teachers",
        value: users.filter((u) => u.userType === "teacher").length,
        detail: "Team size",
      },
    ],
    admin: [
      { label: "Courses", value: courses.length, detail: "Tenant courses" },
      { label: "Users", value: users.length, detail: "Tenant users" },
      {
        label: "Teachers",
        value: users.filter((u) => u.userType === "teacher").length,
        detail: "Assignable teachers",
      },
    ],
    superadmin: [
      {
        label: "Tenants",
        value: platformStats?.data?.totalTenants ?? 0,
        detail: "Total organizations",
      },
      { label: "Users", value: platformStats?.data?.totalUsers ?? 0, detail: "Platform users" },
      {
        label: "Courses",
        value: platformStats?.data?.totalCourses ?? 0,
        detail: "Published courses",
      },
    ],
  };

  const stats = statsByRole[userRole] || [];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          {userRole === "admin" && "Manage the entire platform"}
          {userRole === "superadmin" && "Manage tenants and users"}
          {userRole === "teacher" && "Manage your courses and students"}
          {userRole === "student" && "Access your learning materials"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Dashboard Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.link}
                className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${card.color} h-24 relative overflow-hidden`}>
                  <Icon className="w-12 h-12 text-white absolute bottom-2 right-2 opacity-50" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{card.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{card.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                    <span>Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Activity</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Live activity appears here as users interact with courses, enrollments, and events.
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;

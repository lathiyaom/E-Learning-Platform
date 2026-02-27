import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BookOpen, BarChart3, Users, Calendar, FileText, MessageSquare, ArrowRight } from "lucide-react";

const DashboardHome = () => {
  const { user } = useSelector((state) => state.auth || { user: null });
  const userRole = user?.userType || "student";

  // Admin Dashboard Cards
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

  // Teacher Dashboard Cards
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

  // Student Dashboard Cards
  const studentCards = [
    {
      title: "Calendar",
      description: "View your lectures, exams, and events",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      link: "/dashboard/student/calendar",
    },
    {
      title: "Courses",
      description: "View all your enrolled courses",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
      link: "/dashboard/student/courses",
    },
    {
      title: "Feedback",
      description: "Share feedback about courses",
      icon: MessageSquare,
      color: "from-green-500 to-green-600",
      link: "/dashboard/student/feedback",
    },
  ];

  const getCards = () => {
    if (userRole === "admin" || userRole === "superadmin") return adminCards;
    if (userRole === "teacher") return teacherCards;
    return studentCards;
  };

  const cards = getCards();

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {userRole === "student" ? "Enrolled Courses" : "Active Items"}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {userRole === "student" ? "Assignments" : "Tasks"}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">42</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {userRole === "student" ? "Modules" : "Completed"}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Rating</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">4.7</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">⭐ Excellent</p>
        </div>
      </div>

      {/* Dashboard Modules */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Dashboard Modules
        </h2>
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
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    {card.description}
                  </p>
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

      {/* Recent Activity */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {userRole === "student"
                      ? `Completed Assignment ${i}`
                      : `New Feedback Received`}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {i} hour{i > 1 ? "s" : ""} ago
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                  {userRole === "student" ? "Done" : "New"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
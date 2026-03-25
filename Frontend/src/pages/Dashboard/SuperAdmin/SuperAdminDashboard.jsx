import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetPlatformStatsQuery } from "../../../redux/Apis/superAdminApi";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import {
  Users,
  Building,
  BookOpen,
  TrendingUp,
  UserCheck,
  UserX,
  Shield,
  AlertCircle,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, trend, color = "blue", subtitle }) => {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetPlatformStatsQuery();

  const stats = data?.data || {};

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError) {
    return (
      <SuperAdminLayout pageTitle="Dashboard">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-red-700 dark:text-red-300">
            {error?.data?.message || "Something went wrong"}
          </p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout pageTitle="Platform Overview" subheader="Control center for the full platform">
      {/* Welcome Section */}
      <div className="bg-primary rounded-2xl p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Super Admin!</h2>
        <p className="text-blue-100">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Institutions"
          value={stats.tenants?.total || 0}
          icon={Building}
          color="blue"
          subtitle={`${stats.tenants?.active || 0} active`}
        />
        <StatCard
          title="Total Users"
          value={stats.users?.total || 0}
          icon={Users}
          color="green"
          subtitle={`${stats.users?.active || 0} active`}
        />
        <StatCard
          title="Total Courses"
          value={stats.courses?.total || 0}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Super Admins"
          value={stats.tenants?.superadmins || 0}
          icon={Shield}
          color="orange"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tenant Status Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Institution Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Active
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Fully operational
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.tenants?.active || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Inactive
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Temporarily disabled
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.tenants?.inactive || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Suspended
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Access revoked
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.tenants?.suspended || 0}
              </span>
            </div>
          </div>
        </div>

        {/* User Type Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            User Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Students
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enrolled learners
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.users?.students || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Teachers
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Course instructors
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.users?.teachers || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Admins
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Institution admins
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.users?.admins || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/superadmin/tenants")}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <Building className="h-6 w-6 text-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900 dark:text-white">
                Manage Institutions
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                View and manage all institutions
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/superadmin/users")}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
          >
            <Users className="h-6 w-6 text-green-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900 dark:text-white">
                View All Users
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Platform-wide user management
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/superadmin/analytics")}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
          >
            <TrendingUp className="h-6 w-6 text-purple-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900 dark:text-white">
                Analytics
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                View platform insights
              </p>
            </div>
          </button>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;

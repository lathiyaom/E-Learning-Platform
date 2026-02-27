import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { useGetPlatformStatsQuery } from "../../../redux/Apis/superAdminApi";
import {
  TrendingUp,
  Users,
  Building,
  BookOpen,
  AlertCircle,
  Activity,
  BarChart3,
} from "lucide-react";

const Analytics = () => {
  const { data, isLoading, isError, error } = useGetPlatformStatsQuery();
  const stats = data?.data || {};

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError) {
    return (
      <SuperAdminLayout pageTitle="Analytics">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
            Failed to Load Analytics
          </h3>
          <p className="text-red-700 dark:text-red-300">
            {error?.data?.message || "Something went wrong"}
          </p>
        </div>
      </SuperAdminLayout>
    );
  }

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <SuperAdminLayout pageTitle="Platform Analytics" showSearch={false}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Building className="h-8 w-8 opacity-80" />
            <Activity className="h-5 w-5 opacity-60" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Institutions</p>
          <p className="text-4xl font-bold">{stats.tenants?.total || 0}</p>
          <p className="text-blue-100 text-xs mt-2">
            {stats.tenants?.active || 0} active
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-80" />
            <TrendingUp className="h-5 w-5 opacity-60" />
          </div>
          <p className="text-green-100 text-sm mb-1">Total Users</p>
          <p className="text-4xl font-bold">{stats.users?.total || 0}</p>
          <p className="text-green-100 text-xs mt-2">
            {stats.users?.active || 0} active
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="h-8 w-8 opacity-80" />
            <BarChart3 className="h-5 w-5 opacity-60" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Total Courses</p>
          <p className="text-4xl font-bold">{stats.courses?.total || 0}</p>
          <p className="text-purple-100 text-xs mt-2">Platform-wide</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-80" />
            <Activity className="h-5 w-5 opacity-60" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Avg Users/Institution</p>
          <p className="text-4xl font-bold">
            {stats.tenants?.total
              ? Math.round(stats.users?.total / stats.tenants?.total)
              : 0}
          </p>
          <p className="text-orange-100 text-xs mt-2">Per institution</p>
        </div>
      </div>

      {/* Institution Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Institution Status Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.tenants?.active || 0} (
                  {calculatePercentage(
                    stats.tenants?.active,
                    stats.tenants?.total
                  )}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculatePercentage(
                      stats.tenants?.active,
                      stats.tenants?.total
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Inactive
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.tenants?.inactive || 0} (
                  {calculatePercentage(
                    stats.tenants?.inactive,
                    stats.tenants?.total
                  )}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculatePercentage(
                      stats.tenants?.inactive,
                      stats.tenants?.total
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Suspended
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.tenants?.suspended || 0} (
                  {calculatePercentage(
                    stats.tenants?.suspended,
                    stats.tenants?.total
                  )}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculatePercentage(
                      stats.tenants?.suspended,
                      stats.tenants?.total
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Type Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            User Type Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Students
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.users?.students || 0} (
                  {calculatePercentage(stats.users?.students, stats.users?.total)}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculatePercentage(
                      stats.users?.students,
                      stats.users?.total
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teachers
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.users?.teachers || 0} (
                  {calculatePercentage(stats.users?.teachers, stats.users?.total)}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculatePercentage(
                      stats.users?.teachers,
                      stats.users?.total
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Admins
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.users?.admins || 0} (
                  {calculatePercentage(stats.users?.admins, stats.users?.total)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculatePercentage(
                      stats.users?.admins,
                      stats.users?.total
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Key Platform Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Super Admins
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.tenants?.superadmins || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Elevated privileges
            </p>
          </div>

          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Active Users
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.users?.active || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Currently active
            </p>
          </div>

          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              User Engagement
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {calculatePercentage(stats.users?.active, stats.users?.total)}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Active rate
            </p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Analytics;

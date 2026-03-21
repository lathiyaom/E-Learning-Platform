import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { useGetPlatformUsersQuery, useGetPlatformStatsQuery } from "../../../redux/Apis/superAdminApi";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  Calendar,
  AlertCircle,
  Download,
} from "lucide-react";

const UserManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;
  
  const [localFilters, setLocalFilters] = useState({
    searchTerm: searchParams.get("search") || '',
    roleFilter: searchParams.get("role") || 'all',
    statusFilter: searchParams.get("status") || 'all'
  });
  
  const { data, isLoading, isError, error, refetch } = useGetPlatformUsersQuery({
    page: pageParam,
    limit: 20,
    search: localFilters.searchTerm,
    roleFilter: localFilters.roleFilter,
    statusFilter: localFilters.statusFilter
  });

  const { data: statsData } = useGetPlatformStatsQuery();
  const stats = statsData?.data || { users: { total: 0, students: 0, teachers: 0, admins: 0 } };

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (localFilters.searchTerm) params.set('search', localFilters.searchTerm);
    else params.delete('search');
    if (localFilters.roleFilter !== 'all') params.set('role', localFilters.roleFilter);
    else params.delete('role');
    if (localFilters.statusFilter !== 'all') params.set('status', localFilters.statusFilter);
    else params.delete('status');
    params.set('page', String(pageParam));
    
    setSearchParams(params, { replace: true });
  }, [localFilters, pageParam, setSearchParams]);

  const updateFilters = (updates) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const getRoleBadge = (role) => {
    const styles = {
      superadmin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      teacher: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      student: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return styles[role?.toLowerCase()] || styles.student;
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "Institution", "Status", "Created At"];
    const rows = users.map((user) => [
      user.name || "N/A",
      user.email,
      user.userType,
      user.institutionName || "N/A",
      user.isActive ? "Active" : "Inactive",
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError) {
    return (
      <SuperAdminLayout pageTitle="User Management">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
            Failed to Load Users
          </h3>
          <p className="text-red-700 dark:text-red-300">
            {error?.data?.message || "Something went wrong"}
          </p>
        </div>
      </SuperAdminLayout>
    );
  }

  const pageTitle = localFilters.roleFilter === "teacher" 
    ? "Teachers Management" 
    : localFilters.roleFilter === "student" 
      ? "Students Management" 
      : "User Management";

  return (
    <SuperAdminLayout pageTitle={pageTitle} showSearch={false}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Total Users
              </p>
  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.users.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Students
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.users.students}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Teachers
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.users.teachers}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Admins
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.users.admins ?? (stats.users.total - stats.users.students - stats.users.teachers)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or institution..."
              value={localFilters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={localFilters.roleFilter}
              onChange={(e) => updateFilters({ roleFilter: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={localFilters.statusFilter}
              onChange={(e) => updateFilters({ statusFilter: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
  <p className="text-slate-600 dark:text-slate-400">
            Showing {users.length} of {pagination.total || 0} users
          </p>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">
                      No users found
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user.name || "N/A"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            ID: {user._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.userType)}`}
                      >
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-900 dark:text-white">
                          {user.institutionName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default UserManagement;

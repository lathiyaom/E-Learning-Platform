import { useParams, useNavigate } from "react-router-dom";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { useGetTenantWithUsersQuery } from "../../../redux/Apis/superAdminApi";
import {
  Building,
  Mail,
  Phone,
  Calendar,
  Users,
  BookOpen,
  Shield,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetTenantWithUsersQuery(id);

  const tenant = data?.data?.tenant;
  const users = data?.data?.users || [];

  const getRoleBadge = (role) => {
    const styles = {
      SUPERADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      TEACHER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      STUDENT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return styles[role] || styles.STUDENT;
  };

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Institution Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError || !tenant) {
    return (
      <SuperAdminLayout pageTitle="Institution Details">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
            Failed to Load Institution
          </h3>
          <p className="text-red-700 dark:text-red-300">
            {error?.data?.message || "Institution not found"}
          </p>
          <button
            onClick={() => navigate("/superadmin/tenants")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            Back to Institutions
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  const usersByRole = {
    students: users.filter((u) => u.userType === "STUDENT").length,
    teachers: users.filter((u) => u.userType === "TEACHER").length,
    admins: users.filter((u) => u.userType === "ADMIN" || u.userType === "SUPERADMIN").length,
  };

  return (
    <SuperAdminLayout pageTitle="Institution Details" showSearch={false}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/superadmin/tenants")}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Institutions
      </button>

      {/* Institution Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {tenant.institutionName || "N/A"}
              </h2>
              <p className="text-blue-100">
                Managed by {tenant.name}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                tenant.userType === "SUPERADMIN"
                  ? "bg-purple-500/20 text-white"
                  : "bg-blue-500/20 text-white"
              }`}
            >
              {tenant.userType}
            </span>
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${
                tenant.status === "active"
                  ? "bg-green-500/20 text-white"
                  : tenant.status === "suspended"
                  ? "bg-red-500/20 text-white"
                  : "bg-yellow-500/20 text-white"
              }`}
            >
              {tenant.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Total Users
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {users.length}
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
                Active Users
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {users.filter((u) => u.isActive).length}
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
                Member Since
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Institution Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Institution Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="text-slate-900 dark:text-white font-medium">
                {tenant.email}
              </p>
            </div>
          </div>

          {tenant.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                <p className="text-slate-900 dark:text-white font-medium">
                  {tenant.phone}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
              <p className="text-slate-900 dark:text-white font-medium">
                {tenant.userType}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last Login</p>
              <p className="text-slate-900 dark:text-white font-medium">
                {tenant.lastLogin
                  ? new Date(tenant.lastLogin).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          User Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">
                Students
              </p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {usersByRole.students}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                Teachers
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {usersByRole.teachers}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                Admins
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {usersByRole.admins}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Users ({users.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Role
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
                  <td colSpan="5" className="px-6 py-12 text-center">
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.userType)}`}
                      >
                        {user.userType}
                      </span>
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
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
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

export default TenantDetail;

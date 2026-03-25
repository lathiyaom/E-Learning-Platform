import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { useGetPlatformUsersQuery } from "../../../redux/Apis/superAdminApi";
import {
  Users,
  Mail,
  Phone,
  Building,
  Calendar,
  AlertCircle,
} from "lucide-react";

const StudentManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;

  const [localFilters, setLocalFilters] = useState({
    searchTerm: searchParams.get("search") || '',
    statusFilter: searchParams.get("status") || 'all'
  });

  const { data, isLoading, isError, error } = useGetPlatformUsersQuery({
    page: pageParam,
    limit: 20,
    search: localFilters.searchTerm,
    roleFilter: 'student',
    statusFilter: localFilters.statusFilter
  });

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (localFilters.searchTerm) params.set('search', localFilters.searchTerm);
    else params.delete('search');
    if (localFilters.statusFilter !== 'all') params.set('status', localFilters.statusFilter);
    else params.delete('status');
    params.set('page', String(pageParam));

    setSearchParams(params, { replace: true });
  }, [localFilters, pageParam, setSearchParams]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Students Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-premium-gold"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError) {
    return (
      <SuperAdminLayout pageTitle="Students Management">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
            Failed to Load Students
          </h3>
          <p className="text-red-700 dark:text-red-300">
            {error?.data?.message || "Something went wrong"}
          </p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout pageTitle="Students Management" showSearch={false}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or institution..."
                value={localFilters.searchTerm}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-premium-gold focus:border-primary dark:focus:border-premium-gold"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={localFilters.statusFilter}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
                className="w-full sm:w-40 pl-8 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-premium-gold focus:border-primary dark:focus:border-premium-gold"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="p-4">User</th>
                <th scope="col" className="p-4">Contact</th>
                <th scope="col" className="p-4">Institution</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-premium-gold/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary dark:text-premium-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        {/* <p className="text-xs text-slate-500">ID: {user._id}</p> */}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{user.institutionName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default StudentManagement;

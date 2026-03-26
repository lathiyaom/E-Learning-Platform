import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import {
  useGetPlatformUsersQuery,
  useGetPlatformStatsQuery,
} from "../../../redux/Apis/superAdminApi";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../components/table";
import { DataTablePagination } from "../../../components/data-table-pagination";
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
  Shield,
  UserCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for Role Badges
const getRoleStyle = (role) => {
  const styles = {
    superadmin: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200/50 dark:border-purple-800/30",
      icon: Shield,
    },
    admin: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200/50 dark:border-blue-800/30",
      icon: UserCheck,
    },
    teacher: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      icon: Zap,
    },
    student: {
      bg: "bg-superadminprimary/10 dark:bg-superadminprimary/20",
      text: "text-superadminprimary dark:text-superadminprimary",
      border: "border-superadminprimary/20 dark:border-superadminprimary/30",
      icon: Users,
    },
  };
  return styles[role?.toLowerCase()] || styles.student;
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white dark:bg-premium-surface rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${colorClass}`}>
      <Icon className="w-24 h-24" />
    </div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
          {value.toLocaleString()}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('text-white', '')}/20 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
);

// Create an animated TableRow
const MotionTableRow = motion.create(TableRow);

const UserManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;
  const limitParam = parseInt(searchParams.get("limit")) || 10;

  const [localFilters, setLocalFilters] = useState({
    searchTerm: searchParams.get("search") || "",
    roleFilter: searchParams.get("role") || "all",
    statusFilter: searchParams.get("status") || "all",
  });

  const [limit, setLimit] = useState(limitParam);

  const { data, isLoading, isError, error } = useGetPlatformUsersQuery({
    page: pageParam,
    limit: limit, // Matching default pageSizeOptions from DataTablePagination if needed
    search: localFilters.searchTerm,
    roleFilter: localFilters.roleFilter,
    statusFilter: localFilters.statusFilter,
  });

  const { data: statsData } = useGetPlatformStatsQuery(localFilters.roleFilter);
  const stats = statsData?.data || {
    users: { total: 0, students: 0, teachers: 0, admins: 0 },
  };

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (localFilters.searchTerm) params.set("search", localFilters.searchTerm);
    else params.delete("search");
    if (localFilters.roleFilter !== "all") params.set("role", localFilters.roleFilter);
    else params.delete("role");
    if (localFilters.statusFilter !== "all") params.set("status", localFilters.statusFilter);
    else params.delete("status");
    params.set("page", String(pageParam));
    params.set("limit", String(limit));

    setSearchParams(params, { replace: true });
  }, [localFilters, pageParam, limit, setSearchParams]);

  const updateFilters = (updates) => {
    setLocalFilters((prev) => ({ ...prev, ...updates }));
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.set("limit", String(newLimit));
    setSearchParams(params);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "Institution", "Status", "Joined At"];
    const rows = users.map((user) => [
      user.name || "N/A",
      user.email,
      user.userType,
      user.institutionName || "N/A",
      user.isActive ? "Active" : "Inactive",
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-platform-${Date.now()}.csv`;
    a.click();
  };

  // Adapter for common DataTablePagination
  const tableInstance = {
    getFilteredRowModel: () => ({ rows: { length: pagination.total || 0 } }),
    getFilteredSelectedRowModel: () => ({ rows: [] }), 
    getState: () => ({
      pagination: {
        pageIndex: pageParam - 1,
        pageSize: limit,
      },
    }),
    getPageCount: () => pagination.pages || pagination.totalPages || 1,
    getCanPreviousPage: () => pageParam > 1,
    getCanNextPage: () => pageParam < (pagination.pages || pagination.totalPages || 1),
    setPageIndex: (index) => handlePageChange(index + 1),
    previousPage: () => handlePageChange(pageParam - 1),
    nextPage: () => handlePageChange(pageParam + 1),
    setPageSize: (size) => handleLimitChange(size),
  };

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="User Directory">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="h-12 w-12 border-4 border-superadminprimary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Accessing platform vault...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError) {
    return (
      <SuperAdminLayout pageTitle="Error Management">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center max-w-lg mx-auto mt-10">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-red-900 dark:text-red-200 mb-2 uppercase tracking-tight">Access Protocol Failure</h3>
          <p className="text-sm text-red-700 dark:text-red-300 font-medium italic mb-6">
            We encountered an issue synchronizing with the user registry: {error?.data?.message || "Connection intermittent"}
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
            Re-Authorize Connection
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout 
      pageTitle={localFilters.roleFilter === 'all' ? "User Directory" : `${localFilters.roleFilter}s Directory`} 
      breadcrumbItems={breadcrumbPaths.SUPERADMIN_USERS}
      showSearch={false}
    >
      <div className="space-y-8 pb-20">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Registry" value={stats.users.total} icon={Users} colorClass="text-blue-500" delay={0.05} />
          <StatCard title="Total Students" value={stats.users.students} icon={Users} colorClass="text-superadminprimary" delay={0.1} />
          <StatCard title="Total Teachers" value={stats.users.teachers} icon={Zap} colorClass="text-emerald-500" delay={0.15} />
          <StatCard title="Total Admins" value={stats.users.admins || 0} icon={Shield} colorClass="text-purple-500" delay={0.2} />
        </div>

        {/* Toolbar Section */}
        <div className="bg-white dark:bg-premium-surface rounded-3xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 shadow-sm flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-superadminprimary transition-colors" />
            <input
              type="text"
              placeholder="Filter by name, identifier, or email signature..."
              value={localFilters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-superadminprimary/30 transition-all dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto p-1 lg:p-0">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={localFilters.roleFilter}
                onChange={(e) => updateFilters({ roleFilter: e.target.value })}
                className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none focus:ring-2 focus:ring-superadminprimary/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="superadmin">SuperAdmin</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={localFilters.statusFilter}
                onChange={(e) => updateFilters({ statusFilter: e.target.value })}
                className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none focus:ring-2 focus:ring-superadminprimary/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">Any Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="px-5 py-2.5 bg-superadminprimary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-superadminprimary/20 flex items-center justify-center gap-2 ml-auto sm:ml-0"
            >
              <Download className="h-3.5 w-3.5" />
              EXPORT
            </button>
          </div>
        </div>

        {/* Directory Table Using Common Components */}
        <div className="bg-white dark:bg-premium-surface rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100/50 dark:bg-slate-900/50 border-none">
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Profile / Identity</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Contact Access</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Assigned Role</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Organization</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Protocols</TableHead>
                <TableHead className="px-6 py-5 text-right text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Registry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence mode="popLayout text-center">
                {users.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="px-10 py-32 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-4 mx-auto w-full">
                        <UploaderIllustration className="w-24 h-24 text-slate-200 dark:text-slate-800" />
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No Operatives Found</p>
                          <p className="text-xs text-slate-500 font-medium italic mt-1 max-w-[300px] mx-auto">Try adjusting your filters to broaden the search within the digital registry.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, idx) => {
                    const roleStyle = getRoleStyle(user.userType);
                    const RoleIcon = roleStyle.icon;
                    
                    return (
                      <MotionTableRow 
                        key={user._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group border-slate-100 dark:border-slate-800/50"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-superadminprimary/10 group-hover:text-superadminprimary transition-all relative overflow-hidden">
                              <span className="relative z-10 select-none">{user.name?.charAt(0) || "U"}</span>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight capitalize">{user.name || "Unknown Identity"}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium font-mono uppercase mt-0.5 tracking-tighter">ID: {user._id.slice(-12)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-superadminprimary transition-colors">
                              <Mail className="h-3 w-3 opacity-50" />
                              <span className="select-all">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                <Phone className="h-2.5 w-2.5 opacity-50" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border} shadow-sm shadow-black/5`}>
                            <RoleIcon className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-wider">{user.userType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Building className="h-3.5 w-3.5 text-slate-300" />
                            <span className="capitalize">{user.institutionName || "Global Platform"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                              {user.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="inline-flex flex-col items-end">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                              <Calendar className="h-3 w-3 text-slate-300" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Synced in logs</p>
                          </div>
                        </TableCell>
                      </MotionTableRow>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
          
          {/* Using Common DataTablePagination Component */}
          <DataTablePagination 
            table={tableInstance} 
            showPageSize={true}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            className="border-none bg-slate-50/30 dark:bg-transparent py-4 px-6"
          />
        </div>

        {/* System Footer Log */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="flex items-center gap-4 text-left">
            <div className="h-10 w-10 aspect-square rounded-full bg-superadminprimary flex items-center justify-center text-white font-black text-xl select-none">E</div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">EduVerse Platform Registry</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span className="hover:text-superadminprimary cursor-pointer">Security Protocol v4.2</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer">Live Audit Trail</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer">Encryption Enabled</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Build 2026.03 | SuperAdmin Encrypted Access</p>
          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

// Placeholder for missing illustration to prevent errors
const UploaderIllustration = ({ className }) => (
  <div className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  </div>
);

export default UserManagement;

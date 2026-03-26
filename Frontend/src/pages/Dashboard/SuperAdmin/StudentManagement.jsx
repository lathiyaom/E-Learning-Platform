import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import { useGetPlatformUsersQuery } from "../../../redux/Apis/superAdminApi";
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
  Zap,
  Shield,
  Clock,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionTableRow = motion.create(TableRow);

const StudentManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;
  const limitParam = parseInt(searchParams.get("limit")) || 10;

  const [localFilters, setLocalFilters] = useState({
    searchTerm: searchParams.get("search") || "",
    statusFilter: searchParams.get("status") || "all",
  });

  const [limit, setLimit] = useState(limitParam);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetPlatformUsersQuery({
    page: pageParam,
    limit: limit,
    search: localFilters.searchTerm,
    roleFilter: "student",
    statusFilter: localFilters.statusFilter,
  });

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (localFilters.searchTerm) params.set("search", localFilters.searchTerm);
    else params.delete("search");
    if (localFilters.statusFilter !== "all") params.set("status", localFilters.statusFilter);
    else params.delete("status");
    params.set("page", String(pageParam));
    params.set("limit", String(limit));

    setSearchParams(params, { replace: true });
  }, [localFilters, pageParam, limit, setSearchParams]);

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

  if (isLoading && !isFetching) {
    return (
      <SuperAdminLayout pageTitle="Student Directory">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="h-12 w-12 border-4 border-superadminprimary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Accessing Platform Student Records...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout
      pageTitle="Students Management"
      showSearch={false}
      breadcrumbItems={breadcrumbPaths.SUPERADMIN_STUDENTS}
    >
      <div className="space-y-8 pb-20">
        
        {/* Toolbar Section */}
        <div className="bg-white dark:bg-premium-surface rounded-3xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 shadow-sm flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-superadminprimary transition-colors" />
            <input
              type="text"
              placeholder="Search pupils by name, email, or institution..."
              value={localFilters.searchTerm}
              onChange={(e) => {
                setLocalFilters(prev => ({ ...prev, searchTerm: e.target.value }));
                handlePageChange(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-superadminprimary/30 transition-all dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto p-1 lg:p-0">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={localFilters.statusFilter}
                onChange={(e) => {
                    setLocalFilters(prev => ({ ...prev, statusFilter: e.target.value }));
                    handlePageChange(1);
                }}
                className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none focus:ring-2 focus:ring-superadminprimary/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">Any Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
               onClick={() => refetch()}
               className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ml-auto sm:ml-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              RELOAD
            </button>
          </div>
        </div>

        {/* Directory Table Using Common Components */}
        <div className="bg-white dark:bg-premium-surface rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100/50 dark:bg-slate-900/50 border-none">
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Student Learner</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Contact Access</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Institution Hub</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Status Tier</TableHead>
                <TableHead className="px-6 py-5 text-right text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence mode="popLayout">
                {users.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="px-10 py-32 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-4 mx-auto w-full">
                        <Users className="w-24 h-24 text-slate-200 dark:text-slate-800" />
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No Pupils Detected</p>
                          <p className="text-xs text-slate-500 font-medium italic mt-1 max-w-[300px] mx-auto">Try refining your search parameters within the student manifold.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, idx) => {
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
                            <div className="h-11 w-11 rounded-2xl bg-superadminprimary/10 flex items-center justify-center font-black text-superadminprimary group-hover:bg-superadminprimary group-hover:text-white transition-all relative overflow-hidden">
                              <span className="relative z-10 select-none">
                                {user.name?.charAt(0) || "S"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight capitalize">
                                {user.name || "N/A"}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium font-mono uppercase mt-0.5 tracking-tighter">
                                ID: {user._id.slice(-8)}
                              </p>
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
                                   <Phone className="h-3 w-3" />
                                   <span>{user.phone}</span>
                                </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            <span className="capitalize">{user.institutionName || "Platform Global"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${user.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-rose-500/10 text-rose-600 border-rose-200'}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{user.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Enrollment Confirmed</p>
                            </div>
                        </TableCell>
                      </MotionTableRow>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
          
          <DataTablePagination 
            table={tableInstance} 
            showPageSize={true}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            className="border-none bg-slate-50/30 dark:bg-transparent py-4 px-6"
          />
        </div>

        {/* System Footer Log */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all text-center md:text-left">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 aspect-square rounded-full bg-superadminprimary flex items-center justify-center text-white font-black text-xl select-none">S</div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">EduVerse Student Registry</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span className="hover:text-superadminprimary cursor-pointer">Global Encryption Active</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer">Student Data Verified</span>
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed font-mono">Platform Build 2026.03 | Active Learner Management</p>
          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default StudentManagement;

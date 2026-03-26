import { useState, useMemo, useEffect } from "react";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import { useGetAllTeachersQuery } from "../../../redux/Apis/superAdminApi";
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
  Calendar,
  Zap,
  Shield,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for Status Badges
const getAvailabilityConfig = (isPending) => {
  return isPending 
    ? {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200/50 dark:border-blue-800/30",
      label: "PENDING INVITE",
      icon: RefreshCw,
    }
    : {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      label: "AVAILABLE",
      icon: Zap,
    };
};

const MotionTableRow = motion.create(TableRow);

const TeacherManagement = () => {
  const [search, setSearch] = useState("");
  const [dateSort, setDateSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [unassignedOnly, setUnassignedOnly] = useState(true);

  const {
    data: teachersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllTeachersQuery({
    search,
    page,
    limit,
    unassignedOnly,
  });

  const rawTeachers = teachersData?.data || [];
  const pagination = teachersData?.pagination || {};

  const teachers = useMemo(() => {
    return [...rawTeachers].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return dateSort === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [rawTeachers, dateSort]);

  const handlePageChange = (newPage) => setPage(newPage);
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Adapter for common DataTablePagination
  const tableInstance = {
    getFilteredRowModel: () => ({ rows: { length: pagination.total || 0 } }),
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getState: () => ({
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    }),
    getPageCount: () => pagination.pages || pagination.totalPages || 1,
    getCanPreviousPage: () => page > 1,
    getCanNextPage: () => page < (pagination.pages || pagination.totalPages || 1),
    setPageIndex: (index) => handlePageChange(index + 1),
    previousPage: () => handlePageChange(p => Math.max(1, p - 1)),
    nextPage: () => handlePageChange(p => p + 1),
    setPageSize: (size) => handleLimitChange(size),
  };

  if (isLoading && !isFetching) {
    return (
      <SuperAdminLayout pageTitle="Teacher Directory">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="h-12 w-12 border-4 border-superadminprimary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Filtering Global Talent Registry...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout 
      pageTitle="Teacher Management" 
      breadcrumbItems={breadcrumbPaths.SUPERADMIN_TEACHERS}
      showSearch={false}
    >
      <div className="space-y-8 pb-20">
        
        {/* Toolbar Section */}
        <div className="bg-white dark:bg-premium-surface rounded-3xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 shadow-sm flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-superadminprimary transition-colors" />
            <input
              type="text"
              placeholder="Locate teachers by name, qualification, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-superadminprimary/30 transition-all dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto p-1 lg:p-0">
            <div className="relative w-full sm:w-auto">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none focus:ring-2 focus:ring-superadminprimary/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={String(unassignedOnly)}
                onChange={(e) => {
                    setUnassignedOnly(e.target.value === "true");
                    setPage(1);
                }}
                className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none focus:ring-2 focus:ring-superadminprimary/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="true">Unassigned Talent</option>
                <option value="false">All Registered</option>
              </select>
            </div>

            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ml-auto sm:ml-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              RE-SYNC
            </button>
          </div>
        </div>

        {/* Directory Table Using Common Components */}
        <div className="bg-white dark:bg-premium-surface rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100/50 dark:bg-slate-900/50 border-none">
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Expert Identity</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Contact Access</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Mobile Signature</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Registry Date</TableHead>
                <TableHead className="px-6 py-5 text-right text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Deployment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence mode="popLayout">
                {teachers.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="px-10 py-32 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-4 mx-auto w-full">
                        <Users className="w-24 h-24 text-slate-200 dark:text-slate-800" />
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No Experts Available</p>
                          <p className="text-xs text-slate-500 font-medium italic mt-1 max-w-[300px] mx-auto">No teachers match the current filter parameters in the global directory.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher, idx) => {
                    const isPending = !!teacher.pendingOrgInvitation?.expiresAt;
                    const availCfg = getAvailabilityConfig(isPending);
                    const StatusIcon = availCfg.icon;
                    
                    return (
                      <MotionTableRow 
                        key={teacher._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group border-slate-100 dark:border-slate-800/50"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-2xl bg-superadminprimary/10 flex items-center justify-center font-black text-superadminprimary group-hover:bg-superadminprimary group-hover:text-white transition-all relative overflow-hidden">
                              <span className="relative z-10 select-none">
                                {teacher.firstName?.charAt(0) || "T"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight capitalize">
                                {teacher.firstName} {teacher.lastName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium font-mono uppercase mt-0.5 tracking-tighter">
                                Expert ID: {teacher._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-superadminprimary transition-colors">
                            <Mail className="h-3 w-3 opacity-50" />
                            <span className="select-all">{teacher.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                             <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{teacher.phoneNo || "Non-Disclosed"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {new Date(teacher.createdAt).toLocaleDateString()}
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${availCfg.bg} ${availCfg.text} ${availCfg.border} shadow-sm group-hover:scale-105 transition-transform`}>
                            <StatusIcon className={`h-3 w-3 ${isPending ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{availCfg.label}</span>
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
            pageSizeOptions={[5, 10, 20, 50]}
            className="border-none bg-slate-50/30 dark:bg-transparent py-4 px-6"
          />
        </div>

        {/* System Footer Log */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all text-center md:text-left">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 aspect-square rounded-full bg-superadminprimary flex items-center justify-center text-white font-black text-xl select-none">T</div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">EduVerse Talent Directory</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span className="hover:text-superadminprimary cursor-pointer">Protocol Secure Access</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer">Verified Qualifications</span>
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Platform Build 2026.03 | SuperAdmin Talent Deployment Hub</p>
          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default TeacherManagement;

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import { useGetTenantWithUsersQuery } from "../../../redux/Apis/superAdminApi";
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
  Building,
  Mail,
  Phone,
  Calendar,
  Users,
  BookOpen,
  Shield,
  Search,
  ArrowLeft,
  AlertCircle,
  Zap,
  Globe,
  Clock,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getRoleConfig = (role) => {
  const configs = {
    SUPERADMIN: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200/50 dark:border-purple-800/30",
    },
    ADMIN: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200/50 dark:border-blue-800/30",
    },
    TEACHER: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
    },
    STUDENT: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200/50 dark:border-amber-800/30",
    },
  };
  return configs[role] || configs.STUDENT;
};

const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white dark:bg-premium-surface rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
  >
    <div className={`absolute -right-3 -bottom-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${colorClass}`}>
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').split(' ')[0]}/10 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{title}</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {value.toLocaleString()}
        </h3>
      </div>
    </div>
  </motion.div>
);

const MotionTableRow = motion.create(TableRow);

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetTenantWithUsersQuery(id);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const tenant = data?.data?.tenant;
  const rawUsers = data?.data?.users || [];

  const users = useMemo(() => {
     if (!search) return rawUsers;
     return rawUsers.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
     );
  }, [rawUsers, search]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return users.slice(start, start + limit);
  }, [users, page, limit]);

  const totalPages = Math.ceil(users.length / limit) || 1;

  const usersByRole = {
    students: rawUsers.filter((u) => u.userType === "STUDENT").length,
    teachers: rawUsers.filter((u) => u.userType === "TEACHER").length,
    admins: rawUsers.filter((u) => u.userType === "ADMIN" || u.userType === "SUPERADMIN").length,
  };

  const handlePageChange = (p) => setPage(p);
  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
  };

  const tableInstance = {
    getFilteredRowModel: () => ({ rows: { length: users.length } }),
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getState: () => ({ pagination: { pageIndex: page - 1, pageSize: limit } }),
    getPageCount: () => totalPages,
    getCanPreviousPage: () => page > 1,
    getCanNextPage: () => page < totalPages,
    setPageIndex: (i) => handlePageChange(i + 1),
    previousPage: () => handlePageChange(p => Math.max(1, p - 1)),
    nextPage: () => handlePageChange(p => Math.min(totalPages, p + 1)),
    setPageSize: (s) => handleLimitChange(s),
  };

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Institution Probe">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="h-12 w-12 border-4 border-superadminprimary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Decrypting Hub Architecture...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError || !tenant) {
    return (
      <SuperAdminLayout pageTitle="Protocol Error" breadcrumbItems={breadcrumbPaths.SUPERADMIN_TENANTS}>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl backdrop-blur-sm">
          <div className="h-20 w-20 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Access Denied / Hub Not Found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">The requested institutional node is either off any known grid or your clearance level is insufficient.</p>
          <button
            onClick={() => navigate("/superadmin/tenants")}
            className="px-8 py-3 bg-superadminprimary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-superadminprimary/20"
          >
            RETURN TO COMMAND CENTER
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout
      pageTitle="Hub Detail"
      showSearch={false}
      breadcrumbItems={breadcrumbPaths.SUPERADMIN_TENANT_DETAIL(tenant?.name || "Institution Details")}
    >
      <div className="space-y-8 pb-20">
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate("/superadmin/tenants")}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-superadminprimary transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-superadminprimary/10 transition-colors">
               <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Grid
          </button>
          
          <div className="flex items-center gap-3">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Online</span>
          </div>
        </div>

        {/* Premium Header Card */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[2.5rem] p-8 sm:p-12 overflow-hidden bg-slate-900 border border-slate-800"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-superadminprimary/20 via-transparent to-blue-500/10 opacity-50" />
            <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-3 z-0 overflow-hidden text-slate-100/5 select-none pointer-events-none">
                <Building className="h-64 w-64 -mr-20 -mt-20 transform rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6 sm:gap-8">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-superadminprimary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Building className="h-10 w-10 sm:h-12 sm:w-12 text-white relative z-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tight">
                                {tenant.name || "N/A"}
                             </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-slate-400 font-mono text-xs font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Platform Global Hub</span>
                            <span className="h-1 w-1 rounded-full bg-slate-700" />
                            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-superadminprimary" /> Verified Tier</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-superadminprimary/10 backdrop-blur-md border border-superadminprimary/30 text-superadminprimary text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-superadminprimary/5">
                        Security: {tenant.userType}
                    </div>
                    <div className={`px-6 py-3 rounded-2xl backdrop-blur-md border text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                        tenant.status === 'active' 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                    }`}>
                        <span className="flex items-center gap-2">
                             <div className={`h-1.5 w-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                             Status: {tenant.status}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Operative Population" value={rawUsers.length} icon={Users} colorClass="text-blue-500" delay={0.05} />
          <StatCard title="Active Transmissions" value={rawUsers.filter(u => u.isActive).length} icon={UserCheck} colorClass="text-emerald-500" delay={0.1} />
          <StatCard title="Students Matrix" value={usersByRole.students} icon={UserPlus} colorClass="text-amber-500" delay={0.15} />
          <StatCard title="Academy Experts" value={usersByRole.teachers} icon={BookOpen} colorClass="text-purple-500" delay={0.2} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Left Column: Metadata */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-premium-surface-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden h-full shadow-sm"
            >
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Node Intelligence</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div className="group cursor-default">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-superadminprimary transition-colors">Access Signal (Email)</p>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <Mail className="h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white select-all">{tenant.email}</p>
                        </div>
                    </div>

                    <div className="group cursor-default">
                        <p className="text-[10px] font-black text-tan-gold uppercase tracking-widest mb-1.5 transition-colors">Secure Line (Phone)</p>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tenant.phoneNo || "No Encrypted Line"}</p>
                        </div>
                    </div>

                    <div className="group cursor-default">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-superadminprimary transition-colors">Registry Timestamp</p>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <Calendar className="h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(tenant.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="group cursor-default pt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-superadminprimary transition-colors">Last Operational State</p>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <Clock className="h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {tenant.lastLogin ? new Date(tenant.lastLogin).toLocaleString() : "Never Synced"}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Column: Operative Grid */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="xl:col-span-2 space-y-6 flex flex-col"
            >
                {/* User Directory Sub-toolbar */}
                <div className="bg-white dark:bg-premium-surface-2 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex flex-col md:flex-row items-center gap-2">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-superadminprimary transition-colors" />
                        <input
                            type="text"
                            placeholder="Locate operative by identity..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-superadminprimary/30 transition-all dark:text-white uppercase tracking-wider"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-premium-surface-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-100/50 dark:bg-slate-900/50 border-none">
                                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px]">Operative</TableHead>
                                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px]">Contact Access</TableHead>
                                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px]">Identity Tier</TableHead>
                                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px]">Protocol State</TableHead>
                                <TableHead className="px-6 py-5 text-right text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px]">Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            <AnimatePresence mode="popLayout">
                                {paginatedUsers.length === 0 ? (
                                    <TableRow>
                                       <TableCell colSpan={5} className="px-10 py-16 text-center align-middle">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Users className="w-16 h-16 text-slate-200 dark:text-slate-800" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Operatives In Perimeter</p>
                                            </div>
                                       </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user, idx) => {
                                        const roleCfg = getRoleConfig(user.userType);
                                        const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "N/A";
                                        return (
                                            <MotionTableRow 
                                                key={user._id}
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + (idx * 0.02) }}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group border-none"
                                            >
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-superadminprimary to-tan-gold flex items-center justify-center text-white font-black text-xs shadow-md">
                                                            {displayName.charAt(0)}
                                                        </div>
                                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                            {displayName}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <p className="text-[10px] font-bold text-slate-500 select-all group-hover:text-superadminprimary transition-colors">{user.email}</p>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className={`inline-flex px-3 py-1 rounded-lg border ${roleCfg.bg} ${roleCfg.text} ${roleCfg.border} text-[9px] font-black uppercase tracking-widest`}>
                                                        {user.userType}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-rose-500/10 text-rose-600 border-rose-200'} text-[9px] font-black uppercase tracking-widest`}>
                                                        <div className={`h-1 w-1 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        {user.status === "active" ? "Online" : "Terminated"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </p>
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
                        pageSizeOptions={[5, 10]}
                        className="border-none bg-slate-50/30 dark:bg-transparent py-4 px-6 mt-auto"
                    />
                </div>
            </motion.div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default TenantDetail;

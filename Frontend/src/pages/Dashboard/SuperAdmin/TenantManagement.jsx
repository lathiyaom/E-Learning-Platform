import { useState, useMemo } from "react";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import {
  useGetAllTenantsQuery,
  usePromoteTenantMutation,
  useDemoteTenantMutation,
  useChangeTenantStatusMutation,
} from "../../../redux/Apis/superAdminApi";
import API from "../../../utils/axiosintence";
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
  Search,
  Filter,
  MoreVertical,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  Users,
  Calendar,
  Zap,
} from "lucide-react";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import { motion, AnimatePresence } from "framer-motion";

// Helper for Status Badges
const getStatusConfig = (status) => {
  const configs = {
    active: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/50 dark:border-emerald-800/30",
      label: "ACTIVE",
    },
    inactive: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200/50 dark:border-amber-800/30",
      label: "INACTIVE",
    },
    suspended: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-200/50 dark:border-rose-800/30",
      label: "SUSPENDED",
    },
  };
  return configs[status] || configs.inactive;
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

const MotionTableRow = motion.create(TableRow);

const TenantManagement = () => {
  const { data, isLoading, isError, error, refetch } = useGetAllTenantsQuery();
  const [promoteTenant] = usePromoteTenantMutation();
  const [demoteTenant] = useDemoteTenantMutation();
  const [changeTenantStatus] = useChangeTenantStatusMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [assignIdentifier, setAssignIdentifier] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  
  // Pagination State for client-side table handling
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const tenants = data?.data || [];

  const normalizeRole = (role) => (role || "").toLowerCase();

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch =
        tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.institutionName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || tenant.status === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "superadmin" &&
          normalizeRole(tenant.userType) === "superadmin") ||
        (roleFilter === "admin" && normalizeRole(tenant.userType) === "admin");

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [tenants, searchTerm, statusFilter, roleFilter]);

  // Client-side pagination logic
  const paginatedTenants = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTenants.slice(start, start + limit);
  }, [filteredTenants, page, limit]);

  const totalPages = Math.ceil(filteredTenants.length / limit) || 1;

  const handlePromote = async (id, name) => {
    try {
      await promoteTenant(id).unwrap();
      SuccessToster(`${name} promoted to Super Admin`);
      setShowConfirmModal(null);
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to promote tenant");
    }
  };

  const handleDemote = async (id, name) => {
    try {
      await demoteTenant(id).unwrap();
      SuccessToster(`${name} demoted to Admin`);
      setShowConfirmModal(null);
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to demote tenant");
    }
  };

  const handleStatusChange = async (id, status, name) => {
    try {
      await changeTenantStatus({ id, status }).unwrap();
      SuccessToster(`${name} status changed to ${status}`);
      setShowConfirmModal(null);
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to change status");
    }
  };

  const handleAssignTeacher = async (tenantId, identifier) => {
    try {
      setAssignLoading(true);
      const payload = {};
      if (identifier.includes("@")) payload.email = identifier;
      else payload.userId = identifier;

      const res = await API.patch(`/Tenant/AssignTeacher/${tenantId}`, payload);
      SuccessToster(res?.data?.message || "Teacher assigned successfully");
      setShowAssignModal(null);
      setAssignIdentifier("");
      refetch && refetch();
    } catch (err) {
      ErrorToster(err?.response?.data?.message || "Failed to assign teacher");
    } finally {
      setAssignLoading(false);
    }
  };

  // Adapter for common DataTablePagination
  const tableInstance = {
    getFilteredRowModel: () => ({ rows: { length: filteredTenants.length } }),
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getState: () => ({
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    }),
    getPageCount: () => totalPages,
    getCanPreviousPage: () => page > 1,
    getCanNextPage: () => page < totalPages,
    setPageIndex: (index) => setPage(index + 1),
    previousPage: () => setPage(p => Math.max(1, p - 1)),
    nextPage: () => setPage(p => Math.min(totalPages, p + 1)),
    setPageSize: (size) => {
      setLimit(size);
      setPage(1);
    },
  };

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Institution Management">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="h-12 w-12 border-4 border-superadminprimary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Synchronizing Platform Hubs...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout 
      pageTitle="Institution Management" 
      breadcrumbItems={breadcrumbPaths.SUPERADMIN_TENANTS}
      showSearch={false}
    >
      <div className="space-y-8 pb-20">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Institutions" value={tenants.length} icon={Building} colorClass="text-blue-500" delay={0.05} />
          <StatCard title="Active Hubs" value={tenants.filter(t => t.status === 'active').length} icon={Zap} colorClass="text-emerald-500" delay={0.1} />
          <StatCard title="Admins Level" value={tenants.filter(t => normalizeRole(t.userType) === 'admin').length} icon={Shield} colorClass="text-amber-500" delay={0.15} />
          <StatCard title="Suspended Hubs" value={tenants.filter(t => t.status === 'suspended').length} icon={AlertCircle} colorClass="text-rose-500" delay={0.2} />
        </div>

        {/* Toolbar Section */}
        <div className="bg-white dark:bg-premium-surface rounded-3xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 shadow-sm flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-superadminprimary transition-colors" />
            <input
              type="text"
              placeholder="Search by institution name, owner, or identifier..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-superadminprimary/30 transition-all dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto p-1 lg:p-0">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                }}
                className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none focus:ring-2 focus:ring-superadminprimary/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">Any Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                }}
                className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none focus:ring-2 focus:ring-superadminprimary/20 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">Any Role</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Table Using Common Components */}
        <div className="bg-white dark:bg-premium-surface rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100/50 dark:bg-slate-900/50 border-none">
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Institution / Hub</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Contact Point</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Security Tier</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Hub Protocol</TableHead>
                <TableHead className="px-6 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">User Count</TableHead>
                <TableHead className="px-6 py-5 text-right text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Control Panel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence mode="popLayout text-center">
                {paginatedTenants.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="px-10 py-32 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-4 mx-auto w-full">
                        <Building className="w-24 h-24 text-slate-200 dark:text-slate-800" />
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No Institutions Detected</p>
                          <p className="text-xs text-slate-500 font-medium italic mt-1 max-w-[300px] mx-auto">Try broadening your search criteria within the platform grid.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTenants.map((tenant, idx) => {
                    const statusCfg = getStatusConfig(tenant.status);
                    const isSuper = normalizeRole(tenant.userType) === "superadmin";
                    
                    return (
                      <MotionTableRow 
                        key={tenant._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group border-slate-100 dark:border-slate-800/50"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-2xl bg-superadminprimary/10 flex items-center justify-center font-black text-superadminprimary group-hover:bg-superadminprimary group-hover:text-white transition-all relative overflow-hidden">
                              <span className="relative z-10 select-none">
                                {tenant.institutionName?.charAt(0) || tenant.name?.charAt(0) || "I"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight capitalize">
                                {tenant.institutionName || tenant.name || "N/A"}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium font-mono uppercase mt-0.5 tracking-tighter">
                                Owner: {tenant.OrgOwnerName || "System Managed"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-superadminprimary transition-colors">
                              <span className="select-all">{tenant.email}</span>
                            </div>
                            {tenant.phone && (
                              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                <span>{tenant.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isSuper ? 'bg-purple-500/10 text-purple-600 border-purple-200' : 'bg-blue-500/10 text-blue-600 border-blue-200'} shadow-sm`}>
                            {isSuper ? <Shield className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                            <span className="text-[10px] font-black uppercase tracking-wider">{tenant.userType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{statusCfg.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>{tenant.userCount || 0} Operatives</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              if (openDropdown === tenant._id) {
                                setOpenDropdown(null);
                                return;
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuPosition({
                                top: rect.bottom + 8,
                                left: rect.right - 224, 
                              });
                              setOpenDropdown(tenant._id);
                            }}
                            className="p-2 hover:bg-superadminprimary/10 hover:text-superadminprimary rounded-xl transition-all"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
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
            pageSizeOptions={[5, 10, 20]}
            className="border-none bg-slate-50/30 dark:bg-transparent py-4 px-6"
          />
        </div>

        {/* Global Floating Dropdown */}
        <AnimatePresence>
          {openDropdown && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150]"
                onClick={() => setOpenDropdown(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="fixed w-56 bg-white dark:bg-premium-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-[160] overflow-hidden"
                style={{
                  top: menuPosition.top,
                  left: Math.max(8, menuPosition.left),
                }}
              >
                {(() => {
                  const tenant = tenants.find((t) => t._id === openDropdown);
                  if (!tenant) return null;
                  return (
                    <div className="flex flex-col">
                      <button
                        onClick={() => {
                          window.location.href = `/superadmin/tenants/${tenant._id}`;
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest hover:bg-superadminprimary/10 hover:text-superadminprimary flex items-center gap-3 transition-colors text-slate-600 dark:text-slate-300"
                      >
                        <Eye className="h-4 w-4" />
                        Access Details
                      </button>

                      {normalizeRole(tenant.userType) === "admin" && (
                        <button
                          onClick={() => {
                            setShowConfirmModal({ type: "promote", tenant });
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest hover:bg-purple-500/10 text-purple-600 flex items-center gap-3 transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          Promote Access
                        </button>
                      )}

                      {normalizeRole(tenant.userType) === "superadmin" && (
                        <button
                          onClick={() => {
                            setShowConfirmModal({ type: "demote", tenant });
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest hover:bg-orange-500/10 text-orange-600 flex items-center gap-3 transition-colors"
                        >
                          <ShieldOff className="h-4 w-4" />
                          Revoke Tier
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowAssignModal({ tenant });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest hover:bg-superadminprimary/10 hover:text-superadminprimary flex items-center gap-3 transition-colors text-slate-600 dark:text-slate-300"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Assign Lead
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

                      {tenant.status !== "active" && (
                        <button
                          onClick={() => {
                            setShowConfirmModal({ type: "activate", tenant });
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest hover:bg-emerald-500/10 text-emerald-600 flex items-center gap-3 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Authorize
                        </button>
                      )}

                      {tenant.status !== "suspended" && (
                        <button
                          onClick={() => {
                            setShowConfirmModal({ type: "suspend", tenant });
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest hover:bg-rose-500/10 text-rose-600 flex items-center gap-3 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Freeze Hub
                        </button>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* System Footer Log */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="flex items-center gap-4 text-left">
            <div className="h-10 w-10 aspect-square rounded-full bg-superadminprimary flex items-center justify-center text-white font-black text-xl select-none">H</div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">EduVerse Institutional Grid</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span className="hover:text-superadminprimary cursor-pointer">Protocol Secure</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer">Multi-Tenant Isolation</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Build 2026.03 | Active Hub Management</p>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-premium-surface rounded-[2rem] p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="h-16 w-16 bg-superadminprimary/10 rounded-2xl flex items-center justify-center text-superadminprimary mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Access Confirmation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              {showConfirmModal.type === "promote" && `Trigger promotion protocol for ${showConfirmModal.tenant.name} to Super Admin tier?`}
              {showConfirmModal.type === "demote" && `Authorize level reduction for ${showConfirmModal.tenant.name} back to Standard Admin?`}
              {showConfirmModal.type === "activate" && `Initiate activation sequence for ${showConfirmModal.tenant.name} hub?`}
              {showConfirmModal.type === "suspend" && `Are you certain you want to freeze ${showConfirmModal.tenant.name}? This will block all associated operatives.`}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                ABORT
              </button>
              <button
                onClick={() => {
                  const { type, tenant } = showConfirmModal;
                  if (type === "promote") handlePromote(tenant._id, tenant.name);
                  else if (type === "demote") handleDemote(tenant._id, tenant.name);
                  else if (type === "activate") handleStatusChange(tenant._id, "active", tenant.name);
                  else if (type === "suspend") handleStatusChange(tenant._id, "suspended", tenant.name);
                }}
                className={`flex-1 px-6 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                  showConfirmModal.type === "suspend"
                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                    : "bg-superadminprimary hover:bg-superadminprimary/90 shadow-superadminprimary/20"
                }`}
              >
                PROCEED
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-premium-surface rounded-[2rem] p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Assign Hub Lead</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Identify the operative to lead <span className="text-superadminprimary font-bold">{showAssignModal.tenant.institutionName || showAssignModal.tenant.name}</span>.
            </p>
            <div className="relative mb-8 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-superadminprimary transition-colors" />
                <input
                type="text"
                value={assignIdentifier}
                onChange={(e) => setAssignIdentifier(e.target.value)}
                placeholder="Operative ID or Email Signature..."
                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-superadminprimary/30 transition-all dark:text-white"
                />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAssignModal(null)}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleAssignTeacher(showAssignModal.tenant._id, assignIdentifier)}
                disabled={assignLoading || !assignIdentifier}
                className={`flex-1 px-6 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                    assignLoading ? "bg-slate-400" : "bg-superadminprimary hover:bg-superadminprimary/90 shadow-superadminprimary/20"
                }`}
              >
                {assignLoading ? "SYNCHRONIZING..." : "ASSIGN LEAD"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </SuperAdminLayout>
  );
};

export default TenantManagement;

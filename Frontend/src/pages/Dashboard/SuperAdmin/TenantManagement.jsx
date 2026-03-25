import { useState } from "react";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import {
  useGetAllTenantsQuery,
  usePromoteTenantMutation,
  useDemoteTenantMutation,
  useChangeTenantStatusMutation,
} from "../../../redux/Apis/superAdminApi";
import API from "../../../utils/axiosintence";
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
} from "lucide-react";
import { ErrorToster, SuccessToster } from "../../../components/toster";

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

  const tenants = data?.data || [];

  const normalizeRole = (role) => (role || "").toLowerCase();

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.institutionName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || tenant.status === statusFilter;

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "superadmin" && normalizeRole(tenant.userType) === "superadmin") ||
      (roleFilter === "admin" && normalizeRole(tenant.userType) === "admin");

    return matchesSearch && matchesStatus && matchesRole;
  });

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
    // identifier can be an email or userId
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

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status] || styles.inactive;
  };

  const getRoleBadge = (role) => {
    return normalizeRole(role) === "superadmin"
      ? "bg-primary/20 text-primary dark:bg-premium-gold/30 dark:text-premium-gold"
      : "bg-primary/10 text-primary dark:bg-premium-gold/20 dark:text-premium-gold";
  };

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Institution Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-premium-gold"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError) {
    return (
      <SuperAdminLayout pageTitle="Institution Management">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
            Failed to Load Institutions
          </h3>
          <p className="text-red-700 dark:text-red-300">
            {error?.data?.message || "Something went wrong"}
          </p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout pageTitle="Institution Management" showSearch={false}>
      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary dark:focus:ring-premium-gold focus:border-primary dark:focus:border-premium-gold"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-600 dark:text-slate-400">
            Showing {filteredTenants.length} of {tenants.length} institutions
          </p>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">
                      No institutions found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent-gold flex items-center justify-center text-slate-900 font-bold">
                          {tenant.institutionName?.charAt(0) || tenant.name?.charAt(0) || "I"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {tenant.institutionName || tenant.name || "N/A"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {tenant.OrgOwnerEmail || tenant.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {tenant.email}
                      </p>
                      {tenant.phone && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {tenant.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(tenant.userType)}`}
                      >
                        {normalizeRole(tenant.userType) === "superadmin" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <Building className="h-3 w-3" />
                        )}
                        {normalizeRole(tenant.userType) === "superadmin" ? "SUPERADMIN" : "ADMIN"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(tenant.status)}`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {tenant.userCount || 0} users
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            if (openDropdown === tenant._id) {
                              setOpenDropdown(null);
                              return;
                            }
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + 8,
                              left: rect.right - 224, // menu width 56 * 4 = 224px
                            });
                            setOpenDropdown(tenant._id);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-5 w-5 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Floating Dropdown (prevents table clipping issues) */}
      {openDropdown && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setOpenDropdown(null)} />
          {(() => {
            const tenant = tenants.find((t) => t._id === openDropdown);
            if (!tenant) return null;
            return (
              <div
                className="fixed w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[160]"
                style={{ top: menuPosition.top, left: Math.max(8, menuPosition.left) }}
              >
                <button
                  onClick={() => {
                    window.location.href = `/superadmin/tenants/${tenant._id}`;
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>

                {normalizeRole(tenant.userType) === "admin" && (
                  <button
                    onClick={() => {
                      setShowConfirmModal({ type: "promote", tenant });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-purple-600 dark:text-purple-400"
                  >
                    <Shield className="h-4 w-4" />
                    Promote to Super Admin
                  </button>
                )}

                {normalizeRole(tenant.userType) === "superadmin" && (
                  <button
                    onClick={() => {
                      setShowConfirmModal({ type: "demote", tenant });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                  >
                    <ShieldOff className="h-4 w-4" />
                    Demote to Admin
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowAssignModal({ tenant });
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Assign Teacher
                </button>

                <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

                {tenant.status !== "active" && (
                  <button
                    onClick={() => {
                      setShowConfirmModal({ type: "activate", tenant });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </button>
                )}

                {tenant.status !== "suspended" && (
                  <button
                    onClick={() => {
                      setShowConfirmModal({ type: "suspend", tenant });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <XCircle className="h-4 w-4" />
                    Suspend
                  </button>
                )}
              </div>
            );
          })()}
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Confirm Action
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {showConfirmModal.type === "promote" &&
                `Are you sure you want to promote ${showConfirmModal.tenant.name} to Super Admin?`}
              {showConfirmModal.type === "demote" &&
                `Are you sure you want to demote ${showConfirmModal.tenant.name} to Admin?`}
              {showConfirmModal.type === "activate" &&
                `Are you sure you want to activate ${showConfirmModal.tenant.name}?`}
              {showConfirmModal.type === "suspend" &&
                `Are you sure you want to suspend ${showConfirmModal.tenant.name}? This will revoke their access.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { type, tenant } = showConfirmModal;
                  if (type === "promote") handlePromote(tenant._id, tenant.name);
                  else if (type === "demote") handleDemote(tenant._id, tenant.name);
                  else if (type === "activate")
                    handleStatusChange(tenant._id, "active", tenant.name);
                  else if (type === "suspend")
                    handleStatusChange(tenant._id, "suspended", tenant.name);
                }}
                className={`flex-1 px-4 py-2 rounded-xl text-white transition-colors ${showConfirmModal.type === "suspend"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Assign Teacher to {showAssignModal.tenant.institutionName || showAssignModal.tenant.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Enter the teacher's email or user ID to assign them to this organization.</p>
            <input
              type="text"
              value={assignIdentifier}
              onChange={(e) => setAssignIdentifier(e.target.value)}
              placeholder="teacher@example.com or userId"
              className="w-full px-4 py-2 mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(null)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignTeacher(showAssignModal.tenant._id, assignIdentifier)}
                disabled={assignLoading || !assignIdentifier}
                className={`flex-1 px-4 py-2 rounded-xl text-white transition-colors ${assignLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {assignLoading ? 'Assigning...' : 'Assign Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default TenantManagement;

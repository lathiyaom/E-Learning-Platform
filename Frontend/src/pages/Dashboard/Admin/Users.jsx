import React, { useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useSuspendAdminUserMutation,
  useActivateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "../../../redux/Apis/adminApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ROLE_COLORS = {
  student: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  teacher: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-600",
};

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  userType: "student",
  phoneNo: "",
  gender: "",
  about: "",
};

const UserModal = ({ mode, user, onClose, onSaved }) => {
  const [form, setForm] = useState(
    mode === "edit" && user
      ? {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          password: "",
          userType: user.userType || "student",
          phoneNo: user.phoneNo || "",
          gender: user.gender || "",
          about: user.about || "",
        }
      : { ...INITIAL_FORM }
  );

  const [createUser, { isLoading: creating }] = useCreateAdminUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateAdminUserMutation();
  const isBusy = creating || updating;

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "edit") {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateUser({ id: user._id, ...payload }).unwrap();
        SuccessToster("User updated successfully", 2500);
      } else {
        await createUser(form).unwrap();
        SuccessToster("User created successfully", 2500);
      }
      onSaved();
    } catch (err) {
      ErrorToster(err?.data?.message || "Operation failed", 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === "edit" ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role *</label>
            <div className="flex gap-3">
              {["student", "teacher"].map((role) => (
                <label
                  key={role}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all capitalize font-medium text-sm ${
                    form.userType === role
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <input type="radio" name="userType" value={role} checked={form.userType === role} onChange={handle} className="sr-only" />
                  {role === "student" ? "Student" : "Teacher"}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handle}
                required
                placeholder="John"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handle}
                required
                placeholder="Doe"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              required
              disabled={mode === "edit"}
              placeholder="john@example.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password {mode === "edit" ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              required={mode === "create"}
              placeholder={mode === "edit" ? "••••••••" : "Min 6 characters"}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                name="phoneNo"
                value={form.phoneNo}
                onChange={handle}
                placeholder="+1 555 000 0000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handle}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">About</label>
            <textarea
              name="about"
              value={form.about}
              onChange={handle}
              rows={2}
              placeholder="Brief description..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isBusy ? "Saving..." : mode === "edit" ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewModal = ({ user, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Details</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
        {[
          ["Role", user.userType],
          ["Status", user.status],
          ["Phone", user.phoneNo || "-"],
          ["Gender", user.gender || "-"],
          ["About", user.about || "-"],
          ["Joined", user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            <span className="text-slate-900 dark:text-white capitalize">{value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ManageUsers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(null);

  const { data, isLoading, error, refetch } = useGetAdminUsersQuery({
    page,
    limit: 12,
    search,
    userType: roleFilter,
    status: statusFilter,
  });
  const [suspendUser, { isLoading: suspending }] = useSuspendAdminUserMutation();
  const [activateUser, { isLoading: activating }] = useActivateAdminUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  const handleSuspend = async (id) => {
    if (!window.confirm("Suspend this user? They will be logged out.")) return;
    try {
      await suspendUser(id).unwrap();
      SuccessToster("User suspended", 2000);
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed", 3000);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateUser(id).unwrap();
      SuccessToster("User activated", 2000);
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed", 3000);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUser(id).unwrap();
      SuccessToster("User deleted", 2000);
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed", 3000);
    }
  };

  const closeModal = () => setModal(null);
  const onSaved = () => {
    closeModal();
    refetch();
  };

  return (
    <AdminLayout showSearch={false}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {pagination.totalUsers ?? users.length} users in your organization
            </p>
          </div>
          <button
            onClick={() => setModal({ type: "add" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: pagination.totalUsers ?? users.length },
            { label: "Students", value: users.filter((u) => u.userType === "student").length },
            { label: "Teachers", value: users.filter((u) => u.userType === "teacher").length },
            { label: "Active", value: users.filter((u) => u.status === "active").length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
              <p className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-700 dark:text-red-300">{error?.data?.message || "Failed to load users"}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    {["User", "Role", "Status", "Phone", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            {u.firstName?.[0]}
                            {u.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[u.userType] || ROLE_COLORS.student}`}>
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[u.status] || STATUS_COLORS.inactive}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{u.phoneNo || "-"}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            title="View"
                            onClick={() => setModal({ type: "view", user: u })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => setModal({ type: "edit", user: u })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {u.status === "suspended" ? (
                            <button
                              title="Activate"
                              onClick={() => handleActivate(u._id)}
                              disabled={activating}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              title="Suspend"
                              onClick={() => handleSuspend(u._id)}
                              disabled={suspending}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            title="Delete"
                            onClick={() => handleDelete(u._id, `${u.firstName} ${u.lastName}`)}
                            disabled={deleting}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNext}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {modal?.type === "add" && <UserModal mode="create" onClose={closeModal} onSaved={onSaved} />}
        {modal?.type === "edit" && <UserModal mode="edit" user={modal.user} onClose={closeModal} onSaved={onSaved} />}
        {modal?.type === "view" && <ViewModal user={modal.user} onClose={closeModal} />}
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;

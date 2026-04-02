import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Eye,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

import AdminLayout from "../../../utils/Adminlayoute";
import {
  useActivateAdminUserMutation,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useSuspendAdminUserMutation,
  useUpdateAdminUserMutation,
} from "../../../redux/Apis/adminApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/table";
import { DataTablePagination } from "../../../components/data-table-pagination";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const getUserInitials = (user) => {
  const first = user?.firstName?.trim()?.[0] || "";
  const last = user?.lastName?.trim()?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
};

const getUserAvatar = (user) =>
  user?.avatar || user?.avatarUrl || user?.profilePic || user?.profileImage || user?.photoURL || "";

const UserAvatar = ({ user, size = "h-9 w-9" }) => {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = getUserAvatar(user);

  if (!avatarUrl || hasError) {
    return (
      <div className={`${size} rounded-lg bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center text-xs font-semibold text-studprimary dark:text-premium-gold shrink-0`}>
        {getUserInitials(user)}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User avatar"}
      className={`${size} rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

const ROLE_COLORS = {
  student: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  teacher: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300",
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[-()\d\s]{7,20}$/;

const validateUserForm = (form, mode) => {
  const errors = {};

  if (!String(form.firstName || "").trim()) {
    errors.firstName = "First name is required.";
  }

  if (!String(form.lastName || "").trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!String(form.email || "").trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(String(form.email).trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (mode === "create" && !String(form.password || "").trim()) {
    errors.password = "Password is required.";
  }

  if (String(form.password || "").trim() && String(form.password).trim().length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (String(form.phoneNo || "").trim() && !PHONE_REGEX.test(String(form.phoneNo).trim())) {
    errors.phoneNo = "Enter a valid phone number.";
  }

  if (String(form.about || "").length > 250) {
    errors.about = "About should be 250 characters or less.";
  }

  return errors;
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = validateUserForm(form, mode);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      ErrorToster("Please fix highlighted form fields", 2500);
      return;
    }

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-navy-charcoal rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col border border-slate-200 dark:border-white/10 my-auto mx-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === "edit" ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4 flex-1 overflow-y-auto modal-scrollbar modal-scroll-smooth" style={{ touchAction: "pan-y" }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role *</label>
            <div className="flex gap-3">
              {["student", "teacher"].map((role) => (
                <label
                  key={role}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all capitalize font-medium text-sm ${
                    form.userType === role
                      ? "border-studprimary dark:border-premium-gold bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold"
                      : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <input type="radio" name="userType" value={role} checked={form.userType === role} onChange={handle} className="sr-only" />
                  {role === "student" ? "Student" : "Teacher"}
                </label>
              ))}
            </div>
            {errors.userType ? <p className="mt-1 text-xs text-red-500">{errors.userType}</p> : null}
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
                aria-invalid={Boolean(errors.firstName)}
                className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.firstName ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.firstName ? <p className="mt-1 text-xs text-red-500">{errors.firstName}</p> : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handle}
                required
                placeholder="Doe"
                aria-invalid={Boolean(errors.lastName)}
                className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.lastName ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.lastName ? <p className="mt-1 text-xs text-red-500">{errors.lastName}</p> : null}
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
              aria-invalid={Boolean(errors.email)}
              className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 disabled:opacity-50 ${errors.email ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email}</p> : null}
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
              aria-invalid={Boolean(errors.password)}
              className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.password ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
            />
            {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                name="phoneNo"
                value={form.phoneNo}
                onChange={handle}
                placeholder="+1 555 000 0000"
                aria-invalid={Boolean(errors.phoneNo)}
                className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.phoneNo ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.phoneNo ? <p className="mt-1 text-xs text-red-500">{errors.phoneNo}</p> : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handle}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
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
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 resize-none"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.about ? <p className="text-xs text-red-500">{errors.about}</p> : <span />}
              <p className="text-[11px] text-slate-400">{form.about.length}/250</p>
            </div>
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
              className="flex-1 py-2.5 rounded-xl bg-studprimary dark:bg-premium-gold hover:bg-studprimary/90 dark:hover:brightness-110 text-white dark:text-deep-charcoal text-sm font-medium transition-colors disabled:opacity-60"
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
    <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-navy-charcoal">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-studprimary/10 via-transparent to-premium-gold/10 dark:from-premium-gold/15 dark:via-transparent dark:to-studprimary/10" />
      <div className="relative flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-studprimary dark:text-premium-gold">User Profile</p>
          <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">User Details</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="border-b border-slate-200 p-6 dark:border-white/10 lg:border-b-0 lg:border-r">
          <div className="flex flex-col items-center text-center">
            <UserAvatar user={user} size="h-24 w-24" />
            <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${ROLE_COLORS[user.userType] || ROLE_COLORS.student}`}>
                {user.userType || "student"}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[user.status] || STATUS_COLORS.inactive}`}>
                {user.status || "inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Phone", user.phoneNo || "-"],
              ["Gender", user.gender || "-"],
              ["Joined", user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"],
              ["Role", user.userType || "-"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white capitalize">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">About</p>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {user.about || "No additional profile notes added."}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ManageUsers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const [paginationState, setPaginationState] = useState({ pageIndex: 0, pageSize: 10 });

  const sortBy = sorting?.[0]?.id || "createdAt";
  const sortOrder = sorting?.[0]?.desc ? "desc" : "asc";

  const { data, isLoading, error, refetch } = useGetAdminUsersQuery({
    page: paginationState.pageIndex + 1,
    limit: paginationState.pageSize,
    search,
    userType: roleFilter,
    status: statusFilter,
    sortBy,
    sortOrder,
  });

  const [suspendUser, { isLoading: suspending }] = useSuspendAdminUserMutation();
  const [activateUser, { isLoading: activating }] = useActivateAdminUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  const stats = useMemo(() => {
    const total = pagination.totalUsers ?? users.length;
    const pageStudents = users.filter((u) => u.userType === "student").length;
    const pageTeachers = users.filter((u) => u.userType === "teacher").length;
    const pageActive = users.filter((u) => u.status === "active").length;

    return {
      total,
      pageStudents,
      pageTeachers,
      pageActive,
    };
  }, [pagination.totalUsers, users]);

  const handleSuspend = async (id) => {
    if (!window.confirm("Suspend this user? They will be logged out.")) return;
    try {
      await suspendUser(id).unwrap();
      SuccessToster("User suspended", 2000);
      setRowSelection({});
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed", 3000);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateUser(id).unwrap();
      SuccessToster("User activated", 2000);
      setRowSelection({});
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed", 3000);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUser(id).unwrap();
      SuccessToster("User deleted", 2000);
      setRowSelection({});
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed", 3000);
    }
  };

  const closeModal = () => setModal(null);
  const onSaved = () => {
    closeModal();
    refetch();
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all rows"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-white/15 accent-[#B08D57]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.firstName || "user"}`}
            checked={row.getIsSelected()}
            onChange={(event) => row.toggleSelected(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-white/15 accent-[#B08D57]"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "firstName",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-2"
          >
            User <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-2.5 min-w-[210px]">
              <UserAvatar user={u} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email || "No email"}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "userType",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-2"
          >
            Role <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => {
          const role = row.original.userType || "student";
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[role] || ROLE_COLORS.student}`}>
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-2"
          >
            Status <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => {
          const status = row.original.status || "inactive";
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status] || STATUS_COLORS.inactive}`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "phoneNo",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">{row.original.phoneNo || "-"}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-2"
          >
            Joined <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "-"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-1 min-w-[170px]">
              <button
                title="View"
                onClick={() => setModal({ type: "view", user: u })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                title="Edit"
                onClick={() => navigate(`/admin/users/create?edit=${u._id}`)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10 transition-colors"
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
          );
        },
      },
    ],
    [activating, deleting, suspending]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination: paginationState,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages || 1,
    onSortingChange: (updaterOrValue) => {
      setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
      setSorting((prev) => (typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue));
    },
    onPaginationChange: setPaginationState,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
    enableRowSelection: true,
  });

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setSorting([{ id: "createdAt", desc: true }]);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <AdminLayout showSearch={false}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-4 sm:p-6 space-y-5 sm:space-y-6"
      >
        <motion.section 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-lavender-light dark:bg-navy-charcoal p-5 md:p-6 shadow-sm dark:shadow-2xl transition-all duration-300"
        >
          <div className="pointer-events-none absolute -top-16 -right-14 h-40 w-40 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold pointer-events-none" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "1.5rem 1.5rem" }} />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-studprimary/20 dark:border-premium-gold/20 bg-studprimary/10 dark:bg-premium-gold/10 px-3 py-1 text-xs font-semibold text-studprimary dark:text-premium-gold">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Users Control Center
              </div>
              <h1 className="mt-2 text-2xl md:text-[1.75rem] font-bold text-slate-900 dark:text-slate-100">Manage Users</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">
                {stats.total} users in your organization. Search, filter, sort, and paginate without losing existing functionality.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/users/create")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal text-sm font-semibold transition-colors shadow-sm hover:bg-studprimary/90 dark:hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Create User
            </button>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: stats.total },
            { label: "Students (Page)", value: stats.pageStudents },
            { label: "Teachers (Page)", value: stats.pageTeachers },
            { label: "Active (Page)", value: stats.pageActive },
          ].map(({ label, value }) => (
            <motion.article 
              key={label} 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 shadow-sm"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
              <p className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">{value}</p>
            </motion.article>
          ))}
        </section>

        <motion.section 
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 md:p-5 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 h-[42px] rounded-xl border border-slate-300 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                className="h-[42px] w-[42px] inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Refresh users"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.section>

        {isLoading ? (
          <motion.div variants={itemVariants} className="flex items-center justify-center h-44 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-studprimary dark:border-premium-gold" />
          </motion.div>
        ) : error ? (
          <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-700 dark:text-red-300">{error?.data?.message || "Failed to load users"}</p>
          </motion.div>
        ) : users.length === 0 ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center h-44 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal text-slate-500 dark:text-slate-400">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
          </motion.div>
        ) : (
          <motion.section variants={itemVariants} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-slate-100/80 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/5">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="px-1 pb-1 ">
              <DataTablePagination table={table} pageSizeOptions={[5, 10, 15, 20, 30] } className="rounded-b-xl" />
            </div>
          </motion.section>
        )}

        {modal?.type === "edit" && <UserModal mode="edit" user={modal.user} onClose={closeModal} onSaved={onSaved} />}
        {modal?.type === "view" && <ViewModal user={modal.user} onClose={closeModal} />}
      </motion.div>
    </AdminLayout>
  );
};

export default ManageUsers;

import React, { useMemo, useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  useGetUnassignedTeachersQuery,
  useGetOrganizationTeachersQuery,
  useAssignTeachersToOrganizationMutation,
  useRemoveTeacherFromOrganizationMutation,
} from "../../../redux/Apis/teacherOrganizationApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import {
  UserPlus,
  UserMinus,
  Users,
  Mail,
  Phone,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { SuccessToster, ErrorToster } from "../../../components/toster";
import { Button } from "../../../components/Button";

const PAGE_SIZE = 6;

const safeText = (value) => String(value || "").toLowerCase();

const getDisplayName = (teacher) => `${teacher?.firstName || ""} ${teacher?.lastName || ""}`.trim() || "Unnamed Teacher";

const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

const CompactPagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
  if (totalItems <= PAGE_SIZE) return null;

  return (
    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 rounded-lg border-slate-300 p-0 dark:border-white/15 dark:text-slate-200"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-8 w-8 rounded-lg border-slate-300 p-0 dark:border-white/15 dark:text-slate-200"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const TeacherCard = ({ teacher, action, selected = false, disabled = false, onClick }) => {
  const cardInteractive = typeof onClick === "function";

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        selected
          ? "border-amber-400 bg-amber-50/70 dark:border-amber-400/60 dark:bg-amber-500/10"
          : "border-slate-200 bg-white hover:border-amber-300 dark:border-white/10 dark:bg-slate-900/40"
      } ${cardInteractive ? "cursor-pointer" : ""}`}
      onClick={cardInteractive ? onClick : undefined}
      role={cardInteractive ? "button" : undefined}
      tabIndex={cardInteractive ? 0 : undefined}
      onKeyDown={
        cardInteractive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{getDisplayName(teacher)}</p>
            {selected ? <CheckCircle className="h-4 w-4 text-amber-500" /> : null}
          </div>
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{teacher?.email || "No email"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{teacher?.phoneNo || "No phone"}</span>
          </div>
        </div>

        {action ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              action.onClick();
            }}
            disabled={disabled}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${action.variant}`}
          >
            {action.icon}
          </button>
        ) : null}
      </div>
    </div>
  );
};

const AssignTeachers = () => {
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availablePage, setAvailablePage] = useState(1);
  const [assignedPage, setAssignedPage] = useState(1);
  const currentUser = useSelector(selectCurrentUser);
  // For admin/superadmin, user.id is the tenant/organization id
  const tenantId = currentUser?.id || null;

  const { data: unassignedData, isLoading: loadingUnassigned } = useGetUnassignedTeachersQuery();
  const { data: assignedData, isLoading: loadingAssigned, refetch } = useGetOrganizationTeachersQuery(tenantId, {
    skip: !tenantId,
  });
  
  const [assignTeachers, { isLoading: assigning }] = useAssignTeachersToOrganizationMutation();
  const [removeTeacher, { isLoading: removing }] = useRemoveTeacherFromOrganizationMutation();

  const unassignedTeachers = useMemo(() => unassignedData?.data || [], [unassignedData]);
  const assignedTeachers = useMemo(() => assignedData?.data || [], [assignedData]);

  const filteredUnassigned = useMemo(
    () =>
      unassignedTeachers.filter((teacher) => {
        const query = safeText(searchTerm);
        const fullName = `${safeText(teacher?.firstName)} ${safeText(teacher?.lastName)}`;
        return fullName.includes(query) || safeText(teacher?.email).includes(query);
      }),
    [unassignedTeachers, searchTerm]
  );

  const filteredAssigned = useMemo(
    () =>
      assignedTeachers.filter((teacher) => {
        const query = safeText(searchTerm);
        const fullName = `${safeText(teacher?.firstName)} ${safeText(teacher?.lastName)}`;
        return fullName.includes(query) || safeText(teacher?.email).includes(query);
      }),
    [assignedTeachers, searchTerm]
  );

  const availableTotalPages = Math.max(1, Math.ceil(filteredUnassigned.length / PAGE_SIZE));
  const assignedTotalPages = Math.max(1, Math.ceil(filteredAssigned.length / PAGE_SIZE));

  useEffect(() => {
    setAvailablePage(1);
    setAssignedPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (availablePage > availableTotalPages) {
      setAvailablePage(availableTotalPages);
    }
  }, [availablePage, availableTotalPages]);

  useEffect(() => {
    if (assignedPage > assignedTotalPages) {
      setAssignedPage(assignedTotalPages);
    }
  }, [assignedPage, assignedTotalPages]);

  const paginatedUnassigned = useMemo(
    () => paginate(filteredUnassigned, availablePage, PAGE_SIZE),
    [filteredUnassigned, availablePage]
  );

  const paginatedAssigned = useMemo(
    () => paginate(filteredAssigned, assignedPage, PAGE_SIZE),
    [filteredAssigned, assignedPage]
  );

  const handleSelectTeacher = useCallback((teacherId) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  }, []);

  const handleAssignTeachers = async () => {
    if (selectedTeachers.length === 0) {
      ErrorToster("Please select at least one teacher");
      return;
    }

    try {
      const result = await assignTeachers({ teacherIds: selectedTeachers }).unwrap();
      SuccessToster(result.message || "Teachers assigned successfully");
      setSelectedTeachers([]);
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to assign teachers");
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!window.confirm("Are you sure you want to remove this teacher from your organization?")) {
      return;
    }

    try {
      const result = await removeTeacher(teacherId).unwrap();
      SuccessToster(result.message || "Teacher removed successfully");
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to remove teacher");
    }
  };

  if (loadingUnassigned || loadingAssigned) {
    return (
      <AdminLayout pageTitle="Assign Teachers">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Assign Teachers">
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 via-yellow-50 to-white p-4 shadow-sm dark:border-amber-400/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assign Teachers</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Manage teacher allocations across your organization efficiently.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 dark:border-white/15 dark:bg-slate-800 dark:text-slate-200">
                  Available: {unassignedTeachers.length}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 dark:border-white/15 dark:bg-slate-800 dark:text-slate-200">
                  Assigned: {assignedTeachers.length}
                </span>
                <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
                  Selected: {selectedTeachers.length}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAssignTeachers}
              disabled={assigning || selectedTeachers.length === 0}
              className="h-10 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {assigning ? "Assigning..." : selectedTeachers.length > 0 ? `Quick Assign (${selectedTeachers.length})` : "Quick Assign"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-navy-charcoal">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by teacher name or email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:border-white/10 dark:bg-deep-charcoal dark:text-white dark:focus:border-amber-500/30 dark:focus:ring-amber-500/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-navy-charcoal">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-500/10">
                  <Users className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Available Teachers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {filteredUnassigned.length} match(es)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {paginatedUnassigned.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                  No available teachers found.
                </div>
              ) : (
                paginatedUnassigned.map((teacher) => (
                  <TeacherCard
                    key={teacher._id}
                    teacher={teacher}
                    selected={selectedTeachers.includes(teacher._id)}
                    onClick={() => handleSelectTeacher(teacher._id)}
                  />
                ))
              )}
            </div>

            <CompactPagination
              currentPage={availablePage}
              totalPages={availableTotalPages}
              onPageChange={setAvailablePage}
              totalItems={filteredUnassigned.length}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-navy-charcoal">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-500/10">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Assigned Teachers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {filteredAssigned.length} match(es)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {paginatedAssigned.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                  No assigned teachers found.
                </div>
              ) : (
                paginatedAssigned.map((teacher) => (
                  <TeacherCard
                    key={teacher._id}
                    teacher={teacher}
                    disabled={removing}
                    action={{
                      onClick: () => handleRemoveTeacher(teacher._id),
                      icon: <UserMinus className="h-4 w-4" />,
                      variant:
                        "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10",
                    }}
                  />
                ))
              )}
            </div>

            <CompactPagination
              currentPage={assignedPage}
              totalPages={assignedTotalPages}
              onPageChange={setAssignedPage}
              totalItems={filteredAssigned.length}
            />
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignTeachers;

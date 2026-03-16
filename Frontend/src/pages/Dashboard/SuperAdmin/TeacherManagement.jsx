import React, { useMemo, useState } from "react";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import {
  useGetAllTeachersQuery,
  useGetAllTenantsQuery,
  useInviteTeacherToOrgMutation,
} from "../../../redux/Apis/superAdminApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import { Search, Send, X } from "lucide-react";

const InviteModal = ({ teacher, organizations, onClose, onInvite, isLoading }) => {
  const [organizationId, setOrganizationId] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!organizationId) return;
    onInvite(teacher._id, organizationId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Invite Teacher to Organization</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Teacher</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {teacher.firstName} {teacher.lastName}
            </p>
            <p className="text-xs text-slate-500">{teacher.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization *</label>
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="">Select organization</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.institutionName || org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !organizationId}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeacherManagement = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const { data: teachersData, isLoading, error, refetch } = useGetAllTeachersQuery({
    search,
    page,
    limit: 12,
  });
  const { data: orgData } = useGetAllTenantsQuery();
  const [inviteTeacherToOrg, { isLoading: inviting }] = useInviteTeacherToOrgMutation();

  const teachers = teachersData?.data || [];
  const pagination = teachersData?.pagination || {};
  const organizations = useMemo(
    () => (orgData?.data || []).filter((org) => org.userType !== "superadmin"),
    [orgData]
  );

  const handleInvite = async (teacherId, organizationId) => {
    try {
      await inviteTeacherToOrg({ teacherId, organizationId }).unwrap();
      SuccessToster("Invitation email sent to teacher", 2500);
      setSelectedTeacher(null);
      refetch();
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to send invitation", 3000);
    }
  };

  return (
    <SuperAdminLayout pageTitle="Teachers" subheader="View all teachers and assign them to organizations">
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher by name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-b-2 border-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error?.data?.message || "Failed to load teachers"}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    {[
                      "Teacher",
                      "Email",
                      "Organizations",
                      "Availability",
                      "Invited",
                      "Action",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {teachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                        {teacher.firstName} {teacher.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{teacher.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {(teacher.organizations || []).length === 0
                          ? "Not assigned"
                          : teacher.organizations
                              .map((org) => org.institutionName || org.name)
                              .join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            teacher.available_for_org
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {teacher.available_for_org ? "Available" : "Assigned"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {teacher.pendingOrgInvitation?.expiresAt
                          ? "Pending"
                          : "None"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedTeacher(teacher)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="h-4 w-4" /> Invite
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTeacher && (
        <InviteModal
          teacher={selectedTeacher}
          organizations={organizations}
          onClose={() => setSelectedTeacher(null)}
          onInvite={handleInvite}
          isLoading={inviting}
        />
      )}
    </SuperAdminLayout>
  );
};

export default TeacherManagement;

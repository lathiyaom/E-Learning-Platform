import React, { useMemo, useState } from "react";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { useGetAllTeachersQuery } from "../../../redux/Apis/superAdminApi";
import { Search } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const TeacherManagement = () => {
  const [search, setSearch] = useState("");
  const [dateSort, setDateSort] = useState("desc");
  const [page, setPage] = useState(1);

  const { data: teachersData, isLoading, error, refetch } = useGetAllTeachersQuery({
    search,
    page,
    limit: 12,
    unassignedOnly: true,
  });

  const teachers = useMemo(() => {
    const source = teachersData?.data || [];
    const sorted = [...source].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return dateSort === "asc" ? aTime - bTime : bTime - aTime;
    });
    return sorted;
  }, [teachersData, dateSort]);

  const pagination = teachersData?.pagination || {};

  return (
    <SuperAdminLayout pageTitle="Teachers" subheader="Unassigned teachers across platform">
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
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
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              <option value="desc">Newest Join Date</option>
              <option value="asc">Oldest Join Date</option>
            </select>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Refresh
            </button>
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
                      "Phone",
                      "Join Date",
                      "Availability",
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
                        {teacher.phoneNo || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(teacher.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            teacher.pendingOrgInvitation?.expiresAt
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {teacher.pendingOrgInvitation?.expiresAt ? "Pending Invite" : "Available"}
                        </span>
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

    </SuperAdminLayout>
  );
};

export default TeacherManagement;

import React, { useMemo, useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  useArchiveSubjectMutation,
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
  useGetSubjectsQuery,
  useRestoreSubjectMutation,
  useUpdateSubjectMutation,
} from "../../../redux";
import { ErrorToster, SuccessToster } from "../../../components/toster";
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

const emptyForm = {
  name: "",
  code: "",
  stream: "",
};

function Subjects() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");

  const { data, isLoading, refetch } = useGetSubjectsQuery({ status: statusFilter });
  const [createSubject, { isLoading: creating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: updating }] = useUpdateSubjectMutation();
  const [archiveSubject, { isLoading: archiving }] = useArchiveSubjectMutation();
  const [restoreSubject, { isLoading: restoring }] = useRestoreSubjectMutation();
  const [deleteSubject, { isLoading: deleting }] = useDeleteSubjectMutation();

  const subjects = useMemo(() => data?.data || [], [data]);
  const isBusy = creating || updating || archiving || restoring || deleting;

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: String(form.name || "").trim(),
      code: String(form.code || "").trim(),
      stream: String(form.stream || "").trim(),
    };

    if (!payload.name) {
      ErrorToster("Subject name is required", 2200);
      return;
    }

    try {
      if (editingId) {
        await updateSubject({ id: editingId, ...payload }).unwrap();
        SuccessToster("Subject updated", 1800);
      } else {
        await createSubject(payload).unwrap();
        SuccessToster("Subject created", 1800);
      }
      setForm(emptyForm);
      setEditingId(null);
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to save subject", 2600);
    }
  };

  const beginEdit = (subject) => {
    setEditingId(subject._id || subject.id);
    setForm({
      name: subject.name || "",
      code: subject.code || "",
      stream: subject.stream || "",
    });
  };

  const clearEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleArchiveToggle = async (subject) => {
    try {
      const id = subject._id || subject.id;
      if (subject.status === "archived") {
        await restoreSubject(id).unwrap();
        SuccessToster("Subject restored", 1800);
      } else {
        await archiveSubject(id).unwrap();
        SuccessToster("Subject archived", 1800);
      }
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to update subject status", 2600);
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`Delete subject \"${subject.name}\"?`)) return;

    try {
      await deleteSubject(subject._id || subject.id).unwrap();
      SuccessToster("Subject deleted", 1800);
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to delete subject", 2600);
    }
  };

  return (
    <AdminLayout pageTitle="Subjects">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {editingId ? "Edit Subject" : "Create Subject"}
          </h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="Subject name"
              required
            />
            <input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="Code (optional)"
            />
            <input
              value={form.stream}
              onChange={(e) => setForm((prev) => ({ ...prev, stream: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="Stream (optional)"
            />
            <div className="flex gap-2">
              <button
                disabled={isBusy}
                className="flex-1 px-3 py-2 rounded-lg bg-studprimary text-white font-semibold disabled:opacity-50"
                type="submit"
              >
                {editingId ? "Update" : "Create"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={clearEdit}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Organization Subjects</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="all">Total</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-slate-500">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="text-slate-500">No subjects found.</div>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => {
                const subjectId = subject._id || subject.id;
                return (
                  <motion.div
                    key={subjectId}
                    variants={itemVariants}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{subject.name}</p>
                      <p className="text-sm text-slate-500">
                        {subject.code ? `Code: ${subject.code}` : "No code"}
                        {subject.stream ? ` • Stream: ${subject.stream}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => beginEdit(subject)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchiveToggle(subject)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm"
                      >
                        {subject.status === "archived" ? "Restore" : "Archive"}
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}

export default Subjects;

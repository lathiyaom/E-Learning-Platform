import React from "react";
import { motion } from "framer-motion";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "../../../../components/table";
import {
  Clock, CheckCircle2, AlertCircle, FileText, Eye, Upload,
  ChevronLeft, ChevronRight, Star,
} from "lucide-react";

/* ── Status config ── */
const STATUS_CFG = {
  graded: {
    label: "Graded",
    icon: Star,
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
  },
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    cls: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
    dot: "bg-blue-500",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    cls: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
    dot: "bg-red-500 animate-pulse",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
    dot: "bg-amber-500",
  },
};

const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
};

function getStatusKey(a) {
  if (a.submissionStatus === "graded") return "graded";
  if (a.submissionStatus === "submitted") return "submitted";
  if (a.isOverdue) return "overdue";
  return "pending";
}

function StatusBadge({ assignment }) {
  const key = getStatusKey(assignment);
  const cfg = STATUS_CFG[key];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function TimeRemaining({ dueDate }) {
  const diff = new Date(dueDate) - new Date();
  if (diff < 0) return <span className="text-xs text-red-500 font-medium">Overdue</span>;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const text = days > 0 ? `${days}d remaining` : hours > 0 ? `${hours}h remaining` : "Due soon";
  const cls = days <= 1 ? "text-amber-500" : "text-slate-400 dark:text-slate-500";
  return <span className={`text-xs font-medium ${cls}`}>{text}</span>;
}

function AssignmentsTable({ assignments, pagination, currentPage, onPageChange, onView, onSubmit }) {
  if (assignments.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl p-16 text-center shadow-sm"
      >
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-3xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center relative z-10">
            <FileText className="w-10 h-10 text-studprimary dark:text-premium-gold" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl border-2 border-studprimary/20 dark:border-premium-gold/20 scale-110" 
          />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No assignments found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Try adjusting your filters.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Assignment</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a, idx) => (
            <TableRow key={a._id}>
              {/* Assignment info */}
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
                    {a.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {a.description}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                      {a.assignmentType}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {a.maxPoints} pts
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Course */}
              <TableCell>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {a.courseId?.title || "—"}
                </span>
              </TableCell>

              {/* Due date */}
              <TableCell>
                <div className="space-y-0.5">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <TimeRemaining dueDate={a.dueDate} />
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <StatusBadge assignment={a} />
              </TableCell>

              {/* Grade */}
              <TableCell>
                {a.grade !== null && a.grade !== undefined ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {a.grade}/{a.maxPoints}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {((a.grade / a.maxPoints) * 100).toFixed(0)}%
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="inline-flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onView(a)}
                    title="View details"
                    className="p-2 rounded-lg text-slate-500 hover:text-studprimary dark:hover:text-premium-gold hover:bg-studprimary/10 dark:hover:bg-premium-gold/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSubmit(a)}
                    disabled={a.submissionStatus === "submitted" || a.submissionStatus === "graded"}
                    title={a.submissionStatus === "submitted" || a.submissionStatus === "graded" ? "Already submitted" : "Submit"}
                    className="p-2 rounded-lg text-slate-500 hover:text-studprimary dark:hover:text-premium-gold hover:bg-studprimary/10 dark:hover:bg-premium-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                  </motion.button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between px-1 py-2"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {((currentPage - 1) * (pagination.limit || 10)) + 1}–
            {Math.min(currentPage * (pagination.limit || 10), pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-studprimary dark:hover:border-premium-gold hover:text-studprimary dark:hover:text-premium-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
              {currentPage} / {pagination.pages}
            </span>
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-studprimary dark:hover:border-premium-gold hover:text-studprimary dark:hover:text-premium-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AssignmentsTable;

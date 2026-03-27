import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "graded", label: "Graded" },
  { value: "overdue", label: "Overdue" },
];

function AssignmentsFilters({ courses, filters, onChange, onClear }) {
  const hasActive = filters.course !== "" || filters.status !== "all" || filters.search !== "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl p-4 mb-6 shadow-sm"
    >
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold transition-colors"
            />
          </div>
        </div>

        {/* Course */}
        <div className="min-w-[160px]">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Course
          </label>
          <select
            value={filters.course}
            onChange={(e) => onChange({ ...filters, course: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold transition-colors cursor-pointer"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Status pills */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onChange({ ...filters, status: opt.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  filters.status === opt.value
                    ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal border-studprimary dark:border-premium-gold"
                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-studprimary/50 dark:hover:border-premium-gold/50"
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Clear */}
        {hasActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors self-end"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </motion.button>
        )}

        {/* Filter icon */}
        <div className="self-end pb-2 text-slate-400 dark:text-slate-500">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

export default AssignmentsFilters;

import React from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "suspended", label: "Suspended" },
];

function EnrollmentsFilters({ filters, onChange, onClear }) {
  const hasActive = filters.status !== "all" || filters.search !== "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center gap-4 mb-10"
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[240px] max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-studprimary transition-colors" />
        <input
          type="text"
          placeholder="Search courses..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-studprimary/20 dark:focus:ring-premium-gold/20 focus:border-studprimary dark:focus:border-premium-gold transition-all shadow-sm"
        />
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2.5">
        {STATUS_OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange({ ...filters, status: opt.value })}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
              filters.status === opt.value
                ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal border-studprimary dark:border-premium-gold shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20"
                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-studprimary/50 dark:hover:border-premium-gold/50"
            }`}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {hasActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default EnrollmentsFilters;

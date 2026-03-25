import React from "react";
import { Search, X } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold transition-colors"
        />
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, status: opt.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              filters.status === opt.value
                ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal border-studprimary dark:border-premium-gold"
                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-studprimary/50 dark:hover:border-premium-gold/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hasActive && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}

export default EnrollmentsFilters;

import React from "react";
import { SlidersHorizontal, X } from "lucide-react";

const DAY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Tomorrow", value: "1" },
  { label: "Next 3 days", value: "3" },
  { label: "Next 7 days", value: "7" },
];

function UpcomingFilters({ courses, filters, onChange, onClear }) {
  const hasActive = filters.course !== "all" || filters.days !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filter
      </div>

      {/* Day range filter */}
      <div className="flex flex-wrap gap-2">
        {DAY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, days: opt.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              filters.days === opt.value
                ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal border-studprimary dark:border-premium-gold shadow-sm"
                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-studprimary/50 dark:hover:border-premium-gold/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Course filter */}
      {courses.length > 1 && (
        <select
          value={filters.course}
          onChange={(e) => onChange({ ...filters, course: e.target.value })}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold transition-colors cursor-pointer"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      )}

      {/* Clear */}
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

export default UpcomingFilters;

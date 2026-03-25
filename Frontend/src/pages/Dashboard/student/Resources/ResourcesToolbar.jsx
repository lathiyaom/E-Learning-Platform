import React from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

const SEGMENTS = [
  { id: "all", label: "All Resources" },
  { id: "recent", label: "Recently Added" },
  { id: "popular", label: "Popular" },
  { id: "subject", label: "By Subject" },
];

export default function ResourcesToolbar({
  courseOptions = [],
  selectedCourseId,
  onCourseChange,
  activeSegment,
  onSegmentChange,
  subjects = [],
  selectedSubject,
  onSubjectChange,
  searchQuery,
  onSearchChange,
  disabled = false,
}) {
  const showSubjectSelect = subjects.length > 0 && activeSegment === "subject";

  return (
    <div className="bg-white dark:bg-transparent dark:dark-glass rounded-2xl border border-slate-200 dark:border-white/10 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Course Select */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Course
            </label>
            <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-studprimary dark:text-premium-gold" />
              Learning Resources
            </div>
          </div>
          <select
            value={selectedCourseId}
            disabled={disabled || courseOptions.length === 0}
            onChange={(e) => onCourseChange?.(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {courseOptions.length === 0 ? (
              <option value="">No courses available</option>
            ) : (
              courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Segments */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </div>
          <div className="flex flex-wrap gap-2">
            {SEGMENTS.map((seg) => {
              const active = activeSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => onSegmentChange?.(seg.id)}
                  disabled={disabled}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] ${
                    active
                      ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal border-studprimary/30 dark:border-premium-gold/30 shadow-sm shadow-studprimary/20 dark:shadow-premium-gold/20"
                      : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-studprimary/40 dark:hover:border-premium-gold/40 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>

          {showSubjectSelect && (
            <div className="mt-3">
              <select
                value={selectedSubject}
                disabled={disabled || subjects.length === 0}
                onChange={(e) => onSubjectChange?.(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 transition-all disabled:opacity-60"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
            <Search className="w-3.5 h-3.5" />
            Search
          </div>
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search resources..."
              disabled={disabled}
              className="w-full h-12 px-4 pr-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 transition-all disabled:opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


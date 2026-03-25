import { BookOpen, ChevronDown } from "lucide-react";

function AttendanceCourseFilter({ enrollments, selectedCourse, onChange, isLoading }) {
  return (
    <div className="bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-6 shadow-sm">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
        Select Course
      </label>
      <div className="relative w-full md:w-80">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={selectedCourse}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold transition-colors cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">-- Select a Course --</option>
          {enrollments.map((enrollment) => {
            const cid = enrollment.courseId?._id || enrollment.courseId;
            const title = enrollment.courseId?.title || enrollment.courseTitle || `Course ${cid}`;
            return (
              <option key={enrollment._id || enrollment.id} value={cid}>
                {title}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default AttendanceCourseFilter;

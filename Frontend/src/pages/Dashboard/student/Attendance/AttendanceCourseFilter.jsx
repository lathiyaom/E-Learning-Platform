import { BookOpen, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

function AttendanceCourseFilter({ enrollments, selectedCourse, onChange, isLoading }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-10 shadow-sm"
    >
      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1">
        Select Course
      </label>
      <div className="relative w-full md:w-96 group">
        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-studprimary transition-colors pointer-events-none" />
        <select
          value={selectedCourse}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          className="w-full pl-11 pr-11 py-3 text-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-studprimary/20 dark:focus:ring-premium-gold/20 focus:border-studprimary dark:focus:border-premium-gold transition-all cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <option value="">-- Choose your course --</option>
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
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none group-hover:translate-y-[-40%] transition-transform" />
      </div>
    </motion.div>
  );
}

export default AttendanceCourseFilter;

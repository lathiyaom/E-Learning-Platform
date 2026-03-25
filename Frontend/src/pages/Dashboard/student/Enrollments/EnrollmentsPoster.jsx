import React from "react";
import { BookMarked, Sparkles } from "lucide-react";
import { getAuth } from "../../../../utils/users";

function EnrollmentsPoster({ total = 0 }) {
  const user = getAuth().user;
  const name = user?.firstName || "Student";

  return (
    <section className="relative bg-gradient-to-br from-[#F3E8FF] via-[#EDE9FE] to-[#F3E8FF] dark:from-navy-charcoal dark:to-deep-charcoal rounded-2xl md:rounded-[2.5rem] px-4 py-10 sm:px-8 sm:py-14 md:px-12 md:py-16 overflow-hidden border border-white/50 dark:border-white/10 shadow-sm dark:shadow-2xl mb-8 transition-all duration-300">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
          style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: "1.5rem 1.5rem" }}
        />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-xs font-bold tracking-wider uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>My Learning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {name}'s{" "}
            <span className="text-studprimary dark:text-premium-gold relative inline-block">
              Enrollments
              <svg className="absolute w-full h-2 -bottom-1 left-0 text-studprimary/20 dark:text-premium-gold/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">
            All your enrolled courses in one place. Track status, access materials, and continue learning.
          </p>
        </div>

        {/* Count pill */}
        <div className="self-start sm:self-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-sm shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-studprimary dark:text-premium-gold" />
          </div>
          <div className="leading-none">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {total === 1 ? "Course" : "Courses"} enrolled
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EnrollmentsPoster;

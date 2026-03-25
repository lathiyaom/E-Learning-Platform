import React from "react";
import { BookOpen, Sparkles, CalendarDays } from "lucide-react";

// Stat pill shown in the poster
function StatPill({ count }) {
  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-sm shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
        <BookOpen className="w-4 h-4 text-studprimary dark:text-premium-gold" />
      </div>
      <div className="leading-none">
        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{count}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {count === 1 ? "Lecture" : "Lectures"} today
        </p>
      </div>
    </div>
  );
}

function LecturesPoster({ count = 0 }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="relative bg-lavender-light dark:bg-navy-charcoal rounded-2xl md:rounded-[2.5rem] px-4 py-10 sm:px-8 sm:py-14 md:px-12 md:py-16 overflow-hidden border border-white/50 dark:border-white/10 shadow-sm dark:shadow-2xl mb-8 transition-all duration-300">
      {/* Ambient blobs — same pattern as help/poster.jsx */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "1.5rem 1.5rem",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Left: text */}
        <div className="space-y-4 max-w-xl">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-xs font-bold tracking-wider uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Schedule</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Today's{" "}
            <span className="text-studprimary dark:text-premium-gold relative inline-block">
              Lectures
              {/* Underline squiggle — same as help poster */}
              <svg
                className="absolute w-full h-2 -bottom-1 left-0 text-studprimary/20 dark:text-premium-gold/20 -z-10"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>{today}</span>
          </div>
        </div>

        {/* Right: stat pill */}
        <div className="self-start sm:self-auto">
          <StatPill count={count} />
        </div>
      </div>
    </section>
  );
}

export default LecturesPoster;

import React from "react";
import { BookOpen, Sparkles, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

// Stat pill shown in the poster
function StatPill({ count }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-sm shadow-sm"
    >
      <div className="w-9 h-9 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
        <BookOpen className="w-4 h-4 text-studprimary dark:text-premium-gold" />
      </div>
      <div className="leading-none">
        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{count}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {count === 1 ? "Lecture" : "Lectures"} today
        </p>
      </div>
    </motion.div>
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
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-lavender-light dark:bg-navy-charcoal rounded-2xl md:rounded-[2.5rem] px-4 py-10 sm:px-8 sm:py-14 md:px-12 md:py-16 overflow-hidden border border-white/50 dark:border-white/10 shadow-sm dark:shadow-2xl mb-8 transition-all duration-300"
    >
      {/* Ambient blobs — same pattern as help/poster.jsx */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" 
        />
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
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-xs font-bold tracking-wider uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Schedule</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
          >
            Today's{" "}
            <span className="text-studprimary dark:text-premium-gold relative inline-block">
              Lectures
              {/* Underline squiggle — same as help poster */}
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
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
              </motion.svg>
            </span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm"
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>{today}</span>
          </motion.div>
        </div>

        {/* Right: stat pill */}
        <div className="self-start sm:self-auto">
          <StatPill count={count} />
        </div>
      </div>
    </motion.section>
  );
}

export default LecturesPoster;

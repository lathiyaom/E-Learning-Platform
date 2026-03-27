import React from "react";
import { BookMarked, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getAuth } from "../../../../utils/users";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function EnrollmentsPoster({ total = 0 }) {
  const user = getAuth().user;
  const name = user?.firstName || "Student";

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative bg-gradient-to-br from-[#F3E8FF] via-[#EDE9FE] to-[#F3E8FF] dark:from-navy-charcoal dark:to-deep-charcoal rounded-2xl md:rounded-[3rem] px-4 py-10 sm:px-8 sm:py-14 md:px-12 md:py-16 overflow-hidden border border-white/50 dark:border-white/10 shadow-sm dark:shadow-2xl mb-10 transition-all duration-300"
    >
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" 
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
          style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: "1.5rem 1.5rem" }}
        />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-[10px] font-bold tracking-widest uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
            <span>My Learning Journey</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]"
          >
            {name}'s{" "}
            <span className="text-studprimary dark:text-premium-gold relative inline-block">
              Enrollments
              <motion.svg 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute w-full h-3 -bottom-1 left-0 text-studprimary/30 dark:text-premium-gold/30 -z-10" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
              >
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md"
          >
            All your enrolled courses organized in one place. Track your status, access materials, and continue your personal growth.
          </motion.p>
        </div>

        {/* Count pill */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="self-start sm:self-auto flex items-center gap-4 px-6 py-4 rounded-[2rem] bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xl dark:shadow-black/20 transition-shadow duration-300"
        >
          <div className="w-12 h-12 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center shadow-inner">
            <BookMarked className="w-6 h-6 text-studprimary dark:text-premium-gold" />
          </div>
          <div className="leading-none">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{total}</p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              {total === 1 ? "Course" : "Courses"} enrolled
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default EnrollmentsPoster;

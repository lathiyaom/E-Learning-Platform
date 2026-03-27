import { CalendarCheck, Sparkles, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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

function StatChip({ icon: Icon, label, value, accent }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="flex items-center gap-4 px-5 py-4 rounded-[2rem] bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-sm transition-shadow duration-300"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="leading-none">
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  );
}

function AttendancePoster({ present = 0, absent = 0, late = 0, percentage = 0 }) {
  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#F5F3FF] dark:from-navy-charcoal dark:to-deep-charcoal rounded-2xl md:rounded-[3rem] px-4 py-10 sm:px-8 sm:py-14 md:px-12 md:py-16 overflow-hidden border border-white/50 dark:border-white/10 shadow-sm dark:shadow-2xl mb-10 transition-all duration-300"
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" 
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
          style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: "1.5rem 1.5rem" }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-[10px] font-bold tracking-widest uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm shadow-sm"
            >
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
              <span>Academic Performance</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]"
            >
              Attendance{" "}
              <span className="text-studprimary dark:text-premium-gold relative inline-block">
                Overview
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
            
            <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">
              Maintain a detailed record of your class participation. Monitor your presence trends and stay updated with your academic consistency.
            </motion.p>
          </div>
          
          <motion.div 
            variants={itemVariants}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden sm:flex items-center justify-center w-20 h-20 rounded-[2rem] bg-studprimary/10 dark:bg-premium-gold/10 border border-studprimary/20 dark:border-premium-gold/20 self-start shadow-inner"
          >
            <CalendarCheck className="w-10 h-10 text-studprimary dark:text-premium-gold" />
          </motion.div>
        </div>

        {/* Stat chips */}
        <motion.div 
          variants={containerVariants}
          className="flex flex-wrap gap-4"
        >
          <StatChip icon={CheckCircle2} label="Present" value={present}
            accent="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" />
          <StatChip icon={XCircle} label="Absent" value={absent}
            accent="bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400" />
          <StatChip icon={Clock} label="Late" value={late}
            accent="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" />
          <StatChip icon={TrendingUp} label="Attendance %" value={`${percentage}%`}
            accent="bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold" />
        </motion.div>
      </div>
    </motion.section>
  );
}

export default AttendancePoster;

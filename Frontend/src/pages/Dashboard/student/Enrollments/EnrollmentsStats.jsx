import React from "react";
import { BookOpen, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const STAT_CFG = [
  {
    key: "active",
    label: "Active",
    icon: BookOpen,
    accent: "bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold",
    border: "border-studprimary/20 dark:border-premium-gold/20",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    accent: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/40",
  },
  {
    key: "dropped",
    label: "Dropped",
    icon: XCircle,
    accent: "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400",
    border: "border-red-200 dark:border-red-800/40",
  },
  {
    key: "certificates",
    label: "Certificates",
    icon: TrendingUp,
    accent: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/40",
  },
];

function EnrollmentsStats({ counts }) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {STAT_CFG.map(({ key, label, icon: Icon, accent, border }) => (
        <motion.div
          key={key}
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-transparent dark:dark-glass border ${border} shadow-sm hover:shadow-md transition-shadow duration-300`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${accent}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="leading-none">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{counts[key] ?? 0}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default EnrollmentsStats;

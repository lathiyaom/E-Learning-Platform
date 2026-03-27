import React from "react";
import { CalendarX, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

function LecturesEmpty() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-0 gap-0"
    >
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        {/* Icon with animated ring */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center z-10 relative">
            <CalendarX className="w-12 h-12 text-studprimary dark:text-premium-gold" />
          </div>
          <motion.div 
            animate={{ 
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.15, 0.3],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-3xl border-2 border-studprimary/30 dark:border-premium-gold/30 scale-110" 
          />
        </div>

        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-slate-900 dark:text-white mb-2"
        >
          No lectures today
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed"
        >
          You don't have any lectures scheduled for today. Enjoy your free time
          or catch up on course materials.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Check back tomorrow for upcoming lectures
        </motion.div>
      </div>
    </motion.div>
  );
}

export default LecturesEmpty;

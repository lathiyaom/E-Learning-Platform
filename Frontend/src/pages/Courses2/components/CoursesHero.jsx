import React from "react";
import { Link } from "react-router-dom";
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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CoursesHero = ({ searchQuery, onSearchChange }) => {
  return (
    <section className="relative bg-white dark:bg-navy-charcoal overflow-hidden transition-colors duration-300 pt-12 pb-14">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-20 -right-20 w-[350px] h-[350px] dark:bg-premium-gold/5 rounded-full blur-[100px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute top-0 left-0 w-[300px] h-[300px] dark:bg-primary/4 rounded-full blur-[100px]" 
        />
        <div
          className="absolute inset-0 opacity-0 dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ecb613 1px, transparent 1px)`,
            backgroundSize: "1.75rem 1.75rem",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-primary/10 dark:bg-premium-gold/10 text-primary dark:text-premium-gold text-xs font-bold tracking-wider uppercase mb-5 border border-primary/20 dark:border-premium-gold/20"
          >
            <span className="material-symbols-outlined text-sm">school</span>
            Learn From The Best
          </motion.span>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-lexend text-slate-900 dark:text-white mb-4 leading-tight tracking-tight"
          >
            Discover Your{" "}
            <span className="text-primary dark:text-premium-gold">
              Potential
            </span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Explore our curated selection of professional courses designed by
            industry leaders and world-class universities.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            variants={itemVariants}
            className="relative group max-w-xl mx-auto"
          >
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-premium-gold transition-colors text-xl pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="What do you want to learn today?"
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary/50 dark:focus:border-premium-gold/50 rounded-2xl pl-12 pr-5 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-premium-gold/10 transition-all duration-200 shadow-sm"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesHero;


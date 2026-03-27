import React from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import CourseCard from "../Student_Dashboard/RecommendedCourseCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CourseGrid = ({
  courses,
  onCourseClick,
  activeFilterCount = 0,
  onFilterToggle,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 min-w-0"
    >
      {/* Results Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onFilterToggle}
            className="xl:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-transparent dark:border-white/5 shadow-sm"
          >
            <SlidersHorizontal size={14} className="text-studprimary" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-studprimary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            Found <span className="text-studprimary dark:text-premium-gold">{courses.length}</span> Results
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden sm:inline">
            Sort by:
          </span>
          <select className="flex-1 sm:flex-none bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-studprimary/20 focus:border-studprimary outline-none px-4 py-2 cursor-pointer shadow-sm">
            <option>Most Popular</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Highest Rated</option>
          </select>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
      >
        {courses.length > 0 ? (
          courses.map((course) => (
            <motion.div key={course._id || course.id} variants={itemVariants}>
              <CourseCard
                course={course}
                showRating={true}
                showReviews={true}
                showButton={true}
                buttonText="View Details"
                onButtonClick={() => onCourseClick?.(course._id || course.id)}
              />
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10"
          >
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">
              No courses found matching your filters
            </p>
          </motion.div>
        )}
      </motion.div>

      {courses.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.button 
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-studprimary transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </motion.button>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((page) => (
              <motion.button
                key={page}
                whileTap={{ scale: 0.9 }}
                className={`w-11 h-11 flex items-center justify-center rounded-xl font-bold text-sm transition-all shadow-sm ${
                  page === 1 
                    ? "bg-studprimary text-white shadow-lg shadow-studprimary/20" 
                    : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                {page}
              </motion.button>
            ))}
            <span className="px-2 text-slate-400 font-bold">...</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-sm"
            >
              12
            </motion.button>
          </div>

          <motion.button 
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-studprimary transition-all shadow-sm"
          >
            <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CourseGrid;

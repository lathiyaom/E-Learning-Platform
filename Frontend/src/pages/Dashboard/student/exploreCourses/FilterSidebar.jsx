import React from "react";
import { X, Star, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import filterData from "./filterData";

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange }) => {
  const handleCategoryChange = (category) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: updated });
  };

  const handleLevelChange = (level) => {
    const updated = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    onFilterChange({ ...filters, levels: updated });
  };

  const handlePriceChange = (priceRange) => {
    const updated = filters.priceRanges.includes(priceRange)
      ? filters.priceRanges.filter((p) => p !== priceRange)
      : [...filters.priceRanges, priceRange];
    onFilterChange({ ...filters, priceRanges: updated });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({ ...filters, minRating: rating });
  };

  const resetFilters = () => {
    onFilterChange({
      categories: [],
      levels: [],
      priceRanges: [],
      minRating: 0,
    });
  };

  // Count active filters
  const activeFilterCount = 
    filters.categories.length + 
    filters.levels.length + 
    filters.priceRanges.length + 
    (filters.minRating > 0 ? 1 : 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm xl:hidden z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed xl:relative top-0 left-0 h-full xl:h-auto w-[300px] xl:w-72 bg-white dark:bg-[#1A1B23] xl:bg-transparent xl:dark:bg-transparent z-50 xl:z-0 transform transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } flex-shrink-0 overflow-y-auto shadow-2xl xl:shadow-none`}
      >
        <div className="sticky top-0 bg-white dark:bg-[#1A1B23] xl:hidden p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-studprimary" />
            <h3 className="font-extrabold text-lg dark:text-white">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-studprimary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            <X size={20} className="dark:text-white" />
          </motion.button>
        </div>

        {/* Filter Content */}
        <div className="p-6 xl:p-0 space-y-6 xl:space-y-8">
          {/* Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 rounded-2xl p-5"
          >
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-slate-400">
              Categories
            </h4>
            <div className="space-y-3">
              {filterData.categories.map((category) => (
                <label
                  key={category.name}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.name)}
                    onChange={() => handleCategoryChange(category.name)}
                    className="w-4 h-4 rounded-md border-slate-300 text-studprimary focus:ring-studprimary/20 dark:bg-slate-800 dark:border-white/10 cursor-pointer"
                  />
                  <span className="text-sm font-medium group-hover:text-studprimary dark:text-slate-300 transition-colors">
                    {category.name}
                  </span>
                  <span className="ml-auto text-[10px] font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-slate-500">
                    {category.count}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Price */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 rounded-2xl p-5"
          >
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-slate-400">
              Price Range
            </h4>
            <div className="space-y-3">
              {filterData.priceRanges.map((range) => (
                <label
                  key={range.value}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.priceRanges.includes(range.value)}
                    onChange={() => handlePriceChange(range.value)}
                    className="w-4 h-4 rounded-md border-slate-300 text-studprimary focus:ring-studprimary/20 dark:bg-slate-800 dark:border-white/10 cursor-pointer"
                  />
                  <span className="text-sm font-medium group-hover:text-studprimary dark:text-slate-300 transition-colors">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:border-studprimary hover:text-studprimary dark:hover:text-premium-gold disabled:opacity-30 transition-all"
          >
            Reset Filters
          </motion.button>
        </div>

        {/* Mobile Apply Button */}
        <div className="sticky bottom-0 bg-white dark:bg-[#1A1B23] xl:hidden p-6 border-t border-slate-200 dark:border-white/10">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className="w-full py-4 bg-studprimary text-white rounded-2xl text-sm font-bold shadow-lg shadow-studprimary/20 transition-all"
          >
            Apply Filters
          </motion.button>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;

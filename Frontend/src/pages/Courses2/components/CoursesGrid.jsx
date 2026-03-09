import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetMarketplaceCoursesQuery } from "../../../redux/Apis/courseApi";

// ── Course Card ────────────────────────────────────────────────────────────────
const CourseCard = ({ course, viewMode }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const courseId = course._id || course.id;
  const price = course.priceUSD ?? course.price ?? course.pricing ?? 0;

  if (viewMode === "list") {
    return (
      <div className="group bg-white dark:bg-transparent dark:dark-glass rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:border-premium-gold/20 hover:-translate-y-0.5 transition-all duration-300 flex gap-0 overflow-hidden">
        {/* Image */}
        <div className="relative w-48 sm:w-60 shrink-0 overflow-hidden">
          <img
            src={course.image || course.img}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/20 dark:to-navy-charcoal/40 pointer-events-none" />
          {course.tags && course.tags.includes("Popular") && (
            <span className="absolute top-3 left-3 bg-primary dark:bg-premium-gold text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tight">
              Popular
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-[10px] font-bold text-primary dark:text-premium-gold uppercase tracking-[0.12em] mb-1">
              {course.category}
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-lexend mb-2 group-hover:text-primary dark:group-hover:text-premium-gold transition-colors duration-200 line-clamp-1">
              {course.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-amber-500">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {course.rating || 0}
                </span>
                <span className="text-slate-400">({course.reviewCount || 0})</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {course.isPaid ? `$${price}` : "FREE"}
              </span>
            </div>
            <Link
              to={`/card/${courseId}`}
              className="text-sm font-bold px-5 py-2 bg-primary/10 dark:bg-premium-gold/10 text-primary dark:text-premium-gold rounded-xl hover:bg-primary dark:hover:bg-premium-gold hover:text-slate-900 border border-primary/20 dark:border-premium-gold/20 transition-all duration-200"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // GRID mode
  return (
    <div className="group bg-white dark:bg-transparent dark:dark-glass rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-premium-gold/5 dark:hover:border-premium-gold/20 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.image || course.img}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />

        {/* Badge */}
        {course.tags && course.tags.includes("Popular") && (
          <span className="absolute top-3 left-3 bg-primary dark:bg-premium-gold text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight shadow-md">
            Popular
          </span>
        )}

        {/* Bookmark */}
        <button
          onClick={() => setBookmarked((b) => !b)}
          aria-label="Bookmark"
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 ${
            bookmarked
              ? "bg-primary dark:bg-premium-gold text-slate-900"
              : "bg-black/20 text-white hover:bg-primary dark:hover:bg-premium-gold hover:text-slate-900"
          }`}
        >
          <span
            className="material-symbols-outlined text-lg"
            style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            bookmark
          </span>
        </button>

        {/* Rating overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-black/70 backdrop-blur rounded-lg px-2 py-1">
            <span
              className="material-symbols-outlined text-primary text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {course.rating || 0}
            </span>
          </div>
          <span className="text-white text-xs font-medium drop-shadow">
            ({course.reviewCount || 0} reviews)
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-primary dark:text-premium-gold uppercase tracking-[0.12em] mb-2">
          {course.category}
        </p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-lexend mb-3 group-hover:text-primary dark:group-hover:text-premium-gold transition-colors duration-200 line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Price + CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {course.isPaid ? `$${price}` : "FREE"}
            </span>
          </div>
          <Link
            to={`/card/${courseId}`}
            className="text-sm font-bold px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-primary dark:hover:bg-premium-gold hover:text-slate-900 dark:hover:text-slate-900 border border-slate-200 dark:border-white/10 hover:border-primary dark:hover:border-premium-gold transition-all duration-200"
          >
            Details
          </Link>
        </div>
        <div className="h-0.5 w-0 group-hover:w-full bg-primary dark:bg-premium-gold mt-4 transition-all duration-500 rounded-full" />
      </div>
    </div>
  );
};

// ── Courses Grid ───────────────────────────────────────────────────────────────
const CoursesGrid = ({
  viewMode,
  searchQuery,
  activeCategory,
  level,
  sortBy,
}) => {
  // Fetch courses from API
  const { data, isLoading, isError, error } = useGetMarketplaceCoursesQuery(sortBy);

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-24">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-premium-gold"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading courses...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-24">
        <span className="material-symbols-outlined text-6xl text-red-300 dark:text-red-600 mb-4 block">
          error
        </span>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Failed to load courses
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          {error?.data?.message || 'Something went wrong. Please try again later.'}
        </p>
      </div>
    );
  }

  const courses = data?.data || [];

  // Filter courses based on search, category, and level
  const filtered = courses.filter((c) => {
    const matchCat =
      activeCategory === "All Subjects" || c.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Empty state
  if (filtered.length === 0) {
    return (
      <div className="text-center py-24">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">
          search_off
        </span>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          No courses found
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
      }
    >
      {filtered.map((course) => (
        <CourseCard key={course._id || course.id} course={course} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default CoursesGrid;

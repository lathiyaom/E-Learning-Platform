import React from "react";
import { Star, Users, Clock, Award, ShoppingCart, Play } from "lucide-react";


const CourseInfo = ({
  course = {},
  isEnrolled = false,
  onEnroll = () => {},
  onResume = () => {},
  isLoading = false,
}) => {
  const {
    title = "Untitled Course",
    description = "",
    category = "General",
    level = "Beginner",
    rating = 0,
    reviewCount = 0,
    price = 0,
    teacher_id = null,
    lessons = [],
  } = course;

  // Extract instructor name safely
  const instructorName = teacher_id?.firstName
    ? `${teacher_id.firstName} ${teacher_id.lastName || ""}`.trim()
    : "Instructor";

  const instructorImage = teacher_id?.profileImage || teacher_id?.avatar;

  // Calculate course stats
  const lessonCount = Array.isArray(lessons) ? lessons.length : 0;
  const estimatedHours = Math.ceil(lessonCount * 1.5); // Rough estimate: 1.5 hrs per lesson

  // Format review count
  const formatReviews = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Course Header Section */}
      <div className="space-y-3 sm:space-y-4">
        {/* Category Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold">
            {category}
          </span>
          <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {level}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Rating Section */}
      {rating > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={`${
                    i < Math.floor(rating)
                      ? "fill-studprimary dark:fill-premium-gold text-studprimary dark:text-premium-gold"
                      : "text-slate-300 dark:text-slate-700"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {rating.toFixed(1)}
            </span>
          </div>
          {reviewCount > 0 && (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              ({formatReviews(reviewCount)} reviews)
            </span>
          )}
        </div>
      )}

      {/* Course Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-studprimary dark:text-premium-gold" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
              Lessons
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {lessonCount}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-studprimary dark:text-premium-gold" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
              Duration
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ~{estimatedHours}h
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Award size={18} className="text-studprimary dark:text-premium-gold" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
              Level
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white capitalize">
            {level}
          </p>
        </div>

        {price > 0 && (
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart size={18} className="text-studprimary dark:text-premium-gold" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
                Price
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ₹{price}
            </p>
          </div>
        )}
      </div>

      {/* Instructor Section */}
      {instructorName && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-lavender-light/50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-lavender-light dark:border-slate-700">
          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            Instructor
          </p>
          <div className="flex items-center gap-3">
            {instructorImage ? (
              <img
                src={instructorImage}
                alt={instructorName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-studprimary dark:border-premium-gold"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-studprimary dark:bg-premium-gold flex items-center justify-center border-2 border-studprimary dark:border-premium-gold">
                <span className="text-sm sm:text-base font-bold text-white">
                  {instructorName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {instructorName}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Course Instructor
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
        {isEnrolled ? (
          <button
            onClick={onResume}
            disabled={isLoading}
            className="flex-1 py-3 sm:py-3.5 px-6 bg-studprimary hover:bg-studprimary/90 dark:bg-premium-gold dark:hover:bg-premium-gold/90 text-white dark:text-deep-charcoal font-bold rounded-xl text-base sm:text-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20"
          >
            <Play size={20} fill="currentColor" />
            Continue Watching
          </button>
        ) : (
          <>
            <button
              onClick={onEnroll}
              disabled={isLoading}
              className="flex-1 py-3 sm:py-3.5 px-6 bg-studprimary hover:bg-studprimary/90 dark:bg-premium-gold dark:hover:bg-premium-gold/90 text-white dark:text-deep-charcoal font-bold rounded-xl text-base sm:text-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20"
            >
              <ShoppingCart size={20} />
              Enroll Now
            </button>
            {price > 0 && (
              <button className="flex-1 py-3 sm:py-3.5 px-6 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl text-base sm:text-lg transition-all active:scale-95">
                Add to Wishlist
              </button>
            )}
          </>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center">
        {isEnrolled
          ? "You're enrolled in this course. Download materials and continue learning!"
          : "Enroll now to access all lessons, materials, and community support."}
      </p>
    </div>
  );
};

export default CourseInfo;

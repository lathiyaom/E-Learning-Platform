import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Search, Star, X, Sparkles, Filter, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../../../utils/Adminlayoute";
import { useGetMarketplaceCoursesQuery } from "../../../../redux/Apis/courseApi";
import {
  useEnrollStudentMutation,
  useGetMyEnrollmentsQuery,
} from "../../../../redux/Apis/enrollmentApi";
import { ErrorToster, SuccessToster } from "../../../../components/toster";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { getBreadcrumbs } from "../../../../utils/breadcrumbs";
import posterImg from "../../../../assets/imgs/course-poster.jpg";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "price_low_to_high", label: "Price: Low to High" },
  { value: "price_high_to_low", label: "Price: High to Low" },
];

const RATING_OPTIONS = [
  { value: 0, label: "All ratings" },
  { value: 4, label: "4.0 & up" },
  { value: 3, label: "3.0 & up" },
];

const PRICE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const COURSES_PER_PAGE = 6;

const getCourseId = (course) => course?._id || course?.id;

const getCoursePrice = (course) => Number(course?.priceUSD ?? course?.price ?? course?.pricing ?? 0);

const getTeacherName = (course) => {
  const directName = course?.teacherName || course?.instructorName || course?.instructor;
  if (directName && typeof directName === "string") {
    return directName;
  }

  const teacher = course?.teacher_id || course?.teacherId || course?.createdBy;

  if (teacher && typeof teacher === "object") {
    const full = `${teacher?.firstName || ""} ${teacher?.lastName || ""}`.trim();
    if (full) return full;
    if (teacher?.name) return teacher.name;
    if (teacher?.username) return teacher.username;
  }

  return "Instructor";
};

const normalizeCourse = (course) => {
  const teacher = course?.teacher_id || course?.teacherId || course?.createdBy || null;

  return {
    id: getCourseId(course),
    title: course?.title || "Untitled Course",
    description: course?.description || "No description available.",
    category: course?.category || "General",
    image: course?.image || "https://placehold.co/640x360?text=Course",
    price: getCoursePrice(course),
    currency: course?.currency || "USD",
    rating: Number(course?.rating || 0),
    reviewCount: Number(course?.reviewCount ?? course?.reviews_count ?? course?.reviewsCount ?? 0),
    isPaid: Boolean(course?.isPaid ?? getCoursePrice(course) > 0),
    teacherName: getTeacherName(course),
    teacherAvatar:
      course?.teacherImage ||
      course?.instructorImage ||
      teacher?.profilePic ||
      teacher?.avatar ||
      null,
    organizationName: course?.organization_id?.name || course?.tenantId?.name || "Organization",
    tags: Array.isArray(course?.tags) ? course.tags : [],
    raw: course,
  };
};

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
  if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

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
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CourseCard = ({ course, enrolled, enrolling, onEnroll, getCurrencySymbol }) => {
  const teacherInitials =
    course.teacherName && course.teacherName !== "Instructor"
      ? course.teacherName
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase()
      : "IN";

  return (
    <motion.article 
      variants={itemVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group rounded-3xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-premium-gold/10 transition-all duration-300 h-full flex flex-col"
    >
      <div className="relative h-44 bg-slate-200 dark:bg-slate-900 overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-extrabold bg-white/20 backdrop-blur border border-white/30 text-white">
          {course.category}
        </div>

        <div className="absolute right-3 bottom-3 rounded-xl bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 shadow-sm">
          {course.isPaid ? `${getCurrencySymbol(course.currency)}${course.price}` : "Free"}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Star size={14} className="fill-studprimary text-studprimary dark:fill-premium-gold dark:text-premium-gold" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{course.rating.toFixed(1)}</span>
          <span>({course.reviewCount.toLocaleString()} reviews)</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 line-clamp-2 min-h-[3.5rem] group-hover:text-studprimary dark:group-hover:text-premium-gold transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 min-h-[2.5rem]">
          {course.description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
            {course.teacherAvatar ? (
              <img src={course.teacherAvatar} alt={course.teacherName} className="w-full h-full object-cover" />
            ) : (
              teacherInitials
            )}
            <div className="absolute inset-0 border border-slate-200/20 dark:border-white/5 rounded-full pointer-events-none" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{course.teacherName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-widest font-bold opacity-70">{course.organizationName}</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onEnroll(course.id)}
          disabled={enrolled || enrolling || !course.id}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${
            enrolled
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300 shadow-sm"
              : "bg-lavender-light dark:bg-white/5 text-studprimary dark:text-premium-gold hover:bg-studprimary hover:text-white dark:hover:bg-premium-gold dark:hover:text-deep-charcoal shadow-sm hover:shadow-lg hover:shadow-studprimary/20 dark:hover:shadow-premium-gold/10"
          } disabled:opacity-70`}
        >
          {enrolled ? "Enrolled" : "Enroll Now"}
        </motion.button>
      </div>
    </motion.article>
  );
};

const ExplorePagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-1 text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${
              currentPage === page
                ? "bg-[#b8893a] text-white"
                : "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const ExploreCourses = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: coursesData, isLoading } = useGetMarketplaceCoursesQuery(sortBy);
  const { data: enrollmentsData, refetch: refetchEnrollments } = useGetMyEnrollmentsQuery();
  const [enrollStudent, { isLoading: enrolling }] = useEnrollStudentMutation();

  const courses = coursesData?.data || [];
  const enrollments = enrollmentsData?.data || [];

  const normalizedCourses = useMemo(() => courses.map(normalizeCourse).filter((course) => Boolean(course.id)), [courses]);

  const enrolledCourseIds = useMemo(() => {
    return new Set(
      enrollments.map((item) => {
        const id = item.courseId?._id || item.courseId || item.course_id?._id || item.course_id;
        return id?.toString();
      }),
    );
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return normalizedCourses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.category.toLowerCase().includes(normalizedSearch) ||
        course.teacherName.toLowerCase().includes(normalizedSearch) ||
        course.tags.join(" ").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "all" || course.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && !course.isPaid) ||
        (priceFilter === "paid" && course.isPaid);

      const matchesRating = course.rating >= minRating;
      const matchesTeacher = teacherFilter === "all" || course.teacherName === teacherFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesTeacher;
    });
  }, [normalizedCourses, search, categoryFilter, priceFilter, minRating, teacherFilter]);

  const categories = useMemo(() => {
    const categoryBucket = {};
    normalizedCourses.forEach((course) => {
      categoryBucket[course.category] = (categoryBucket[course.category] || 0) + 1;
    });

    return Object.entries(categoryBucket)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [normalizedCourses]);

  const teachers = useMemo(() => {
    const teacherBucket = {};
    normalizedCourses.forEach((course) => {
      if (course.teacherName && course.teacherName !== "Instructor") {
        teacherBucket[course.teacherName] = (teacherBucket[course.teacherName] || 0) + 1;
      }
    });

    return Object.entries(teacherBucket)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [normalizedCourses]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, categoryFilter, priceFilter, minRating, teacherFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(start, start + COURSES_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (priceFilter !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (teacherFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const getCurrencySymbol = (currency) => {
    const map = { USD: "$", INR: "₹", EUR: "€" };
    return map[currency] || "$";
  };

  const handleEnroll = async (courseId) => {
    if (!courseId) return;

    try {
      await enrollStudent({ courseId }).unwrap();
      SuccessToster("Enrolled successfully", 2500);
      refetchEnrollments();
    } catch (error) {
      ErrorToster(getApiErrorMessage(error, "Failed to enroll"), 3000);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setPriceFilter("all");
    setMinRating(0);
    setTeacherFilter("all");
  };

  const startResult = filteredCourses.length === 0 ? 0 : (currentPage - 1) * COURSES_PER_PAGE + 1;
  const endResult = Math.min(currentPage * COURSES_PER_PAGE, filteredCourses.length);

  return (
    <AdminLayout showSearch={false} breadcrumbItems={getBreadcrumbs("EXPLORE_COURSES")}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-6 xl:space-y-7"
      >
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden border border-slate-200/70 dark:border-white/10 bg-navy-charcoal shadow-xl"
        >
          <motion.img 
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src={posterImg} 
            alt="Explore Courses" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101a35]/95 via-[#101a35]/80 to-[#111827]/45" />

          <div className="relative z-10 p-8 sm:p-10 lg:p-14 max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-flex items-center rounded-full bg-studprimary/90 text-white text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-widest gap-2"
            >
              <Sparkles size={12} />
              Trending Now
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-4 text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight"
            >
              Master AI & Machine Learning with Experts
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-4 text-slate-200 text-base sm:text-lg max-w-xl opacity-90"
            >
              Unlock the power of artificial intelligence. Join thousands of students in our most popular
              career path this month.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="mt-8 rounded-xl bg-studprimary hover:bg-[#c79743] hover:shadow-2xl hover:shadow-studprimary/20 text-white font-bold px-8 py-4 transition-all duration-300 flex items-center gap-2"
            >
              Explore Path
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, mentors, or topics..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111318] text-slate-900 dark:text-white focus:ring-2 focus:ring-studprimary/20 focus:border-studprimary transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 font-bold text-xs uppercase tracking-widest"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-studprimary text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px]">
                    {activeFilterCount}
                  </span>
                )}
              </motion.button>

              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 hidden sm:block">
                Sort:
              </label>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111318] text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-studprimary/20 outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.section>

        <section className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 xl:gap-8 min-h-[600px]">
          <AnimatePresence>
            {mobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFilterOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40"
                aria-label="Close filters"
              />
            )}
          </AnimatePresence>

          <aside
            className={`fixed lg:static top-0 left-0 z-40 h-full lg:h-auto w-[300px] lg:w-auto bg-white dark:bg-[#0F1115] lg:bg-transparent lg:dark:bg-transparent border-r lg:border-0 border-slate-200 dark:border-white/10 transition-transform duration-500 p-6 lg:p-0 overflow-y-auto ${
              mobileFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="lg:hidden flex items-center justify-between mb-8">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-studprimary" />
                Filters
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5"
              >
                <X size={20} className="text-slate-500" />
              </motion.button>
            </div>

            <div className="space-y-6 lg:space-y-8">
              {/* Category Filter */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-5 shadow-sm"
              >
                <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-studprimary" />
                  Categories
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer group">
                    <input
                      type="radio"
                      name="category-filter"
                      checked={categoryFilter === "all"}
                      onChange={() => setCategoryFilter("all")}
                      className="w-4 h-4 text-studprimary focus:ring-studprimary/20 border-slate-300 dark:border-white/10"
                    />
                    <span className="group-hover:text-studprimary transition-colors">All Categories</span>
                  </label>

                  {categories.map((category) => (
                    <label
                      key={category.name}
                      className="flex items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer group"
                    >
                      <div className="inline-flex items-center gap-3">
                        <input
                          type="radio"
                          name="category-filter"
                          checked={categoryFilter === category.name}
                          onChange={() => setCategoryFilter(category.name)}
                          className="w-4 h-4 text-studprimary focus:ring-studprimary/20 border-slate-300 dark:border-white/10"
                        />
                        <span className="group-hover:text-studprimary transition-colors">{category.name}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full group-hover:bg-studprimary group-hover:text-white transition-all">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Rating Filter */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-5 shadow-sm"
              >
                <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-studprimary" />
                  Minimum Rating
                </h3>
                <div className="space-y-3">
                  {RATING_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating-filter"
                        checked={minRating === option.value}
                        onChange={() => setMinRating(option.value)}
                        className="w-4 h-4 text-studprimary focus:ring-studprimary/20 border-slate-300 dark:border-white/10"
                      />
                      <span className="group-hover:text-studprimary transition-colors">{option.label}</span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Reset Filters */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
                className="w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-studprimary hover:text-studprimary dark:hover:text-premium-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                Reset All Filters
              </motion.button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Found <span className="text-studprimary dark:text-premium-gold mx-1">{filteredCourses.length}</span> Amazing Courses
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 text-center py-20"
                >
                  <div className="inline-block w-8 h-8 border-4 border-studprimary/20 border-t-studprimary rounded-full animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Analyzing Marketplace...</p>
                </motion.div>
              ) : filteredCourses.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-3xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 text-center py-20 px-6"
                >
                  <Search size={48} className="mx-auto text-slate-200 dark:text-white/5 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Courses Found</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">We couldn't find any courses matching your current filters. Try adjusting your search criteria.</p>
                  <button onClick={resetFilters} className="mt-6 text-studprimary font-bold text-sm underline">Clear all search criteria</button>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {paginatedCourses.map((course) => {
                    const enrolled = enrolledCourseIds.has(String(course.id));

                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        enrolled={enrolled}
                        enrolling={enrolling}
                        onEnroll={handleEnroll}
                        getCurrencySymbol={getCurrencySymbol}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {!isLoading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <ExplorePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))}
                />
              </motion.div>
            )}
          </div>
        </section>
      </motion.div>
    </AdminLayout>
  );
};

export default ExploreCourses;

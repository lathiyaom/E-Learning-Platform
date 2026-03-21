import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Search, Star, X } from "lucide-react";
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
    <article className="group rounded-3xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-premium-gold/10 transition-all duration-300 h-full flex flex-col">
      <div className="relative h-44 bg-slate-200 dark:bg-slate-900 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-extrabold bg-white/20 backdrop-blur border border-white/30 text-white">
          {course.category}
        </span>

        <span className="absolute right-3 bottom-3 rounded-xl bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 shadow-sm">
          {course.isPaid ? `${getCurrencySymbol(course.currency)}${course.price}` : "Free"}
        </span>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Star size={14} className="fill-studprimary text-studprimary dark:fill-premium-gold dark:text-premium-gold" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{course.rating.toFixed(1)}</span>
          <span>({course.reviewCount.toLocaleString()} reviews)</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 min-h-[2.5rem]">
          {course.description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
            {course.teacherAvatar ? (
              <img src={course.teacherAvatar} alt={course.teacherName} className="w-full h-full object-cover" />
            ) : (
              teacherInitials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{course.teacherName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{course.organizationName}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEnroll(course.id)}
          disabled={enrolled || enrolling || !course.id}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            enrolled
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300"
              : "bg-lavender-light dark:bg-white/5 text-studprimary dark:text-premium-gold hover:bg-studprimary hover:text-white dark:hover:bg-premium-gold dark:hover:text-deep-charcoal"
          } disabled:opacity-70`}
        >
          {enrolled ? "Enrolled" : "Enroll Now"}
        </button>
      </div>
    </article>
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
      <div className="space-y-6 xl:space-y-7">
        <section className="relative rounded-3xl overflow-hidden border border-slate-200/70 dark:border-white/10 bg-navy-charcoal">
          <img src={posterImg} alt="Explore Courses" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101a35]/95 via-[#101a35]/80 to-[#111827]/45" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-[#c79743] text-white text-[11px] font-bold px-3 py-1 uppercase tracking-wider">
              Trending Now
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Master AI & Machine Learning with Experts
            </h1>
            <p className="mt-3 text-slate-200 text-base sm:text-lg max-w-xl">
              Unlock the power of artificial intelligence. Join thousands of students in our most popular
              career path this month.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-[#c79743] hover:bg-[#b48436] text-white font-bold px-6 py-3 transition-colors"
            >
              Explore Path
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, mentors, or topics..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111318] text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              >
                <Menu size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-studprimary text-white text-xs px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <label className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                Sort by:
              </label>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111318] text-slate-900 dark:text-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 xl:gap-7">
          {mobileFilterOpen && (
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px] lg:hidden z-30"
              aria-label="Close filters"
            />
          )}

          <aside
            className={`fixed lg:static top-0 left-0 z-40 h-full lg:h-auto w-[290px] sm:w-[320px] lg:w-auto bg-white dark:bg-[#1A1B23] lg:bg-transparent lg:dark:bg-transparent border-r lg:border-0 border-slate-200 dark:border-white/10 transition-transform duration-300 p-4 sm:p-5 lg:p-0 overflow-y-auto ${
              mobileFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="lg:hidden flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} className="text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            <div className="space-y-5 lg:space-y-6">
              <div className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-4">
                <h3 className="text-xs font-extrabold tracking-wide text-slate-400 uppercase mb-3">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name="category-filter"
                      checked={categoryFilter === "all"}
                      onChange={() => setCategoryFilter("all")}
                      className="text-studprimary focus:ring-studprimary"
                    />
                    <span>All Categories</span>
                  </label>

                  {categories.map((category) => (
                    <label
                      key={category.name}
                      className="flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="category-filter"
                          checked={categoryFilter === category.name}
                          onChange={() => setCategoryFilter(category.name)}
                          className="text-studprimary focus:ring-studprimary"
                        />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{category.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-4">
                <h3 className="text-xs font-extrabold tracking-wide text-slate-400 uppercase mb-3">Rating</h3>
                <div className="space-y-2">
                  {RATING_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <input
                        type="radio"
                        name="rating-filter"
                        checked={minRating === option.value}
                        onChange={() => setMinRating(option.value)}
                        className="text-studprimary focus:ring-studprimary"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-4">
                <h3 className="text-xs font-extrabold tracking-wide text-slate-400 uppercase mb-3">Teacher</h3>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name="teacher-filter"
                      checked={teacherFilter === "all"}
                      onChange={() => setTeacherFilter("all")}
                      className="text-studprimary focus:ring-studprimary"
                    />
                    <span>All Teachers</span>
                  </label>

                  {teachers.map((teacher) => (
                    <label
                      key={teacher.name}
                      className="flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <div className="inline-flex items-center gap-2 min-w-0">
                        <input
                          type="radio"
                          name="teacher-filter"
                          checked={teacherFilter === teacher.name}
                          onChange={() => setTeacherFilter(teacher.name)}
                          className="text-studprimary focus:ring-studprimary"
                        />
                        <span className="truncate">{teacher.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{teacher.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 p-4">
                <h3 className="text-xs font-extrabold tracking-wide text-slate-400 uppercase mb-3">Price</h3>
                <div className="space-y-2">
                  {PRICE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <input
                        type="radio"
                        name="price-filter"
                        checked={priceFilter === option.value}
                        onChange={() => setPriceFilter(option.value)}
                        className="text-studprimary focus:ring-studprimary"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
              >
                Reset All Filters
              </button>
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Showing <span className="font-bold text-slate-900 dark:text-white">{startResult}</span>-
                <span className="font-bold text-slate-900 dark:text-white">{endResult}</span> of{" "}
                <span className="font-bold text-slate-900 dark:text-white">{filteredCourses.length}</span> results
              </p>
            </div>

            {isLoading ? (
              <div className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 text-center py-12 text-slate-500 dark:text-slate-400">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#1A1B23] border border-slate-200 dark:border-white/10 text-center py-12 text-slate-500 dark:text-slate-400">
                No courses found for your current filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                </div>

                <ExplorePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default ExploreCourses;

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import {
  selectIsAuthenticated,
  useGetUserBookmarksQuery,
  useRemoveBookmarkMutation,
} from "../../redux";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

const normalizeBookmarkedCourse = (bookmark) => {
  const fromCourseId = bookmark?.courseId;
  const fromCourse = bookmark?.Course;
  const course =
    (fromCourseId && typeof fromCourseId === "object" ? fromCourseId : null) ||
    (fromCourse && typeof fromCourse === "object" ? fromCourse : null) ||
    bookmark;

  const id =
    course?._id ||
    course?.id ||
    (typeof fromCourseId === "string" ? fromCourseId : "") ||
    (typeof fromCourse === "string" ? fromCourse : "");

  if (!id) return null;

  return {
    id: String(id),
    title: course?.title || "Untitled Course",
    category: course?.category || "General",
    description: course?.description || "",
    image: course?.image || course?.img || "",
    rating: course?.rating || 0,
    reviewCount: course?.reviewCount || 0,
    isPaid: Boolean(course?.isPaid),
    price: course?.priceUSD ?? course?.price ?? course?.pricing ?? 0,
    currency: course?.currency || "USD",
  };
};

function Bookmarks() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: bookmarkData, isLoading, isError } = useGetUserBookmarksQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [removeBookmark, { isLoading: isRemoving }] = useRemoveBookmarkMutation();

  const bookmarks = useMemo(() => {
    const raw = bookmarkData?.data || bookmarkData || [];
    return raw.map(normalizeBookmarkedCourse).filter(Boolean);
  }, [bookmarkData]);

  const handleRemove = async (courseId) => {
    if (!courseId) return;
    try {
      await removeBookmark(courseId).unwrap();
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  return (
    <Layout>
      <section className="bg-slate-50 dark:bg-deep-charcoal min-h-[70vh] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Bookmarks</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Quick access to saved courses.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-primary/40 dark:hover:border-premium-gold/40 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg leading-none">arrow_back</span>
              Back To Courses
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="text-center py-20 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">
                lock
              </span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Login required</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sign in to see your bookmarked courses.
              </p>
              <Link
                to="/Login"
                className="inline-flex mt-5 px-5 py-2.5 rounded-xl bg-primary dark:bg-premium-gold text-slate-900 font-bold"
              >
                Go To Login
              </Link>
            </div>
          )}

          {isAuthenticated && isLoading && (
            <div className="text-center py-24">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-12 w-12 border-b-2 border-primary dark:border-premium-gold rounded-full"
              />
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading bookmarks...</p>
            </div>
          )}

          {isAuthenticated && isError && (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-6xl text-red-300 dark:text-red-600 mb-4 block">
                error
              </span>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                Failed to load bookmarks
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Please try again in a moment.
              </p>
            </div>
          )}

          {isAuthenticated && !isLoading && !isError && bookmarks.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">
                bookmark_remove
              </span>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                No bookmarks yet
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Save courses from the courses page to see them here.
              </p>
            </div>
          )}

          {isAuthenticated && !isLoading && !isError && bookmarks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((course) => {
                const currencySymbol =
                  course.currency === "INR" ? "INR " : course.currency === "EUR" ? "EUR " : "$";

                return (
                  <motion.article
                    key={course.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-white/5">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <span className="material-symbols-outlined text-4xl">image</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-[10px] font-bold text-primary dark:text-premium-gold uppercase tracking-[0.12em] mb-2">
                        {course.category}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 min-h-[2.3rem]">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                        <span className="font-semibold">{course.rating}</span>
                        <span>({course.reviewCount})</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/10 pt-4">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {course.isPaid ? `${currencySymbol}${course.price}` : "FREE"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/card/${course.id}`}
                            className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-primary dark:hover:bg-premium-gold hover:text-slate-900 transition-all duration-200"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => handleRemove(course.id)}
                            disabled={isRemoving}
                            className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-500 transition-all duration-200 disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Bookmarks;
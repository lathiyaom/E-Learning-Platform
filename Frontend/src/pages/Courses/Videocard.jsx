import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, BookOpen, Layers, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  useGetCourseByIdQuery,
  useGetMarketplaceCoursesQuery,
  useGetUserBookmarksQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  selectIsAuthenticated,
} from "../../redux";
import {
  useEnrollStudentMutation,
  useGetMyEnrollmentsQuery,
} from "../../redux/Apis/enrollmentApi";
import CourseInfo from "./CourseInfo";
import LessonTabs from "./LessonTabs";
import VideoPlayer from "./VideoPlayer";

const extractVideoUrl = (lesson) => {
  if (!lesson) return "";
  return lesson.videoUrl || lesson.video_url || "";
};

const normalizeLessons = (course) => {
  if (!course) return [];

  if (Array.isArray(course.lessons) && course.lessons.length > 0) {
    return course.lessons;
  }

  const fallbackVideo = course.videoUrl || course.video_url;
  if (fallbackVideo) {
    return [
      {
        _id: "legacy-0",
        videoUrl: fallbackVideo,
        description: "Lesson 1",
      },
    ];
  }

  return [];
};

export default function Videocard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [activeLesson, setActiveLesson] = useState(0);

  const { data: courseById, isLoading: loadingById } = useGetCourseByIdQuery(id, {
    skip: !id,
  });
  const {
    data: coursesData,
    isLoading: loadingCourses,
    error: marketplaceError,
  } = useGetMarketplaceCoursesQuery("popular");
  const { data: myEnrollments } = useGetMyEnrollmentsQuery();
  const [enrollStudent, { isLoading: isEnrolling }] = useEnrollStudentMutation();
  const { data: bookmarkData } = useGetUserBookmarksQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addBookmark, { isLoading: isAddingBookmark }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: isRemovingBookmark }] = useRemoveBookmarkMutation();

  let card = location.state?.course || location.state || courseById?.data || null;

  if (!card && coursesData?.data?.length && id) {
    const normalizedId = String(id).toLowerCase();
    card = coursesData.data.find(
      (course) => String(course._id || course.id).toLowerCase() === normalizedId
    );
  }

  const lessons = useMemo(() => normalizeLessons(card), [card]);

  const safeActiveLessonIndex = useMemo(() => {
    if (lessons.length === 0) return 0;
    return Math.min(activeLesson, lessons.length - 1);
  }, [activeLesson, lessons.length]);

  const currentLesson = lessons[safeActiveLessonIndex] || null;
  const currentCourseId = String(card?._id || card?.id || id || "");
  const normalizedTags = useMemo(
    () => (Array.isArray(card?.tags) ? card.tags.filter(Boolean).slice(0, 6) : []),
    [card?.tags]
  );

  const bookmarkedCourseIds = useMemo(() => {
    const bookmarks = bookmarkData?.data || bookmarkData || [];
    return new Set(
      bookmarks
        .map((bookmark) =>
          String(
            bookmark?._id ||
              bookmark?.id ||
              bookmark?.courseId?._id ||
              bookmark?.courseId ||
              bookmark?.Course?._id ||
              bookmark?.Course?.id ||
              ""
          )
        )
        .filter(Boolean)
    );
  }, [bookmarkData]);

  const isBookmarked = bookmarkedCourseIds.has(currentCourseId);
  const isBookmarkBusy = isAddingBookmark || isRemovingBookmark;

  const subtitleMeta = useMemo(() => {
    const parts = [];
    if (card?.category) parts.push(card.category);
    if (card?.level) parts.push(card.level);
    if (lessons.length > 0) parts.push(`${lessons.length} lessons`);
    return parts;
  }, [card?.category, card?.level, lessons.length]);

  const isEnrolled = useMemo(() => {
    const enrollmentRows = myEnrollments?.data;
    if (!Array.isArray(enrollmentRows) || !card?._id) return false;

    return enrollmentRows.some((enrollment) => {
      const enrollmentCourseId =
        enrollment?.course_id?._id || enrollment?.course_id || enrollment?.courseId;
      return String(enrollmentCourseId) === String(card._id);
    });
  }, [myEnrollments?.data, card?._id]);

  const handleEnroll = async () => {
    if (!card?._id) return;

    try {
      await enrollStudent({ course_id: card._id }).unwrap();
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  const handleContinue = () => {
    setActiveLesson(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleBookmark = async () => {
    if (!currentCourseId || !isAuthenticated) return;

    try {
      if (isBookmarked) {
        await removeBookmark(currentCourseId).unwrap();
      } else {
        await addBookmark(currentCourseId).unwrap();
      }
    } catch (error) {
      console.error("Bookmark toggle failed:", error);
    }
  };

  if (loadingById || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-deep-charcoal dark:via-[#262424] dark:to-[#2a2828] p-4">
        <div className="text-center bg-white/90 dark:bg-[#262424]/90 border border-gray-200 dark:border-[#3a3737] rounded-2xl shadow-xl px-8 py-10 w-full max-w-md backdrop-blur-sm">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-studprimary/20 dark:bg-premium-gold/20 motion-safe:animate-pulse" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-studprimary dark:border-t-premium-gold" />
          </div>
          <p className="mt-5 text-gray-700 dark:text-gray-200 font-medium">Loading course details...</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Preparing your personalized learning view</p>
        </div>
      </div>
    );
  }

  if (marketplaceError && !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-deep-charcoal dark:via-[#262424] dark:to-[#2a2828] p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-deep-charcoal p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-[#3a3737]">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error loading course details</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {marketplaceError?.data?.message || marketplaceError?.message || "Unknown error"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/courses")}
              className="bg-studprimary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-deep-charcoal text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-deep-charcoal dark:via-[#262424] dark:to-[#2a2828] p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-deep-charcoal p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-[#3a3737]">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-4">Course not found</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            The course you are looking for does not exist or has been removed.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/courses")}
              className="bg-studprimary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-deep-charcoal text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-deep-charcoal dark:via-[#262424] dark:to-[#2a2828] p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-deep-charcoal p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-[#3a3737]">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-4">No videos available</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            This course does not have videos yet. Please check back later.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-studprimary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-deep-charcoal dark:via-[#262424] dark:to-[#2a2828] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-studprimary/10 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.1, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-2xl border border-gray-200 dark:border-[#3a3737] bg-white/90 dark:bg-[#262424]/90 backdrop-blur-sm shadow-lg p-5 sm:p-6 lg:p-8 transition-all duration-300"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-studprimary hover:text-opacity-80 dark:hover:text-premium-gold transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5 lg:gap-8 items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-deep-charcoal dark:text-white">
                {card.title}
              </h1>

              {subtitleMeta.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600 dark:text-gray-300">
                  {subtitleMeta.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-[#2f2c2c] border border-gray-200 dark:border-[#434040] px-3 py-1 font-medium"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {normalizedTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {normalizedTags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-studprimary/10 dark:bg-premium-gold/10 text-deep-charcoal dark:text-premium-gold rounded-full text-sm font-semibold border border-studprimary/20 dark:border-premium-gold/20"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-gradient-to-br from-studprimary/10 to-transparent dark:from-premium-gold/10 dark:to-transparent border border-studprimary/20 dark:border-premium-gold/20 p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
                Now Watching
              </p>
              <p className="text-base sm:text-lg font-semibold text-deep-charcoal dark:text-white line-clamp-2">
                {currentLesson?.description || `Lesson ${safeActiveLessonIndex + 1}`}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-studprimary dark:text-premium-gold">
                <BookOpen className="w-4 h-4" />
                Lesson {safeActiveLessonIndex + 1} of {lessons.length}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)] gap-6 lg:gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.section
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl border border-gray-200 dark:border-[#3a3737] bg-white dark:bg-[#2a2828] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-[#3a3737] bg-gray-50/80 dark:bg-[#2f2c2c]/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Course Preview</p>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Dynamic stream based on selected lesson
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                <VideoPlayer
                  videoUrl={extractVideoUrl(currentLesson)}
                  title={card.title}
                  description={currentLesson?.description || ""}
                />
              </div>
            </motion.section>

            {lessons.length > 1 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.16 }}
                className="rounded-2xl border border-gray-200 dark:border-[#3a3737] bg-white dark:bg-[#2a2828] shadow-lg p-4 sm:p-5 lg:p-6"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-deep-charcoal dark:text-white mb-4">
                  Course Content ({lessons.length} lessons)
                </h3>
                <LessonTabs
                  lessons={lessons}
                  currentIndex={safeActiveLessonIndex}
                  onLessonChange={setActiveLesson}
                />
              </motion.section>
            )}

            {(card.description || card.content) && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.22 }}
                className="rounded-2xl border border-gray-200 dark:border-[#3a3737] bg-white dark:bg-[#2a2828] shadow-lg p-5 sm:p-6 lg:p-8"
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-deep-charcoal dark:text-white mb-4">
                  About This Course
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
                  {card.description || card.content}
                </p>
              </motion.section>
            )}
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
            className="xl:sticky xl:top-24"
          >
            <div className="rounded-2xl border border-gray-200 dark:border-[#3a3737] bg-white dark:bg-[#2a2828] shadow-lg p-4 sm:p-5 lg:p-6">
              <CourseInfo
                course={card}
                isEnrolled={isEnrolled}
                onEnroll={handleEnroll}
                onResume={handleContinue}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={isBookmarked}
                canBookmark={isAuthenticated}
                isLoading={isEnrolling || isBookmarkBusy}
              />
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

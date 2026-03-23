import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  useGetCourseByIdQuery,
  useGetMarketplaceCoursesQuery,
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

  if (loadingById || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-deep-charcoal dark:to-[#2a2828]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-studprimary mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (marketplaceError && !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-deep-charcoal dark:to-[#2a2828] p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-deep-charcoal p-8 rounded-xl shadow-lg">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-deep-charcoal dark:to-[#2a2828] p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-deep-charcoal p-8 rounded-xl shadow-lg">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-deep-charcoal dark:to-[#2a2828] p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-deep-charcoal p-8 rounded-xl shadow-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-deep-charcoal dark:to-[#2a2828] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-studprimary hover:text-opacity-80 dark:hover:text-premium-gold transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-deep-charcoal dark:text-white mb-2">
            {card.title}
          </h1>

          {card.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {card.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-studprimary/10 dark:bg-premium-gold/10 text-deep-charcoal dark:text-premium-gold rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-[#2a2828] rounded-xl shadow-lg overflow-hidden">
              <VideoPlayer
                videoUrl={extractVideoUrl(currentLesson)}
                title={card.title}
                description={currentLesson?.description || ""}
              />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <CourseInfo
              course={card}
              isEnrolled={isEnrolled}
              onEnroll={handleEnroll}
              onResume={handleContinue}
              isLoading={isEnrolling}
            />
          </div>
        </div>

        {lessons.length > 1 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-[#2a2828] rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-semibold text-deep-charcoal dark:text-white mb-4">
                Course Content ({lessons.length} lessons)
              </h3>
              <LessonTabs
                lessons={lessons}
                currentIndex={safeActiveLessonIndex}
                onLessonChange={setActiveLesson}
              />
            </div>
          </div>
        )}

        {(card.description || card.content) && (
          <div className="bg-white dark:bg-[#2a2828] rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-deep-charcoal dark:text-white mb-4">
              About This Course
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {card.description || card.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

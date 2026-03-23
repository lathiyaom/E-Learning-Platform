import React, { useMemo, useState } from "react";
import ProgressCard from "./ProgressCard";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";
import { Code2, PlayCircle } from "lucide-react";

const clampPercent = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const isUsableCourseObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Boolean(
    value.title ||
      value.description ||
      value.category ||
      value.teacher_id ||
      value.createdBy ||
      value.videoUrl ||
      value.video_url ||
      (Array.isArray(value.lessons) && value.lessons.length > 0)
  );
};

const resolveEnrollmentCourse = (enrollment) => {
  const candidates = [
    enrollment?.courseId,
    enrollment?.course_id,
    enrollment?.course,
  ];

  return candidates.find(isUsableCourseObject) || {};
};

function MyProgress() {
  const DEFAULT_COUNT = 3;
  const [visibleCount, setVisibleCount] = useState(DEFAULT_COUNT);

  const { data: enrollmentsData, isLoading } = useGetMyEnrollmentsQuery();

  const enrollments = enrollmentsData?.data || [];

  const visibleCourses = useMemo(
    () => enrollments.slice(0, visibleCount),
    [enrollments, visibleCount],
  );

  const canShowMore = visibleCount < enrollments.length;
  const canShowLess = visibleCount > DEFAULT_COUNT;

  const handleViewAll = () => {
    setVisibleCount((prev) => Math.min(prev + 3, enrollments.length));
  };

  const handleShowLess = () => {
    setVisibleCount(DEFAULT_COUNT);
  };

  if (isLoading) {
    return (
      <section>
        <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white mb-6">
          <span className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></span>
          My Learning Progress
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-studprimary"></div>
        </div>
      </section>
    );
  }

  if (enrollments.length === 0) {
    return (
      <section>
        <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white mb-6">
          <span className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></span>
          My Learning Progress
        </h3>
        <div className="text-center py-8 text-gray-500">
          You haven't enrolled in any courses yet. Start learning today!
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-row justify-center items-center ">
          <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></span>
            My Learning Progress
          </h3>
        </div>
        <div className="flex items-center gap-3 ">
          {canShowLess && (
            <button
              type="button"
              onClick={handleShowLess}
              className="text-xs font-bold text-slate-500 hover:text-studprimary dark:hover:text-premium-gold uppercase tracking-widest transition-all"
            >
              Show Less
            </button>
          )}
          {canShowMore && (
            <button
              type="button"
              onClick={handleViewAll}
              className="text-xs font-bold text-studprimary dark:text-premium-gold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleCourses.map((enrollment) => {
          const course = resolveEnrollmentCourse(enrollment);
          
          // Build lesson links - safely extract YouTube/Vimeo URLs
          const lessonLinks = [];
          if (Array.isArray(course.lessons) && course.lessons.length > 0) {
            course.lessons.forEach((lesson) => {
              const videoUrl = lesson.videoUrl || lesson.video_url;
              if (videoUrl) {
                lessonLinks.push({
                  videoUrl: videoUrl,
                  description: lesson.description || "",
                });
              }
            });
          }
          
          // Fallback to single legacy video if no lessons array
          if (lessonLinks.length === 0 && (course.videoUrl || course.video_url)) {
            lessonLinks.push({
              videoUrl: course.videoUrl || course.video_url,
              description: "Course intro",
            });
          }

          const totalLessons = lessonLinks.length || Number(course.totalLessons) || 0;

          const completedLessonsCandidates = [
            enrollment.completedLessons,
            enrollment.completed_lectures,
            enrollment.lessonsDone,
            enrollment.completedCount,
          ];
          const completedLessonsRaw = completedLessonsCandidates.find((val) => Number.isFinite(Number(val)));
          const completedLessons = Number.isFinite(Number(completedLessonsRaw))
            ? Math.max(0, Number(completedLessonsRaw))
            : null;

          const rawProgressCandidates = [
            enrollment.progressPercent,
            enrollment.progress,
            enrollment.course_progress,
          ];
          const rawProgress = rawProgressCandidates.find((val) => Number.isFinite(Number(val)));

          const computedProgress =
            completedLessons !== null && totalLessons > 0
              ? (completedLessons / totalLessons) * 100
              : Number(rawProgress ?? 0);

          const completionValue = clampPercent(computedProgress);

          const lessonsDone =
            completedLessons !== null
              ? Math.min(totalLessons, Math.max(0, Math.round(completedLessons)))
              : Math.min(totalLessons, Math.floor((completionValue / 100) * totalLessons));

          const teacher = course.teacher_id || course.createdBy || {};
          const fallbackInstructorName =
            course.teacherName || course.instructorName || course.instructor || "Instructor";

          const instructorName =
            teacher.firstName
              ? `${teacher.firstName} ${teacher.lastName || ""}`.trim()
              : fallbackInstructorName;

          const instructorImage =
            teacher.profilePic ||
            teacher.profileImage ||
            teacher.avatar ||
            course.instructorImage ||
            null;

          const createdAt =
            course.createdAt ||
            course.created_at ||
            enrollment.createdAt ||
            enrollment.created_at ||
            null;

          const enrollmentCourseId =
            (typeof enrollment.courseId === "object" ? enrollment.courseId?._id : enrollment.courseId) ||
            (typeof enrollment.course_id === "object" ? enrollment.course_id?._id : enrollment.course_id);

          const courseId = course._id || course.id || enrollmentCourseId;

          return (
            <ProgressCard
              key={enrollment._id || enrollment.id}
              icon={lessonLinks.length > 0 ? PlayCircle : Code2}
              category={course.category || "Course"}
              badgeColor="text-studprimary dark:text-premium-gold"
              badgeBg="bg-lavender-light dark:bg-premium-gold/10"
              iconBg="bg-lavender-light dark:bg-premium-gold/10"
              title={
                course.title ||
                enrollment.courseTitle ||
                `Course ${enrollment.courseId || enrollment.course_id}`
              }
              instructor={instructorName}
              instructorImage={instructorImage}
              createdAt={createdAt}
              completion={completionValue}
              lessonsDone={lessonsDone}
              lessonsTotal={totalLessons}
              lessons={lessonLinks}
              courseId={courseId}
              courseData={course}
            />
          );
        })}
      </div>
    </section>
  );
}

export default MyProgress;

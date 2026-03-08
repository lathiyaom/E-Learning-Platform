import React, { useMemo, useState } from "react";
import ProgressCard from "./ProgressCard";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";
import { Code2 } from "lucide-react";

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
        {visibleCourses.map((enrollment) => (
          <ProgressCard
            key={enrollment._id || enrollment.id}
            icon={Code2}
            category="Course"
            badgeColor="text-blue-600"
            badgeBg="bg-blue-50 dark:bg-blue-900/20"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title={
              enrollment.courseId?.title ||
              enrollment.course_id?.title ||
              enrollment.courseTitle ||
              `Course ${enrollment.courseId || enrollment.course_id}`
            }
            instructor="Instructor"
            completion={enrollment.progressPercent ?? enrollment.progress ?? 0}
            lessonsDone={Math.floor(((enrollment.progressPercent ?? enrollment.progress ?? 0) / 5))}
            lessonsTotal={20}
          />
        ))}
      </div>
    </section>
  );
}

export default MyProgress;

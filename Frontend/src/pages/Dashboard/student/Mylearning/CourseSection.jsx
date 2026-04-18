import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../Student_Dashboard/RecommendedCourseCard";
import { ArrowDown, ArrowUp, LayoutGrid, List } from "lucide-react";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";

function CourseSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [showAll, setShowAll] = useState(false);
  const { data: enrollmentsData, isLoading } = useGetMyEnrollmentsQuery();

  const enrollments = enrollmentsData?.data || [];
  const mapEnrollmentToCard = (enrollment) => {
    const course = enrollment.courseId || enrollment.course_id || {};
    const progress = Number(enrollment.progressPercent ?? enrollment.progress ?? 0);
    const lastAccessDate = enrollment.lastAccessedAt || enrollment.last_accessed_at || enrollment.updatedAt;

    return {
      id: enrollment._id || enrollment.id,
      courseId: course._id || course.id,
      title: course.title || "Untitled Course",
      image: course.image || "https://placehold.co/640x360?text=Course",
      category: course.category || "General",
      progress,
      unitsCompleted: Math.round((progress / 100) * 20),
      totalUnits: 20,
      lastAccess: lastAccessDate ? new Date(lastAccessDate).toLocaleDateString() : "N/A",
    };
  };

  const ongoingCoursesData = enrollments
    .filter((enrollment) => (enrollment.status || "active") === "active")
    .map(mapEnrollmentToCard);

  const completedCoursesData = enrollments
    .filter((enrollment) => (enrollment.status || "").toLowerCase() === "completed")
    .map(mapEnrollmentToCard);

  const activeCourses = activeTab === "Completed" ? completedCoursesData : ongoingCoursesData;

  return (
    <section className="space-y-8">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10">
        <div className="flex gap-8">
          {["Ongoing", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab
                  ? "text-studprimary dark:text-premium-gold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {tab === "Ongoing" ? "Ongoing Courses" : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-studprimary dark:bg-premium-gold shadow-[0_0_8px_rgba(176,141,87,0.6)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="pb-4 flex items-center gap-4 text-slate-400">
          <button className="hover:text-studprimary dark:hover:text-premium-gold transition-colors">
            <LayoutGrid />
          </button>
          <button className="hover:text-studprimary dark:hover:text-premium-gold transition-colors">
            <List />
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 font-medium">Loading courses...</p>
        </div>
      ) : (

        <div className="space-y-8">
          {activeCourses.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
              <p className="text-slate-400 font-medium">No courses in {activeTab}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
              {(showAll
                ? activeCourses
                : activeCourses.slice(0, 2)
              ).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isOngoing={true}
                  onButtonClick={() => navigate(`/card/${course.courseId}`)}
                />
              ))}
            </div>
          )}

          {activeCourses.length > 2 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-studprimary dark:hover:text-premium-gold hover:border-studprimary dark:hover:border-premium-gold transition-all active:scale-95 shadow-sm"
              >
                {showAll ? (
                  <>
                    Show Less Courses
                    <ArrowUp className="transition-all duration-300 hover:translate-y-1"/>
                  </>
                ) : (
                  <>
                    View All Courses
                    <ArrowDown className="transition-all duration-300 hover:translate-y-1"/>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default CourseSection;

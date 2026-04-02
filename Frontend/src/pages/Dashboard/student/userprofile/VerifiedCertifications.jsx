import React from "react";
import { BookOpen, CalendarClock, GraduationCap, Users } from "lucide-react";
import { useProfile } from "./useProfile";

function VerifiedCertifications() {
  const { userRole, enrollments, teacherCourses, isLoading } = useProfile();

  const studentCards = [
    {
      key: "active-learning",
      title: "Active Learning",
      value: enrollments.length,
      subtitle: "Enrolled courses",
      icon: BookOpen,
    },
    {
      key: "completed-courses",
      title: "Completed",
      value: enrollments.filter((item) => Number(item.progressPercent || item.progress || 0) >= 100).length,
      subtitle: "Courses completed",
      icon: GraduationCap,
    },
  ];

  const teacherCards = [
    {
      key: "managed-courses",
      title: "Managed Courses",
      value: teacherCourses.length,
      subtitle: "Courses under your guidance",
      icon: BookOpen,
    },
    {
      key: "learner-base",
      title: "Learner Base",
      value: teacherCourses.reduce(
        (sum, course) => sum + Number(course?.totalStudents || course?.studentCount || course?.enrollmentCount || 0),
        0,
      ),
      subtitle: "Students across all courses",
      icon: Users,
    },
  ];

  const cards = userRole === "teacher" ? teacherCards : studentCards;
  const sectionTitle = userRole === "teacher" ? "Teaching Insights" : "Learning Insights";
  const footerLabel = userRole === "teacher" ? "Keep mentoring momentum high" : "Keep your learning streak active";

  return (
    <section className="bg-white dark:dark-glass rounded-2xl md:rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-white/5 shadow-md dark:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></div>
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {sectionTitle}
        </h3>
      </div>
      <div className="space-y-4 md:space-y-5">
        {isLoading && <div className="text-sm text-slate-500 dark:text-slate-400">Loading insights...</div>}
        {!isLoading && cards.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Insights will appear once activity data is available.
          </div>
        )}
        {cards.map((item) => (
          <div
            key={item.key}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-white dark:bg-premium-gold/10 rounded-xl flex items-center justify-center text-studprimary dark:text-premium-gold shadow-sm group-hover:scale-105 transition-transform border border-slate-200 dark:border-white/5">
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {item.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.subtitle}
              </p>
            </div>
            <span className="rounded-xl bg-studprimary/10 px-3 py-1 text-xs font-bold text-studprimary dark:bg-premium-gold/15 dark:text-premium-gold">
              {item.value}
            </span>
          </div>
        ))}

        {cards.length > 0 && (
          <button className="w-full py-4 mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-studprimary dark:text-premium-gold bg-studprimary/5 dark:bg-premium-gold/10 rounded-2xl hover:bg-studprimary/10 dark:hover:bg-premium-gold/20 transition-all">
            <CalendarClock className="inline-block mr-2 h-4 w-4" />
            {footerLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export default VerifiedCertifications;

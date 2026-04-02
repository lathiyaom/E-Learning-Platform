import React from "react";
import { Medal, Sparkles, Terminal, Zap } from "lucide-react";
import { useProfile } from "./useProfile";

function AcademicHonors() {
  const { formData, userRole, enrollments, teacherCourses } = useProfile();

  const studentCompletedCount = enrollments.filter(
    (item) => Number(item.progressPercent || item.progress || 0) >= 100,
  ).length;
  const avgStudentProgress = enrollments.length
    ? Math.round(
        enrollments.reduce(
          (sum, item) => sum + Number(item.progressPercent || item.progress || 0),
          0,
        ) / enrollments.length,
      )
    : 0;

  const activeTeacherCourses = teacherCourses.filter(
    (course) => String(course?.status || "active").toLowerCase() !== "draft",
  ).length;

  const teacherReach = teacherCourses.reduce(
    (sum, course) => sum + Number(course?.totalStudents || course?.studentCount || course?.enrollmentCount || 0),
    0,
  );

  const honors =
    userRole === "teacher"
      ? [
          {
            label: "Starter Mentor",
            unlocked: teacherCourses.length > 0,
            icon: Sparkles,
            color: "text-blue-600",
          },
          {
            label: "Active Instructor",
            unlocked: activeTeacherCourses > 0,
            icon: Terminal,
            color: "text-green-600",
          },
          {
            label: "Learner Impact",
            unlocked: teacherReach > 0,
            icon: Medal,
            color: "text-amber-600",
          },
          {
            label: "Profile Ready",
            unlocked: Boolean(formData?.about && String(formData.about).trim().length > 0),
            icon: Zap,
            color: "text-orange-600",
          },
        ]
      : [
          {
            label: "Starter",
            unlocked: enrollments.length > 0,
            icon: Sparkles,
            color: "text-blue-600",
          },
          {
            label: "Focused Learner",
            unlocked: avgStudentProgress >= 50,
            icon: Terminal,
            color: "text-green-600",
          },
          {
            label: "Finisher",
            unlocked: studentCompletedCount > 0,
            icon: Medal,
            color: "text-amber-600",
          },
          {
            label: "Profile Ready",
            unlocked: Boolean(formData?.about && String(formData.about).trim().length > 0),
            icon: Zap,
            color: "text-orange-600",
          },
        ];

  return (
    <section className="bg-white dark:dark-glass rounded-2xl md:rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-white/5 shadow-md dark:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></div>
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Achievements
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-5 md:gap-6">
        {honors.map((honor) => (
          <div
            key={honor.label}
            className={`rounded-2xl p-5 border transition-all ${
              honor.unlocked
                ? "bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/20"
                : "bg-slate-50/50 dark:bg-white/5 border-slate-200/60 dark:border-white/10 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${honor.color} bg-white dark:bg-slate-900`}>
                <honor.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{honor.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {honor.unlocked ? "Unlocked" : "Not unlocked yet"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AcademicHonors;

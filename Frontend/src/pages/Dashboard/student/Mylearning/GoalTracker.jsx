import React from "react";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";

function GoalTracker() {
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery();
  const enrollments = enrollmentsData?.data || [];

  const buildWeek = () => {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());

    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + index);
      const dateKey = date.toDateString();
      const completed = enrollments.some((enrollment) => {
        const updatedAt = enrollment.updatedAt || enrollment.lastAccessedAt || enrollment.createdAt;
        return updatedAt && new Date(updatedAt).toDateString() === dateKey;
      });

      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
        completed,
      };
    });
  };

  const days = buildWeek();
  const streakDays = days.filter((day) => day.completed).length;

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:dark-glass">
      <h4 className="font-bold text-sm mb-2 text-slate-900 dark:text-white">
        Daily Goal Tracker
      </h4>
      <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-5">
        {streakDays > 0
          ? `${streakDays} active learning day(s) this week.`
          : "Complete at least one lesson to start your weekly streak."}
      </p>
      <div className="flex gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
              day.completed
                ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20"
                : "bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/5"
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoalTracker;

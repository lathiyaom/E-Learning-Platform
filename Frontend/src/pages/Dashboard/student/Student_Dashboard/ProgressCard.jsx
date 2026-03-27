import React from "react";
import moment from "moment";
import { Play, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgressCard = ({
  icon: Icon,
  badgeColor,
  badgeBg,
  title,
  instructor,
  instructorImage,
  createdAt,
  completion,
  lessonsDone,
  lessonsTotal,
  category,
  iconBg,
  lessons = [],
  courseId,
  courseData,
}) => {
  const navigate = useNavigate();
  const safeCompletion = Math.max(0, Math.min(100, Number(completion || 0)));
  const completionPercent = `${Math.round(safeCompletion)}%`;
  const visibleLessons = lessons.slice(0, 3);
  const remainingLessons = Math.max(0, lessons.length - visibleLessons.length);

  const formattedDate = createdAt
    ? moment(createdAt).format("DD MMM YYYY")
    : "Date not available";

  const initials =
    (instructor || "IN")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") || "IN";

  const handlePlay = () => {
    if (!courseId) return;
    navigate(`/card/${courseId}`, { state: { course: courseData } });
  };

  return (
    <article className="h-full rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:dark-glass flex flex-col">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${iconBg} ${badgeColor}`}
          >
            {Icon ? <Icon className="w-6 h-6" aria-hidden="true" /> : null}
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-slate-900 transition-colors dark:text-white/90 line-clamp-2">
            {title}
          </h4>
        </div>
        <span
          className={`rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase whitespace-nowrap ${badgeBg} ${badgeColor}`}
        >
          {category}
        </span>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200/70 dark:border-white/10 p-3">
        <div className="flex items-center gap-3">
          {instructorImage ? (
            <img
              src={instructorImage}
              alt={instructor}
              className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-white/10">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Instructor
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
              {instructor || "Instructor"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Created: {formattedDate}</span>
        </div>
      </div>

      {visibleLessons.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {visibleLessons.map((lesson, index) => (
            <span
              key={`${lesson.videoUrl}-${index}`}
              className="inline-flex max-w-full items-center rounded-full border border-card-border bg-lavender-light px-2.5 py-1 text-[11px] font-semibold text-studprimary hover:bg-studprimary/10 dark:border-premium-gold/25 dark:bg-premium-gold/10 dark:text-premium-gold"
              title={lesson.description || `Lesson ${index + 1}`}
            >
              {`Video ${index + 1}`}
            </span>
          ))}
          {remainingLessons > 0 ? (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              +{remainingLessons}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2 mt-auto">
        <div className="flex justify-between text-xs font-bold dark:text-white/80 ">
          <span>{completionPercent} Complete</span>
          <span className="text-slate-400 dark:text-white/70">
            {lessonsDone}/{lessonsTotal} Lessons
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
          <div
            className="bg-studprimary dark:bg-premium-gold h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(176,141,87,0.3)]"
            style={{ width: completionPercent }}
          ></div>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePlay}
        disabled={!courseId}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-studprimary text-white dark:bg-premium-gold dark:text-deep-charcoal px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Play className="w-4 h-4" />
        {safeCompletion > 0 ? "Continue Learning" : "Play Course"}
      </button>
    </article>
  );
};

export default ProgressCard;

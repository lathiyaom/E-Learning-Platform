import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Award,
  Play,
  CheckCircle2,
  BookOpen,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "../../../../components/Card";
import moment from "moment";

/* ── Status badge config ── */
const STATUS_CFG = {
  active: {
    label: "Active",
    cls: "bg-studprimary/10 text-studprimary border-studprimary/20 dark:bg-premium-gold/10 dark:text-premium-gold dark:border-premium-gold/20",
    dot: "bg-studprimary dark:bg-premium-gold",
  },
  completed: {
    label: "Completed",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
  },
  dropped: {
    label: "Dropped",
    cls: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
    dot: "bg-red-500",
  },
  suspended: {
    label: "Suspended",
    cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
    dot: "bg-amber-500",
  },
};

function EnrollmentCard({ enrollment }) {
  const navigate = useNavigate();

  // Support both legacy and new field names
  const course = enrollment.courseId || enrollment.course_id || {};
  const status = enrollment.status || "active";
  const enrolledAt = enrollment.enrolledAt || enrollment.enrolled_at;
  const completedAt = enrollment.completedAt || enrollment.completed_at;
  const lastAccessed = enrollment.lastAccessedAt || enrollment.last_accessed_at;
  const certificateIssued = enrollment.certificate_issued || false;
  const certificateUrl = enrollment.certificate_url || null;

  const cfg = STATUS_CFG[status] || STATUS_CFG.active;

  const instructor = course.instructor
    ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim()
    : course.teacherId
      ? `${course.teacherId.firstName || ""} ${course.teacherId.lastName || ""}`.trim()
      : null;

  const initials =
    (instructor || course.title || "C")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "C";

  const handleView = () => {
    if (course._id) navigate(`/card/${course._id}`, { state: { course } });
  };

  return (
    <Card className="w-full bg-white dark:bg-transparent dark:dark-glass rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 group hover:shadow-xl dark:hover:shadow-premium-gold/5 transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full py-0">
      {/* Thumbnail */}
      <div className="h-44 relative overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Category badge */}
        {course.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-studprimary/80 dark:bg-premium-gold/80 backdrop-blur text-white dark:text-deep-charcoal text-[10px] font-extrabold uppercase rounded-full tracking-wider">
              {course.category}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-sm ${cfg.cls}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Certificate badge */}
        {certificateIssued && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/90 text-amber-900 text-[10px] font-bold backdrop-blur-sm">
              <Award className="w-3 h-3" />
              Certified
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col gap-3">
        {/* Title */}
        <h3 className="font-bold text-base leading-snug text-slate-900 dark:text-white group-hover:text-studprimary dark:group-hover:text-premium-gold transition-colors line-clamp-2">
          {course.title || "Untitled Course"}
        </h3>

        {/* Instructor */}
        {instructor && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0">
              {initials}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {instructor}
            </span>
          </div>
        )}

        {/* Meta info grid */}
        <div className="grid grid-cols-1 gap-1.5 py-3 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          {enrolledAt && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CalendarDays className="w-3.5 h-3.5 shrink-0 text-studprimary dark:text-premium-gold" />
              <span>
                Enrolled:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {moment(enrolledAt).format("DD MMM YYYY")}
                </span>
              </span>
            </div>
          )}
          {completedAt && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>
                Completed:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {moment(completedAt).format("DD MMM YYYY")}
                </span>
              </span>
            </div>
          )}
          {lastAccessed && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>
                Last accessed:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {moment(lastAccessed).fromNow()}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={handleView}
            disabled={!course._id}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal text-sm font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-studprimary/20 dark:shadow-premium-gold/20"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            {status === "completed" ? "Review" : "Continue"}
          </button>

          {certificateIssued && certificateUrl && (
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              title="Download Certificate"
            >
              <Award className="w-4 h-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EnrollmentCard;

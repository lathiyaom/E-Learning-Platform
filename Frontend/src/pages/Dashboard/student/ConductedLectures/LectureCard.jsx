import React from "react";
import {
  Clock,
  MapPin,
  Calendar,
  Play,
  BookOpen,
  Download,
  User2,
  GraduationCap,
  ExternalLink,
  Radio,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "../../../../components/Card";
import { Badge } from "../../../../components/Badge";

/* ── Status config — drives accent bar, icon bg, badge variant ── */
const STATUS = {
  ongoing: {
    bar: "bg-green-500",
    iconWrap: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    badgeClass: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/40",
    dot: "bg-green-500 animate-pulse",
    Icon: Radio,
    label: "Live Now",
    btnClass: "bg-green-500 hover:bg-green-600 shadow-green-500/25 text-white",
    joinLabel: "Join Now",
  },
  completed: {
    bar: "bg-slate-400",
    iconWrap: "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10",
    dot: "bg-slate-400",
    Icon: CheckCircle2,
    label: "Completed",
    btnClass: "bg-slate-600 hover:bg-slate-700 shadow-slate-500/20 text-white",
    joinLabel: "View Recording",
  },
  cancelled: {
    bar: "bg-red-400",
    iconWrap: "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400",
    badgeClass: "bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
    dot: "bg-red-500",
    Icon: XCircle,
    label: "Cancelled",
    btnClass: null,
    joinLabel: null,
  },
  scheduled: {
    bar: "bg-studprimary",
    iconWrap: "bg-studprimary/10 dark:bg-studprimary/20 text-studprimary",
    badgeClass: "bg-studprimary/10 text-studprimary border border-studprimary/20 dark:bg-studprimary/20 dark:border-studprimary/30",
    dot: "bg-studprimary",
    Icon: Clock,
    label: "Scheduled",
    btnClass: "bg-studprimary hover:bg-studprimary/90 shadow-studprimary/25 text-white",
    joinLabel: "Join Lecture",
  },
};

/* ── Small meta row item ── */
function MetaItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm min-w-0">
      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
      <span className="text-slate-500 dark:text-slate-400 shrink-0">{label}:</span>
      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{value}</span>
    </div>
  );
}

function LectureCard({ lecture, hideAction = false }) {
  const status = lecture.status || "scheduled";
  const cfg = STATUS[status] || STATUS.scheduled;
  const StatusIcon = cfg.Icon;

  const instructor = lecture.conductedBy
    ? `${lecture.conductedBy.firstName || ""} ${lecture.conductedBy.lastName || ""}`.trim()
    : null;

  const timeRange =
    lecture.startTime && lecture.endTime
      ? `${lecture.startTime} – ${lecture.endTime}`
      : lecture.startTime || null;

  const dateStr = lecture.lectureDate
    ? new Date(lecture.lectureDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card className="relative bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-premium-gold/5 transition-all duration-300 hover:-translate-y-0.5 p-0 gap-0">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-2xl`} />

      {/* Corner decoration — same pattern as HelpTopics cards */}
      <div className="absolute right-0 top-0 w-28 h-28 bg-studprimary/5 dark:bg-premium-gold/5 rounded-bl-[5rem] pointer-events-none" />

      <div className="pl-6 pr-5 pt-5 pb-5 flex flex-col gap-4">
        {/* ── Row 1: icon + title + status badge ── */}
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconWrap}`}>
            <Play className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {lecture.title}
              </h3>
              {/* Status badge — uses inline classes (Badge component doesn't have these variants) */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            {lecture.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {lecture.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Row 2: meta grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 px-3 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
          <MetaItem icon={Calendar} label="Date" value={dateStr} />
          <MetaItem icon={Clock} label="Time" value={timeRange} />
          <MetaItem icon={MapPin} label="Room" value={lecture.room} />
          <MetaItem icon={GraduationCap} label="Course" value={lecture.courseId?.title} />
          <MetaItem icon={User2} label="Instructor" value={instructor} />
        </div>

        {/* ── Row 3: action button + materials ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Join / View button */}
          {!hideAction && lecture.videoUrl && cfg.btnClass && (
            <a
              href={lecture.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-95 ${cfg.btnClass}`}
            >
              {status === "ongoing" ? (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {cfg.joinLabel}
            </a>
          )}

          {/* Materials */}
          {lecture.materials?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5" />
                Materials
              </span>
              {lecture.materials.map((mat, i) => (
                <a
                  key={i}
                  href={mat.url}
                  target="_blank"
                  download={mat.name}
                  rel="noopener noreferrer"
                  title={mat.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-studprimary/10 text-slate-600 hover:text-studprimary dark:bg-white/5 dark:hover:bg-premium-gold/10 dark:text-slate-300 dark:hover:text-premium-gold border border-slate-200 dark:border-white/10 transition-colors duration-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[140px]">{mat.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default LectureCard;

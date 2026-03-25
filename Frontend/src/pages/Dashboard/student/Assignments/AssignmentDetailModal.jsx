import React from "react";
import {
  X, FileText, Link2, Download, AlertCircle, Calendar,
  Award, BookOpen, Clock, CheckCircle2, Upload,
} from "lucide-react";
import { Card } from "../../../../components/Card";

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-studprimary dark:text-premium-gold" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AssignmentDetailModal({ assignment, onClose, onSubmit }) {
  if (!assignment) return null;

  const canSubmit = assignment.submissionStatus !== "submitted" && assignment.submissionStatus !== "graded";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-navy-charcoal border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-black/50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{assignment.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{assignment.courseId?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon={BookOpen} label="Type" value={assignment.assignmentType} />
            <InfoRow icon={Award} label="Max Points" value={`${assignment.maxPoints} pts`} />
            <InfoRow icon={Calendar} label="Due Date" value={new Date(assignment.dueDate).toLocaleString()} />
            <InfoRow icon={CheckCircle2} label="Status" value={assignment.submissionStatus || "Not submitted"} />
            {assignment.grade !== null && assignment.grade !== undefined && (
              <InfoRow icon={Award} label="Your Grade"
                value={`${assignment.grade}/${assignment.maxPoints} (${((assignment.grade / assignment.maxPoints) * 100).toFixed(1)}%)`} />
            )}
            {assignment.submittedAt && (
              <InfoRow icon={Clock} label="Submitted At" value={new Date(assignment.submittedAt).toLocaleString()} />
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{assignment.description}</p>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Instructions</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{assignment.instructions}</p>
            </div>
          )}

          {/* Late submission notice */}
          {assignment.allowLateSubmission && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Late Submissions Allowed</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  {assignment.latePenaltyPercent}% penalty will be applied for late submissions.
                </p>
              </div>
            </div>
          )}

          {/* Teacher attachments */}
          {assignment.attachments?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                Assignment Resources
              </h3>
              <div className="space-y-2">
                {assignment.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.attachmentType === "file" ? att.name : undefined}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-studprimary/50 dark:hover:border-premium-gold/50 hover:bg-studprimary/5 dark:hover:bg-premium-gold/5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center shrink-0">
                      {att.attachmentType === "link"
                        ? <Link2 className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                        : <Download className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-studprimary dark:group-hover:text-premium-gold transition-colors">
                        {att.name}
                      </p>
                      {att.size && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {(att.size / 1024).toFixed(0)} KB
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide shrink-0">
                      {att.attachmentType}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          {canSubmit && (
            <button
              onClick={onSubmit}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-studprimary dark:bg-premium-gold dark:text-deep-charcoal rounded-xl hover:bg-studprimary/90 dark:hover:brightness-110 shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              Submit Assignment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignmentDetailModal;

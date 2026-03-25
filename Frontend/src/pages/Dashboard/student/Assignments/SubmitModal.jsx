import React, { useState } from "react";
import {
  X, Upload, FileText, Link2, Plus, Trash2, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import axios from "axios";
import { getAuthState } from "../../../../redux/slice/authSlice";
import { useSelector } from "react-redux";

const SUBMISSION_TYPES = [
  { value: "text", label: "Text Answer", icon: FileText },
  { value: "file", label: "File Upload", icon: Upload },
  { value: "link", label: "Link(s)", icon: Link2 },
  { value: "multiple", label: "Multiple", icon: Plus },
];

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

function SubmitModal({ assignment, onClose, onSubmit }) {
  const { accessToken } = useSelector((state) => getAuthState(state));

  const [submissionType, setSubmissionType] = useState(
    assignment?.submissionType || "text"
  );
  const [textContent, setTextContent] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [linkSubmissions, setLinkSubmissions] = useState([{ url: "", title: "", description: "" }]);
  const [fileSubmissions, setFileSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!assignment) return null;

  /* ── Cloudinary upload via /api/upload/document ── */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setUploadError("");

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const form = new FormData();
          form.append("document", file);
          const res = await axios.post(
            `${import.meta.env.VITE_APP_API_URL || "/api"}/upload/document`,
            form,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const d = res.data.data;
          return {
            filename: d.name || file.name,
            originalName: file.name,
            mimeType: d.mimeType || file.type,
            size: d.size || file.size,
            url: d.url,
            uploadedAt: new Date(),
          };
        })
      );
      setFileSubmissions((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setUploadError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = (i) => setFileSubmissions((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Link helpers ── */
  const addLink = () => setLinkSubmissions((prev) => [...prev, { url: "", title: "", description: "" }]);
  const updateLink = (i, field, val) =>
    setLinkSubmissions((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));
  const removeLink = (i) => setLinkSubmissions((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        submissionType,
        textContent: submissionType === "text" || submissionType === "multiple" ? textContent : undefined,
        fileSubmissions: submissionType === "file" || submissionType === "multiple" ? fileSubmissions : [],
        linkSubmissions: submissionType === "link" || submissionType === "multiple" ? linkSubmissions.filter((l) => l.url) : [],
        studentNotes,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-navy-charcoal border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-black/50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-navy-charcoal rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Submit Assignment</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{assignment.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Submission type selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Submission Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUBMISSION_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSubmissionType(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    submissionType === value
                      ? "bg-studprimary/10 dark:bg-premium-gold/10 border-studprimary dark:border-premium-gold text-studprimary dark:text-premium-gold"
                      : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-studprimary/50 dark:hover:border-premium-gold/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Text answer */}
          {(submissionType === "text" || submissionType === "multiple") && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Your Answer {submissionType === "text" && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                required={submissionType === "text"}
                rows={6}
                placeholder="Write your answer here..."
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold resize-none transition-colors"
              />
            </div>
          )}

          {/* File upload */}
          {(submissionType === "file" || submissionType === "multiple") && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Upload Files {submissionType === "file" && <span className="text-red-400">*</span>}
              </label>

              {/* Drop zone */}
              <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-studprimary dark:hover:border-premium-gold bg-slate-50 dark:bg-white/5 cursor-pointer transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {uploading
                    ? <Loader2 className="w-6 h-6 text-studprimary dark:text-premium-gold animate-spin" />
                    : <Upload className="w-6 h-6 text-studprimary dark:text-premium-gold" />
                  }
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {uploading ? "Uploading..." : "Click to upload"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    PDF, DOC, DOCX, XLS, PPT, TXT (max 25MB)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES}
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {uploadError && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-500 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {uploadError}
                </div>
              )}

              {/* Uploaded files list */}
              {fileSubmissions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {fileSubmissions.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{f.originalName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{(f.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link submissions */}
          {(submissionType === "link" || submissionType === "multiple") && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Links {submissionType === "link" && <span className="text-red-400">*</span>}
              </label>
              <div className="space-y-3">
                {linkSubmissions.map((link, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      required={submissionType === "link"}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={link.title}
                      onChange={(e) => updateLink(i, "title", e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold transition-colors"
                    />
                    {linkSubmissions.length > 1 && (
                      <button type="button" onClick={() => removeLink(i)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLink}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-studprimary dark:text-premium-gold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add another link
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Notes for Instructor (Optional)
            </label>
            <textarea
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              rows={3}
              placeholder="Any notes or comments for your instructor..."
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-studprimary dark:focus:border-premium-gold resize-none transition-colors"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-studprimary dark:bg-premium-gold dark:text-deep-charcoal rounded-xl hover:bg-studprimary/90 dark:hover:brightness-110 shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitModal;

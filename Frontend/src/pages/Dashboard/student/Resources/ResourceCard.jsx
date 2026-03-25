import React from "react";
import { FileText, FileVideo, Film, Download, Sparkles } from "lucide-react";

function getTypeMeta(item = {}) {
  const raw =
    item.type ||
    item.resourceType ||
    item.contentType ||
    item.format ||
    item.kind ||
    "";
  const type = String(raw).toLowerCase();

  const isVideo = type.includes("video") || type.includes("mp4") || type.includes("youtube");
  const isPdf = type.includes("pdf");
  const isDoc = type.includes("doc") || type.includes("docx");

  const label = item.pillLabel || item.badge || item.accessLevel || "";

  return {
    type,
    isVideo,
    isPdf,
    isDoc,
    badgeLabel:
      label ||
      (item.isPremium || item.premium ? "PREMIUM CONTENT" : "") ||
      (type.includes("video") ? "VIDEO" : type.includes("pdf") ? "PDF" : "FILE"),
  };
}

function getIcon({ isVideo, isPdf, isDoc }) {
  if (isVideo) return FileVideo;
  if (isPdf) return FileText;
  if (isDoc) return FileText;
  return Film;
}

export default function ResourceCard({ item }) {
  const meta = getTypeMeta(item);
  const Icon = getIcon(meta);

  const dateLike =
    item.createdAt ||
    item.created_at ||
    item.updatedAt ||
    item.updated_at ||
    item.timestamp;
  const dateText = dateLike ? new Date(dateLike).toLocaleDateString() : null;

  const fileUrl = item.file_url || item.fileUrl || item.url || "";
  const hasLink = typeof fileUrl === "string" && fileUrl.length > 0;

  const title = item.title || item.name || "Untitled Resource";
  const description = item.description || item.summary || "No description available.";

  return (
    <div className="group bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-studprimary/40 dark:hover:border-premium-gold/40 transition-all duration-300 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 border border-studprimary/20 dark:border-premium-gold/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-studprimary dark:text-premium-gold" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 dark:text-white truncate">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {meta.badgeLabel ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
            {meta.badgeLabel.includes("PREMIUM") && <Sparkles className="w-3 h-3 text-studprimary dark:text-premium-gold" />}
            {meta.badgeLabel}
          </span>
        ) : null}
        {dateText ? (
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {dateText}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {meta.isVideo ? "Watch" : meta.isPdf ? "Read" : "Open"} Resource
        </p>

        {hasLink ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-studprimary dark:bg-premium-gold hover:bg-studprimary/90 dark:hover:brightness-110 text-white dark:text-deep-charcoal font-bold shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 hover:shadow-studprimary/40 dark:hover:shadow-premium-gold/40 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Open
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 cursor-not-allowed font-bold"
          >
            No File
          </button>
        )}
      </div>
    </div>
  );
}


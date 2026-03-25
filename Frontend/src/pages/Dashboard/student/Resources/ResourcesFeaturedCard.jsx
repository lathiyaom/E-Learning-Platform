import React from "react";
import { Film, PlayCircle, FileVideo, FileText, Sparkles } from "lucide-react";
import { Card } from "../../../../components/Card";

function getFeaturedIcon(item = {}) {
  const raw =
    item.type ||
    item.resourceType ||
    item.contentType ||
    item.format ||
    item.kind ||
    "";
  const type = String(raw).toLowerCase();

  if (type.includes("video")) return FileVideo;
  if (type.includes("pdf")) return FileText;
  return Film;
}

export default function ResourcesFeaturedCard({ item }) {
  if (!item) return null;

  const Icon = getFeaturedIcon(item);
  const title = item.title || item.name || "Featured Resource";
  const description = item.description || item.summary || "Premium learning content curated for you.";
  const badgeText = item.isPremium || item.premium ? "PREMIUM CONTENT" : "FEATURED";

  const dateLike =
    item.createdAt ||
    item.created_at ||
    item.updatedAt ||
    item.updated_at ||
    item.timestamp;
  const dateText = dateLike ? new Date(dateLike).toLocaleDateString() : null;

  const fileUrl = item.file_url || item.fileUrl || item.url || "";

  return (
    <Card className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-transparent dark:dark-glass shadow-sm py-0">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 relative min-h-[220px]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 dark:from-deep-charcoal dark:via-navy-charcoal dark:to-deep-charcoal" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(176,141,87,0.9),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.7),transparent_45%)]" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-studprimary/20 blur-[30px]" />
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-premium-gold/20 blur-[30px]" />
          </div>

          <div className="relative z-10 h-full p-6 flex flex-col justify-end gap-5 rounded-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm text-white">
              <Sparkles className="w-4 h-4 text-premium-gold" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest">{badgeText}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest">
                  Curated for you
                </p>
                <p className="text-white font-extrabold truncate">{title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/80 text-[11px] font-bold uppercase tracking-widest">
              <PlayCircle className="w-4 h-4 text-studprimary" />
              {dateText ? `Added ${dateText}` : "Start learning now"}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col gap-5">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-auto">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-studprimary dark:bg-premium-gold hover:bg-studprimary/90 dark:hover:brightness-110 text-white dark:text-deep-charcoal font-extrabold shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 hover:shadow-studprimary/40 dark:hover:shadow-premium-gold/40 transition-all active:scale-[0.98]"
            >
              <PlayCircle className="w-5 h-5" />
              Open Resource
            </a>

            <div className="sm:ml-auto inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200">
              <span className="text-xs font-bold uppercase tracking-widest">
                Premium Library
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}


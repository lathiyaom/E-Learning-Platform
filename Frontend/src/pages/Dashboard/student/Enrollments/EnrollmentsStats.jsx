import React from "react";
import { BookOpen, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

const STAT_CFG = [
  {
    key: "active",
    label: "Active",
    icon: BookOpen,
    accent: "bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold",
    border: "border-studprimary/20 dark:border-premium-gold/20",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    accent: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/40",
  },
  {
    key: "dropped",
    label: "Dropped",
    icon: XCircle,
    accent: "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400",
    border: "border-red-200 dark:border-red-800/40",
  },
  {
    key: "certificates",
    label: "Certificates",
    icon: TrendingUp,
    accent: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/40",
  },
];

function EnrollmentsStats({ counts }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STAT_CFG.map(({ key, label, icon: Icon, accent, border }) => (
        <div
          key={key}
          className={`flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-transparent dark:dark-glass border ${border} shadow-sm`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="leading-none">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{counts[key] ?? 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EnrollmentsStats;

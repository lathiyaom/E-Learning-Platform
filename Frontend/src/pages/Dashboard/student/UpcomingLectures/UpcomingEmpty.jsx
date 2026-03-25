import React from "react";
import { CalendarX, Sparkles } from "lucide-react";
import { Card } from "../../../../components/Card";

function UpcomingEmpty({ filtered = false }) {
  return (
    <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-0 gap-0">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
            <CalendarX className="w-12 h-12 text-studprimary dark:text-premium-gold" />
          </div>
          <div className="absolute inset-0 rounded-3xl border-2 border-studprimary/20 dark:border-premium-gold/20 scale-110 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {filtered ? "No matching lectures" : "No upcoming lectures"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
          {filtered
            ? "Try adjusting your filters to see more lectures."
            : "You don't have any lectures scheduled for the next 7 days."}
        </p>

        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5" />
          {filtered ? "Clear filters to see all lectures" : "Check back later for new lectures"}
        </div>
      </div>
    </Card>
  );
}

export default UpcomingEmpty;

import React from "react";
import { CalendarX, BookOpen } from "lucide-react";
import { Card } from "../../../../components/Card";

function LecturesEmpty() {
  return (
    <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-0 gap-0">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        {/* Icon with animated ring */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
            <CalendarX className="w-12 h-12 text-studprimary dark:text-premium-gold" />
          </div>
          <div className="absolute inset-0 rounded-3xl border-2 border-studprimary/20 dark:border-premium-gold/20 scale-110 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No lectures today
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
          You don't have any lectures scheduled for today. Enjoy your free time
          or catch up on course materials.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
          <BookOpen className="w-3.5 h-3.5" />
          Check back tomorrow for upcoming lectures
        </div>
      </div>
    </Card>
  );
}

export default LecturesEmpty;

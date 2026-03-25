import React from "react";
import { Sparkles } from "lucide-react";

export default function ResourcesPoster({
  title = "Resource Library",
  subtitle = "Access premium study materials, lecture notes, and datasets curated for your academic journey.",
  badgeText = "Learning Resources",
}) {
  return (
    <section className="relative bg-lavender-light dark:bg-navy-charcoal rounded-2xl md:rounded-[2.5rem] px-4 py-8 sm:px-6 sm:py-10 md:px-12 md:py-14 overflow-hidden shadow-sm dark:shadow-2xl border border-white/50 dark:border-white/10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "1.5rem 1.5rem",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-xs font-bold tracking-wider uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>{badgeText}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}


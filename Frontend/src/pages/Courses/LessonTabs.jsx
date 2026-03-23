import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * LessonTabs Component
 * Horizontal tab navigation for switching between course lessons
 * Responsive and keyboard-accessible
 */
const LessonTabs = ({ 
  lessons = [], 
  currentIndex = 0, 
  onLessonChange = () => {},
  isLoading = false
}) => {
  const [scrollContainer, setScrollContainer] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollContainer) return;
    setCanScrollLeft(scrollContainer.scrollLeft > 0);
    setCanScrollRight(
      scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth
    );
  };

  React.useEffect(() => {
    checkScroll();
    scrollContainer?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      scrollContainer?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [scrollContainer]);

  const scroll = (direction) => {
    if (!scrollContainer) return;
    const scrollAmount = 300;
    scrollContainer.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        No lessons available
      </div>
    );
  }

  // Single lesson - no tabs needed
  if (lessons.length === 1) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Tabs Header Label */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          📚 Lessons ({lessons.length})
        </h4>
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Lesson {currentIndex + 1} of {lessons.length}
        </span>
      </div>

      {/* Scrollable Tabs Container */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all opacity-0 group-hover:opacity-100 -ml-4"
            aria-label="Scroll lessons left"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
        )}

        {/* Tabs */}
        <div
          ref={setScrollContainer}
          className="flex gap-2 overflow-x-auto pb-2 scroll-smooth hide-scrollbar"
        >
          {lessons.map((lesson, index) => {
            const videoUrl = lesson.videoUrl || lesson.video_url;
            const isActive = index === currentIndex;

            return (
              <button
                key={`lesson-${index}`}
                onClick={() => onLessonChange(index)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal shadow-lg shadow-studprimary/30 dark:shadow-premium-gold/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
                disabled={isLoading}
                aria-selected={isActive}
              >
                <span className="inline-block">📹 Lesson {index + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all opacity-0 group-hover:opacity-100 -mr-4"
            aria-label="Scroll lessons right"
          >
            <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
        )}
      </div>

      {/* Current Lesson Info */}
      {lessons[currentIndex]?.description && (
        <div className="p-3 sm:p-4 bg-lavender-light/50 dark:bg-premium-gold/5 rounded-xl border border-lavender-light dark:border-premium-gold/20">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
            {lessons[currentIndex].description}
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonTabs;

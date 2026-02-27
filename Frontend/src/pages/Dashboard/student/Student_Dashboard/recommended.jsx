import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import RecommendedCourseCard from "./RecommendedCourseCard";
import { useGetAllCoursesQuery } from "../../../../redux/Apis/courseApi";

function RecommendedSection() {
  const scrollContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const { data: coursesData, isLoading } = useGetAllCoursesQuery();

  const courses = coursesData?.data || [];

  useEffect(() => {
    if (courses.length > 0) {
      gsap.fromTo(
        cardRefs.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        },
      );
    }
  }, [courses]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320;
    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    gsap.to(container, {
      scrollLeft: targetScroll,
      duration: 0.8,
      ease: "power2.inOut",
    });
  };

  if (isLoading) {
    return (
      <section>
        <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white mb-6">
          <span className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></span>
          Recommended for You
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-studprimary"></div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></span>
            Recommended for You
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all hover:border-studprimary dark:hover:border-premium-gold dark:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all hover:border-studprimary dark:hover:border-premium-gold dark:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
      >
        {courses.map((course, index) => (
          <div key={course.id} ref={(el) => (cardRefs.current[index] = el)}>
            <RecommendedCourseCard
              course={{
                id: course.id,
                title: course.title,
                image: course.imageUrl || "https://via.placeholder.com/400x300",
                category: course.category || "General",
                categoryIcon: "code",
                badge: course.isFeatured ? { text: "Featured", bgColor: "bg-studprimary" } : null,
                duration: course.duration || "N/A",
                lessons: course.lessons || 0,
                rating: course.rating || 0,
                reviews: course.reviews || 0,
                level: course.level || "Beginner",
                instructor: course.instructorName || "Instructor",
                instructorImage: course.instructorImage || "https://via.placeholder.com/100",
                price: course.price || 0,
              }}
              showRating={false}
              showReviews={false}
              showButton={false}
              buttonText="View Details"
              onButtonClick={() =>
                console.log("View Details clicked for course:", course.id)
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendedSection;

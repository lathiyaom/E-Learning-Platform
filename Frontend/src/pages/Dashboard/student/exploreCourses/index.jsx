import React, { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import AdminLayout from "../../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../../utils/breadcrumbs";
import CoursePoster from "./coursePoster";
import FilterSidebar from "./FilterSidebar";
import CourseGrid from "./CourseGrid";
import { useGetAllCoursesQuery } from "../../../../redux/Apis/courseApi";

function ExploreCourses() {
  const breadcrumbItems = getBreadcrumbs("EXPLORE_COURSES");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    levels: [],
    priceRanges: [],
    minRating: 0,
  });

  const { data: coursesData, isLoading } = useGetAllCoursesQuery();
  const allCourses = coursesData?.data || [];

  // Count active filters for badge
  const activeFilterCount =
    filters.categories.length +
    filters.levels.length +
    filters.priceRanges.length +
    (filters.minRating > 0 ? 1 : 0);

  const filteredCourses = useMemo(() => {
    return allCourses
      .filter((course) => {
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(course.category)
        ) {
          return false;
        }

        if (filters.levels.length > 0 && !filters.levels.includes(course.level)) {
          return false;
        }

        if (filters.priceRanges.length > 0) {
          const isFree = !course.price || course.price === 0;
          const isPaid = course.price > 0;
          const hasFree = filters.priceRanges.includes("free");
          const hasPaid = filters.priceRanges.includes("paid");

          if ((isFree && !hasFree) || (isPaid && !hasPaid)) {
            return false;
          }
        }

        if (filters.minRating > 0 && (course.rating || 0) < filters.minRating) {
          return false;
        }

        return true;
      })
      .map((course) => ({
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
      }));
  }, [allCourses, filters]);

  const handleCourseClick = (courseId) => {
    console.log("Course clicked:", courseId);
  };

  if (isLoading) {
    return (
      <AdminLayout
        showSearch={false}
        className="p-0"
        breadcrumbItems={breadcrumbItems}
      >
        <CoursePoster />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-studprimary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      showSearch={false}
      className="p-0"
      breadcrumbItems={breadcrumbItems}
    >
      <CoursePoster />

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 p-4 sm:p-6 xl:p-8">
        <FilterSidebar
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
        />

        <CourseGrid
          courses={filteredCourses}
          onCourseClick={handleCourseClick}
          activeFilterCount={activeFilterCount}
          onFilterToggle={() => setFilterOpen(true)}
        />
      </div>

      {/* Fixed Mobile Filter FAB */}
      <button
        onClick={() => setFilterOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 w-14 h-14 bg-studprimary text-white rounded-full shadow-lg shadow-studprimary/30 flex items-center justify-center z-30 hover:bg-studprimary/90 active:scale-95 transition-all"
      >
        <SlidersHorizontal size={22} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>
    </AdminLayout>
  );
}

export default ExploreCourses;

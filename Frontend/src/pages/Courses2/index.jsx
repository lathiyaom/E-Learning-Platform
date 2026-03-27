import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import CoursesHero from "./components/CoursesHero";
import CoursesFilter from "./components/CoursesFilter";
import CoursesGrid from "./components/CoursesGrid";
import CoursesPagination from "./components/CoursesPagination";
import { useGetMarketplaceCoursesQuery } from "../../redux/Apis/courseApi";

const COURSES_PER_PAGE = 8;

function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Subjects");
  const [level, setLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Most Relevant");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch courses from API
  const { data: coursesData } = useGetMarketplaceCoursesQuery("popular");
  const courses = coursesData?.data || [];

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, level, sortBy]);

  // Compute filtered count for the filter bar
  const filteredCount = courses.filter((c) => {
    const matchCat =
      activeCategory === "All Subjects" || c.category === activeCategory;
    const matchLevel = level === "All Levels" || c.level === level;
    const matchSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  }).length;

  const totalPages = Math.max(1, Math.ceil(filteredCount / COURSES_PER_PAGE));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page title + search */}
        <CoursesHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Sticky filter bar */}
        <CoursesFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          level={level}
          onLevelChange={setLevel}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredCount}
        />

        {/* Main content */}
        <section className="relative bg-slate-50 dark:bg-deep-charcoal transition-colors duration-300 min-h-[60vh]">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[400px] h-[400px] dark:bg-premium-gold/4 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-[350px] h-[350px] dark:bg-primary/3 rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <CoursesGrid
              viewMode={viewMode}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              level={level}
              sortBy={sortBy}
            />

            {/* Pagination */}
            {filteredCount > 0 && (
              <CoursesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </section>
      </motion.div>
    </Layout>
  );
}

export default Courses;


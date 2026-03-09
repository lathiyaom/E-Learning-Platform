import React, { useMemo, useState } from "react";
import AdminLayout from "../../../../utils/Adminlayoute";
import { useGetMarketplaceCoursesQuery } from "../../../../redux/Apis/courseApi";
import {
  useEnrollStudentMutation,
  useGetMyEnrollmentsQuery,
} from "../../../../redux/Apis/enrollmentApi";
import { ErrorToster, SuccessToster } from "../../../../components/toster";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { getBreadcrumbs } from "../../../../utils/breadcrumbs";

const ExploreCourses = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const { data: coursesData, isLoading } = useGetMarketplaceCoursesQuery(sortBy);
  const { data: enrollmentsData, refetch: refetchEnrollments } = useGetMyEnrollmentsQuery();
  const [enrollStudent, { isLoading: enrolling }] = useEnrollStudentMutation();

  const courses = coursesData?.data || [];
  const enrollments = enrollmentsData?.data || [];

  const enrolledCourseIds = useMemo(() => {
    return new Set(
      enrollments.map((item) => {
        const id = item.courseId?._id || item.courseId || item.course_id?._id || item.course_id;
        return id?.toString();
      })
    );
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return courses;
    return courses.filter((course) => {
      const title = (course.title || "").toLowerCase();
      const category = (course.category || "").toLowerCase();
      return title.includes(normalized) || category.includes(normalized);
    });
  }, [courses, search]);

  const handleEnroll = async (courseId) => {
    try {
      await enrollStudent({ courseId }).unwrap();
      SuccessToster("Enrolled successfully", 2500);
      refetchEnrollments();
    } catch (error) {
      ErrorToster(getApiErrorMessage(error, "Failed to enroll"), 3000);
    }
  };

  return (
    <AdminLayout showSearch={false} breadcrumbItems={getBreadcrumbs("EXPLORE_COURSES")}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6">
          <h1 className="text-2xl font-bold">Explore Courses</h1>
          <p className="text-blue-100 mt-1">
            Browse courses from all organizations and enroll instantly.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by title or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="price_low_to_high">Price Low to High</option>
            <option value="price_high_to_low">Price High to Low</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-10 text-center text-slate-500 dark:text-slate-400">
            No courses found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const courseId = course._id || course.id;
              const enrolled = enrolledCourseIds.has(courseId?.toString());
              const price = course.priceUSD ?? course.price ?? course.pricing ?? 0;
              const orgName = course.organization_id?.name || course.tenantId?.name || "Organization";

              return (
                <div
                  key={courseId}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <img
                    src={course.image || "https://placehold.co/640x360?text=Course"}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{orgName}</p>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {Number(price) > 0 ? `$${price}` : "Free"}
                      </span>
                      <button
                        onClick={() => handleEnroll(courseId)}
                        disabled={enrolled || enrolling}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                          enrolled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        } disabled:opacity-70`}
                      >
                        {enrolled ? "Enrolled" : "Enroll"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ExploreCourses;

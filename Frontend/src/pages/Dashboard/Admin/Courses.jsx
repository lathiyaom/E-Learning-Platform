import React, { useState } from "react";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";

const Courses = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useGetAllCoursesQuery();

  const courses = data?.data || [];

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">Error loading courses</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Course Management</h1>
        <p className="text-gray-600">Manage all courses in your organization</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search courses by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course._id || course.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={course.image || "https://via.placeholder.com/400x200"}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {course.category}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  ${course.priceUSD || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm ml-1">
                    {course.rating || 0} ({course.reviewCount || 0})
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses found</p>
        </div>
      )}
    </div>
  );
};

export default Courses;

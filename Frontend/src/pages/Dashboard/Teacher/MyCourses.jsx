import React from "react";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminLayout from "../../../utils/Adminlayoute";

const MyCourses = () => {
  const navigate = useNavigate();
  const { data: coursesData, isLoading, error } = useGetAllCoursesQuery();
  const { user } = useSelector((state) => state.auth || {});
  const teacherId = String(user?._id || user?.id || "");
  
  // Filter courses created by this teacher
  const myCourses = coursesData?.data?.filter(
    (course) =>
      String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
      String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
  ) || [];

  if (isLoading) {
    return (
      <AdminLayout showSearch={false} className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout showSearch={false} className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading courses: {error.message || "Something went wrong"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSearch={false} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <button 
          onClick={() => navigate("/teacher/course-form")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Course
        </button>
      </div>

      {myCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You haven't created any courses yet.</p>
          <button 
            onClick={() => navigate("/teacher/course-form")}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <div key={course._id || course.id} className="bg-white rounded-lg shadow-md p-6">
              {(course.imageUrl || course.image) && (
                <img 
                  src={course.imageUrl || course.image} 
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{course.category || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">{course.level || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">
                    {course.price ? `$${course.price}` : "Free"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate(`/card/${course._id || course.id}`)}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  View Details
                </button>
                <button 
                  onClick={() => navigate(`/teacher/course-form?edit=${course._id || course.id}`)}
                  className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300"
                >
                  Edit Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default MyCourses;

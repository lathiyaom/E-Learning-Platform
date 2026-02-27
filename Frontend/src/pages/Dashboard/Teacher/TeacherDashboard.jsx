import React from "react";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const { data: coursesData } = useGetAllCoursesQuery();

  const courses = coursesData?.data || [];
  const myCourses = courses.filter((c) => c.createdBy === user?.id);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600">Teacher Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">My Courses</h3>
          <p className="text-3xl font-bold mt-2">{myCourses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Avg Rating</h3>
          <p className="text-3xl font-bold mt-2">4.5</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCourses.map((course) => (
            <div key={course._id} className="border rounded-lg p-4">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

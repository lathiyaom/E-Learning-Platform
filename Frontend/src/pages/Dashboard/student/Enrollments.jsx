import React from "react";
import { useGetMyEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import AdminLayout from "../../../utils/Adminlayoute";

const Enrollments = () => {
  const { data, isLoading } = useGetMyEnrollmentsQuery();

  const enrollments = data?.data || [];

  if (isLoading) {
    return <AdminLayout><div className="p-6">Loading enrollments...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Enrollments</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.courseId || enrollment.course_id || {};
            const progress = enrollment.progressPercent ?? enrollment.progress ?? 0;

            return (
              <div key={enrollment._id} className="bg-white rounded-lg shadow p-4">
                <img
                  src={course?.image || "https://placehold.co/640x360?text=Course"}
                  alt={course?.title || "Course"}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h3 className="font-semibold text-lg mb-2">{course?.title || "Untitled course"}</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{enrollment.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No enrollments yet</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Enrollments;

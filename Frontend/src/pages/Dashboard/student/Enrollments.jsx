import React from "react";
import { useSelector } from "react-redux";
import { useGetStudentEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";

const Enrollments = () => {
  const { user } = useSelector((state) => state.auth || {});
  const { data, isLoading } = useGetStudentEnrollmentsQuery(user?.id, {
    skip: !user?.id,
  });

  const enrollments = data?.data || [];

  if (isLoading) {
    return <div className="p-6">Loading enrollments...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Enrollments</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <div key={enrollment._id} className="bg-white rounded-lg shadow p-4">
            <img
              src={enrollment.courseId?.image}
              alt={enrollment.courseId?.title}
              className="w-full h-40 object-cover rounded mb-3"
            />
            <h3 className="font-semibold text-lg mb-2">
              {enrollment.courseId?.title}
            </h3>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{enrollment.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${enrollment.progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {enrollment.status}
              </span>
              <button className="text-blue-600 text-sm hover:underline">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>

      {enrollments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No enrollments yet</p>
        </div>
      )}
    </div>
  );
};

export default Enrollments;

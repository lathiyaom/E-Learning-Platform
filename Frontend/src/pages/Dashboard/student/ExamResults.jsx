import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMyEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import { useGetStudentSubmissionsQuery } from "../../../redux/Apis/examApi";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import AdminLayout from "../../../utils/Adminlayoute";

const ExamResults = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const user = useSelector(selectCurrentUser);

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetMyEnrollmentsQuery(
    undefined,
    { skip: !(user?._id || user?.id) }
  );
  const { data: submissionsData, isLoading: submissionsLoading } = useGetStudentSubmissionsQuery(
    { studentId: user?._id || user?.id, courseId: selectedCourse || undefined },
    { skip: !(user?._id || user?.id) }
  );

  const enrollments = enrollmentsData?.data || [];
  const submissions = submissionsData?.data || [];

  const filteredSubmissions = selectedCourse
    ? submissions.filter((s) => (s.examId?.courseId?._id || s.examId?.courseId)?.toString() === selectedCourse.toString())
    : submissions;

  const calculateAverageScore = () => {
    if (filteredSubmissions.length === 0) return 0;
    const total = filteredSubmissions.reduce((sum, s) => sum + (s.totalScore || s.score || 0), 0);
    return (total / filteredSubmissions.length).toFixed(1);
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Exam Results</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border rounded"
            disabled={enrollmentsLoading}
          >
            <option value="">All Courses</option>
            {enrollments.map((enrollment) => {
              const cid = enrollment.courseId?._id || enrollment.courseId;
              const title = enrollment.courseId?.title || enrollment.courseTitle || `Course ${cid}`;
              return (
                <option key={enrollment._id || enrollment.id} value={cid}>
                  {title}
                </option>
              );
            })}
          </select>
        </div>

        {/* Average Score Card */}
        {filteredSubmissions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-blue-600 text-sm font-medium mb-1">Average Score</div>
            <div className="text-3xl font-bold text-blue-700">{calculateAverageScore()}%</div>
          </div>
        )}

        {submissionsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedCourse
              ? "No exam submissions found for this course."
              : "You haven't submitted any exams yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Submitted On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id || submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {submission.examId?.title || submission.examTitle || `Exam ${submission.examId?._id || submission.examId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded ${getGradeColor(
                          submission.totalScore || submission.score || 0
                        )}`}
                      >
                        {submission.totalScore !== null && submission.totalScore !== undefined
                          ? `${submission.totalScore}%`
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          submission.status === "graded"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {submission.status === "graded" ? "Graded" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {submission.feedback || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default ExamResults;

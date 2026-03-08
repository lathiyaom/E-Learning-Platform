import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetExamsByCourseQuery, useDeleteExamMutation } from "../../../redux/Apis/examApi";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import AdminLayout from "../../../utils/Adminlayoute";

const Exams = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery();
  const { data: examsData, isLoading: examsLoading } = useGetExamsByCourseQuery(
    selectedCourse,
    { skip: !selectedCourse }
  );
  const [deleteExam] = useDeleteExamMutation();

  const courseList = coursesData?.data || [];
  const teacherId = String(user?._id || user?.id || "");
  const myCourses = courseList.filter(
    (course) =>
      String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
      String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
  );

  const exams = examsData?.data || [];

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      await deleteExam(examId).unwrap();
      alert("Exam deleted successfully!");
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam: " + (error.data?.message || error.message));
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Exams</h1>
        <button
          onClick={() => navigate("/teacher/exams")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!selectedCourse}
        >
          Create New Exam
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border rounded"
            disabled={coursesLoading}
          >
            <option value="">-- Select Course --</option>
            {myCourses.map((course) => (
              <option key={course._id || course.id} value={course._id || course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            {examsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No exams created for this course yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                  <div key={exam._id || exam.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {exam.description || "No description"}
                    </p>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{exam.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Marks:</span>
                        <span className="font-medium">{exam.totalMarks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions:</span>
                        <span className="font-medium">{exam.questions?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/teacher/exams`)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/exams`)}
                        className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exam._id || exam.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Exams;

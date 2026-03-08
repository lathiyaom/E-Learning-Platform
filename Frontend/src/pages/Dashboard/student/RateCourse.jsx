import React, { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useCreateFeedbackMutation } from "../../../redux/Apis/feedbackApi";
import { useGetMyEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import AdminLayout from "../../../utils/Adminlayoute";
import { getApiErrorMessage } from "../../../utils/apiError";

const RateCourse = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: enrollmentsData, isLoading } = useGetMyEnrollmentsQuery();
  const [createFeedback, { isLoading: submitting }] = useCreateFeedbackMutation();

  const enrolledCourses = useMemo(() => {
    const enrollments = enrollmentsData?.data || [];
    return enrollments
      .map((item) => {
        const course = item.courseId || item.course_id;
        if (!course) return null;
        return {
          id: course._id || course,
          title: course.title || "Untitled course",
        };
      })
      .filter(Boolean);
  }, [enrollmentsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || rating === 0) return;

    try {
      await createFeedback({
        courseId: selectedCourse,
        rating,
        comment,
      }).unwrap();

      SuccessToster("Feedback submitted successfully", 2500);
      setSelectedCourse("");
      setRating(0);
      setHoveredRating(0);
      setComment("");
    } catch (error) {
      ErrorToster(getApiErrorMessage(error, "Failed to submit feedback"), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Rate a Course</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select a Course --</option>
              {enrolledCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={34}
                    className={
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Share your course experience..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedCourse || rating === 0}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default RateCourse;

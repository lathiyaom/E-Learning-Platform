import React, { useState } from "react";
import { useGetStudentEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import { useCreateFeedbackMutation } from "../../../redux/Apis/feedbackApi";
import { Star } from "lucide-react";

const RateCourse = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useGetStudentEnrollmentsQuery(
    user.id,
    { skip: !user.id }
  );
  
  const [createFeedback, { isLoading: submitting }] = useCreateFeedbackMutation();

  const enrollments = enrollmentsData?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      alert("Please select a course");
      return;
    }
    
    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    try {
      await createFeedback({
        courseId: selectedCourse,
        reviewerId: user.id,
        rating,
        comment,
      }).unwrap();

      alert("Feedback submitted successfully!");
      setSelectedCourse("");
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback: " + (error.data?.message || error.message));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Rate a Course</h1>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={enrollmentsLoading}
              required
            >
              <option value="">-- Select a Course --</option>
              {enrollments.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.courseId}>
                  {enrollment.courseTitle || `Course ${enrollment.courseId}`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                You rated this course {rating} out of 5 stars
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience with this course..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || !selectedCourse || rating === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCourse("");
                setRating(0);
                setComment("");
              }}
              className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateCourse;

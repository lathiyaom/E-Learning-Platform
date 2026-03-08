import React, { useState, useMemo } from "react";
import { Star, Send, MessageSquare, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import {
  useCreateFeedbackMutation,
  useGetUserFeedbackQuery,
} from "../../../redux/Apis/feedbackApi";
import {
  useGetMyEnrollmentsQuery,
} from "../../../redux/Apis/enrollmentApi";
import { SuccessToster, ErrorToster } from "../../../components/toster";
import AdminLayout from "../../../utils/Adminlayoute";
import { getApiErrorMessage } from "../../../utils/apiError";

export default function StudentFeedbackSystem() {
  const { user } = useSelector((state) => state.auth);
  const studentId = user?._id || user?.id;

  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Fetch student's enrolled courses
  const { data: enrollmentsData, isLoading: loadingEnrollments } =
    useGetMyEnrollmentsQuery(undefined, {
      skip: !studentId,
    });

  // Fetch user's feedback history
  const { data: feedbackData, isLoading: loadingFeedback } =
    useGetUserFeedbackQuery(studentId, {
      skip: !studentId,
    });

  // Create feedback mutation
  const [createFeedback, { isLoading: submitting }] =
    useCreateFeedbackMutation();

  // Extract courses from enrollments
  const enrolledCourses = useMemo(() => {
    if (!enrollmentsData?.data) return [];
    const courseMap = new Map();
    enrollmentsData.data
      .filter((enrollment) => enrollment.courseId || enrollment.course_id)
      .forEach((enrollment) => {
        const id =
          enrollment.courseId?._id ||
          enrollment.course_id?._id ||
          enrollment.courseId ||
          enrollment.course_id;
        if (!id || courseMap.has(String(id))) return;
        courseMap.set(String(id), {
        id: enrollment.courseId?._id || enrollment.course_id?._id || enrollment.courseId || enrollment.course_id,
        name: enrollment.courseId?.title || enrollment.course_id?.title || "Course",
        });
      });
    return Array.from(courseMap.values());
  }, [enrollmentsData]);

  // Extract feedbacks
  const feedbacks = useMemo(() => {
    if (!feedbackData?.data) return [];
    return feedbackData.data.map((fb) => ({
      id: fb._id,
      course: fb.courseId?.title || "General",
      courseId: fb.courseId?._id,
      rating: fb.rating,
      message: fb.comment,
      date: fb.createdAt,
    }));
  }, [feedbackData]);

  // Submit feedback
  const submitFeedback = async () => {
    if (rating === 0) {
      ErrorToster("Please select a rating", 3000);
      return;
    }
    if (!feedback.trim()) {
      ErrorToster("Please write your feedback", 3000);
      return;
    }
    if (!selectedCourse) {
      ErrorToster("Please select a course", 3000);
      return;
    }

    try {
      const payload = {
        courseId: selectedCourse,
        rating,
        comment: feedback.trim(),
      };

      await createFeedback(payload).unwrap();
      SuccessToster("Feedback submitted successfully!", 3000);

      // Reset form
      setRating(0);
      setFeedback("");
      setSelectedCourse("");
    } catch (error) {
      ErrorToster(getApiErrorMessage(error, "Failed to submit feedback"), 3000);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const avg =
      feedbacks.length === 0
        ? 0
        : (
            feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length
          ).toFixed(1);

    const coursesRated = new Set(
      feedbacks.filter((f) => f.courseId).map((f) => f.courseId)
    ).size;

    return {
      average: avg,
      total: feedbacks.length,
      coursesRated,
    };
  }, [feedbacks]);

  if (loadingEnrollments || loadingFeedback) {
    return (
      <AdminLayout>
        <div className="p-10 min-h-screen bg-slate-100 flex items-center justify-center">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <div className="p-10 min-h-screen bg-slate-100">
      <h1 className="text-3xl font-bold mb-6">Student Feedback</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="bg-white p-6 rounded shadow">
          <select
            className="border w-full mb-3 p-2 rounded"
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value);
              setSelectedCourse("");
            }}
            disabled
          >
            <option value="courses">Course Feedback</option>
          </select>

          <select
            className="border w-full mb-3 p-2 rounded"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {enrolledCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stars */}
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                onClick={() => setRating(s)}
                className={`cursor-pointer ${
                  s <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
                size={24}
              />
            ))}
          </div>

          <textarea
            maxLength={500}
            className="border w-full p-2 mb-2 rounded"
            rows={4}
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <small className="text-gray-500">
            {feedback.length}/500 characters
          </small>

          <button
            onClick={submitFeedback}
            disabled={submitting}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white w-full p-2 flex justify-center items-center gap-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} /> Submit Feedback
              </>
            )}
          </button>
        </div>

        {/* LIST */}
        <div className="md:col-span-2">
          {feedbacks.length === 0 && (
            <div className="bg-white p-12 text-center rounded shadow">
              <MessageSquare className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-gray-500">No feedback submitted yet</p>
            </div>
          )}

          {feedbacks.map((f) => (
            <div key={f.id} className="bg-white p-4 mb-4 rounded shadow">
              <div className="flex justify-between items-start">
                <b className="text-lg">{f.course}</b>
                <span className="text-sm text-gray-500">
                  {new Date(f.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-1 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={
                      s <= f.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {f.rating}/5
                </span>
              </div>

              <p className="text-gray-700">{f.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600 mb-2">Average Rating</p>
          <b className="text-3xl text-blue-600">{stats.average}</b>
          <span className="text-gray-500 ml-2">/5.0</span>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600 mb-2">Total Feedback</p>
          <b className="text-3xl text-green-600">{stats.total}</b>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600 mb-2">Courses Rated</p>
          <b className="text-3xl text-purple-600">{stats.coursesRated}</b>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}

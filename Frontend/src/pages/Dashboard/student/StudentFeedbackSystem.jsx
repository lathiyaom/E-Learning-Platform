import React, { useMemo, useState } from "react";
import { Star, Send, MessageSquare, Loader2, Sparkles } from "lucide-react";
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
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Button";

function FeedbackStars({ rating, interactive, onSelect, disabled }) {
  const stars = [1, 2, 3, 4, 5];

  if (!interactive) {
    return (
      <div className="flex gap-1">
        {stars.map((s) => (
          <Star
            key={s}
            size={16}
            className={
              s <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300 dark:text-slate-600"
            }
          />
        ))}
        <span className="ml-2 text-sm text-slate-700 dark:text-slate-200">
          {rating}/5
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          className="p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studprimary/30 dark:focus-visible:ring-premium-gold/30 disabled:cursor-not-allowed"
          onClick={() => !disabled && onSelect?.(s)}
          aria-label={`${s} star`}
          aria-pressed={s === rating}
          disabled={disabled}
        >
          <Star
            size={26}
            className={
              s <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300 dark:text-slate-600"
            }
          />
        </button>
      ))}
    </div>
  );
}

function FeedbackCard({ feedback }) {
  return (
    <Card className="p-6 mb-3 last:mb-0 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 hover:border-studprimary/30 dark:hover:border-premium-gold/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <b className="text-lg text-slate-900 dark:text-white">
            {feedback.course}
          </b>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {feedback.date
              ? new Date(feedback.date).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <FeedbackStars rating={feedback.rating} />
        </div>
      </div>

      <p className="mt-4 text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
        {feedback.message}
      </p>
    </Card>
  );
}

export default function StudentFeedbackSystem() {
  const { user } = useSelector((state) => state.auth);
  const studentId = user?._id || user?.id;

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
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="relative w-24 h-24 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
            <Loader2 className="animate-spin text-studprimary dark:text-premium-gold" size={42} />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* HERO */}
        <section className="relative bg-lavender-light dark:bg-navy-charcoal rounded-2xl md:rounded-[2.5rem] px-4 py-8 sm:px-6 sm:py-10 border border-white/50 dark:border-white/10 shadow-sm dark:shadow-2xl overflow-hidden text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" />
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
              style={{
                backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
                backgroundSize: "1.5rem 1.5rem",
              }}
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-xs font-bold tracking-wider uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Student Feedback</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Share your experience
              <span className="text-studprimary dark:text-premium-gold">.</span>
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Rate your courses and send thoughtful feedback. It helps improve
              content quality for everyone.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* FORM */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6">
              <Card className="p-6 rounded-2xl bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 shadow-sm h-fit">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Submit Feedback
                    </h2>
                    <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                      Your rating helps improve course quality.
                    </p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 px-3 py-1.5 border border-studprimary/20 dark:border-premium-gold/20">
                    <Sparkles className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                    <span className="text-xs font-bold text-studprimary dark:text-premium-gold">
                      Quick Rate
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Select course
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
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
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Rating
                  </label>
                  <FeedbackStars
                    rating={rating}
                    interactive
                    onSelect={setRating}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Feedback (optional but recommended)
                  </label>
                  <textarea
                    maxLength={500}
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 resize-none min-h-[120px]"
                    placeholder="Write your feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <small className="text-xs text-slate-500 dark:text-slate-400">
                      {feedback.length}/500 characters
                    </small>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={submitFeedback}
                  disabled={submitting}
                  className="w-full h-12 bg-studprimary dark:bg-premium-gold hover:bg-studprimary/90 dark:hover:brightness-110 text-white dark:text-deep-charcoal font-bold shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 hover:shadow-studprimary/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
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
                </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* LIST */}
          <div className="lg:col-span-8">
            <Card className="p-6 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Your Feedback
                  </h2>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                    {feedbacks.length} rating{feedbacks.length === 1 ? "" : "s"} submitted
                  </p>
                </div>
                <div className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 px-3 py-1.5 border border-slate-200 dark:border-white/10">
                  <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Latest
                  </span>
                </div>
              </div>

              {feedbacks.length === 0 ? (
                <div className="py-10 text-center">
                  <MessageSquare className="mx-auto mb-3 text-slate-400 dark:text-slate-500" size={54} />
                  <p className="text-slate-600 dark:text-slate-300">
                    No feedback submitted yet
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto modal-scrollbar modal-scroll-smooth max-h-[52vh] lg:max-h-[62vh] pr-2">
                  {feedbacks.map((f) => (
                    <FeedbackCard key={f.id} feedback={f} />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
              Average Rating
            </p>
            <div className="flex items-end gap-3">
              <b className="text-3xl text-studprimary dark:text-premium-gold font-extrabold leading-none">
                {stats.average}
              </b>
              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                /5.0
              </span>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
              Total Feedback
            </p>
            <b className="text-3xl text-emerald-600 dark:text-emerald-400 font-extrabold">
              {stats.total}
            </b>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
              Courses Rated
            </p>
            <b className="text-3xl text-violet-600 dark:text-violet-400 font-extrabold">
              {stats.coursesRated}
            </b>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

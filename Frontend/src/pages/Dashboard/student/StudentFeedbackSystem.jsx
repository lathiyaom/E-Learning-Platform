import React, { useMemo, useState } from "react";
import { Star, Send, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function FeedbackStars({ rating, interactive, onSelect, disabled }) {
  const stars = [1, 2, 3, 4, 5];

  if (!interactive) {
    return (
      <div className="flex gap-1 items-center">
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
        <span className="ml-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          {rating}.0
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      {stars.map((s) => (
        <motion.button
          key={s}
          whileHover={{ scale: 1.2, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          className="p-1 rounded-xl focus:outline-none disabled:cursor-not-allowed group"
          onClick={() => !disabled && onSelect?.(s)}
          aria-label={`${s} star`}
          aria-pressed={s === rating}
          disabled={disabled}
        >
          <Star
            size={28}
            className={`transition-colors duration-300 ${
              s <= rating
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                : "text-slate-300 dark:text-slate-600 group-hover:text-yellow-400/50"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

function FeedbackCard({ feedback }) {
  return (
    <motion.div variants={itemVariants} className="mb-4 last:mb-0">
      <Card className="p-6 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 hover:border-studprimary/30 dark:hover:border-premium-gold/30 hover:shadow-lg dark:hover:shadow-premium-gold/5 transition-all duration-300 group">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <b className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-studprimary dark:group-hover:text-premium-gold transition-colors">
              {feedback.course}
            </b>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              {feedback.date ? new Date(feedback.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
            </p>
          </div>
          <div className="shrink-0">
            <FeedbackStars rating={feedback.rating} />
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium h-fit">
          {feedback.message}
        </p>
      </Card>
    </motion.div>
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
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-10 px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* HERO */}
        <motion.section 
          variants={itemVariants}
          className="relative bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#F5F3FF] dark:from-navy-charcoal dark:to-deep-charcoal rounded-2xl md:rounded-[3rem] px-4 py-12 sm:px-12 sm:py-20 border border-white/50 dark:border-white/10 shadow-sm dark:shadow-2xl overflow-hidden text-center"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-[100px]" 
            />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2" 
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-[10px] font-bold tracking-widest uppercase border border-studprimary/20 dark:border-premium-gold/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Learning Experience</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
            >
              Share your insights
              <span className="text-studprimary dark:text-premium-gold">.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-slate-600 dark:text-slate-400 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Your voice matters. Rating your courses helps us refine content quality and create a better learning experience for the entire community.
            </motion.p>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM */}
          <motion.div variants={itemVariants} className="lg:col-span-12 xl:col-span-4">
            <div className="lg:sticky lg:top-6">
              <Card className="p-8 rounded-[2.5rem] bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-black/20 h-fit">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Submit Review
                    </h2>
                    <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 font-medium">
                      Help us improve course quality.
                    </p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 px-4 py-2 border border-studprimary/20 dark:border-premium-gold/20">
                    <Sparkles className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                    <span className="text-[10px] font-bold text-studprimary dark:text-premium-gold uppercase tracking-wider">
                      Quick rate
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Target Course
                    </label>
                    <div className="relative group">
                      <select
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-studprimary/20 dark:focus:ring-premium-gold/20 transition-all appearance-none cursor-pointer"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                      >
                        <option value="">Choose Course</option>
                        {enrolledCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Loader2 className={`w-4 h-4 animate-spin ${submitting ? "block" : "hidden"}`} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Overall Rating
                    </label>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-center shadow-inner">
                      <FeedbackStars
                        rating={rating}
                        interactive
                        onSelect={setRating}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Your Thoughts
                    </label>
                    <textarea
                      maxLength={500}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-studprimary/20 dark:focus:ring-premium-gold/20 resize-none min-h-[160px] transition-all"
                      placeholder="What did you like about this course?"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <div className="flex items-center justify-between px-1">
                      <small className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {feedback.length} / 500 characters
                      </small>
                    </div>
                  </div>

                  <motion.div
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="button"
                      onClick={submitFeedback}
                      disabled={submitting}
                      className="w-full h-14 bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal font-bold shadow-xl shadow-studprimary/25 dark:shadow-premium-gold/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-base"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* LIST */}
          <motion.div variants={itemVariants} className="lg:col-span-12 xl:col-span-8">
            <Card className="p-8 rounded-[2.5rem] bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Feedback History
                  </h2>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 font-medium">
                    {feedbacks.length} testimonial{feedbacks.length === 1 ? "" : "s"} shared
                  </p>
                </div>
                <div className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-2 border border-slate-200 dark:border-white/10">
                  <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                    Recent
                  </span>
                </div>
              </div>

              {feedbacks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center relative z-10">
                      <MessageSquare className="text-slate-300 dark:text-slate-600 w-12 h-12" />
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 rounded-[2.5rem] border-2 border-slate-200 dark:border-white/10 scale-110" 
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-slate-700 dark:text-slate-200">No testimonials yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      You haven't submitted any feedback for your courses. Start by selecting a course on the left.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto modal-scrollbar modal-scroll-smooth max-h-[65vh] pr-4 -mr-4">
                  <motion.div variants={containerVariants}>
                    {feedbacks.map((f) => (
                      <FeedbackCard key={f.id} feedback={f} />
                    ))}
                  </motion.div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* STATS */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Average Rating", value: stats.average, suffix: "/5.0", color: "text-studprimary dark:text-premium-gold", borderColor: "border-studprimary/20 dark:border-premium-gold/20" },
            { label: "Total Feedback", value: stats.total, color: "text-emerald-600 dark:text-emerald-400", borderColor: "border-emerald-500/20 dark:border-emerald-400/20" },
            { label: "Courses Rated", value: stats.coursesRated, color: "text-studprimary dark:text-premium-gold", borderColor: "border-studprimary/20 dark:border-premium-gold/20" }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className={`p-8 rounded-[2rem] bg-white dark:bg-transparent dark:dark-glass border ${stat.borderColor} shadow-sm group hover:shadow-xl transition-all duration-300`}>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">
                  {stat.label}
                </p>
                <div className="flex items-end gap-2">
                  <b className={`text-4xl font-extrabold leading-none ${stat.color}`}>
                    {stat.value}
                  </b>
                  {stat.suffix && (
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-1">
                      {stat.suffix}
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}

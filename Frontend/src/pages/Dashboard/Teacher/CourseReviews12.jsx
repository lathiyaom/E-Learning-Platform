import React, { useMemo, useState } from "react";
import { Star, MessageSquare, Loader2, Sparkles, Filter, TrendingUp, Users, BookOpen, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetCourseFeedbackQuery } from "../../../redux/Apis/feedbackApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";

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

function FeedbackStars({ rating }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1 items-center">
      {stars.map((s) => (
        <Star
          key={s}
          size={14}
          className={
            s <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-300 dark:text-slate-600"
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Card className="rounded-3xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-studprimary/30 dark:hover:border-premium-gold/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Quote size={48} className="text-studprimary dark:text-premium-gold" />
        </div>
        
        <div className="p-6 flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center shrink-0 border border-studprimary/20 dark:border-premium-gold/20">
            <span className="text-lg font-bold text-studprimary dark:text-premium-gold uppercase">
              {(review.reviewerName || "S").charAt(0)}
            </span>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white truncate text-base">
                  {review.reviewerName || "Student"}
                </h4>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                  {review.date ? new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-xl border border-slate-100 dark:border-white/5">
                <FeedbackStars rating={review.rating} />
              </div>
            </div>
            
            <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
              "{review.comment || "No comment provided."}"
            </p>
            
            {review.courseTitle && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                <Badge variant="outline" className="bg-studprimary/5 text-studprimary dark:bg-premium-gold/5 dark:text-premium-gold text-[10px] font-black uppercase tracking-wider border-none px-2 py-0.5">
                  {review.courseTitle}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function CourseReviews() {
  const { user } = useSelector((state) => state.auth);
  const teacherId = user?._id || user?.id;

  const [selectedCourseId, setSelectedCourseId] = useState("all");

  const { data: coursesData, isLoading: loadingCourses } = useGetAllCoursesQuery();
  
  const teacherCourses = useMemo(() => {
    if (!coursesData?.data) return [];
    return coursesData.data.filter(
      (c) => String(c.createdBy?._id || c.createdBy || c.teacher_id?._id || c.teacher_id) === String(teacherId)
    );
  }, [coursesData, teacherId]);

  const { data: feedbackData, isLoading: loadingFeedback } = useGetCourseFeedbackQuery(
    selectedCourseId !== "all" ? selectedCourseId : null,
    { skip: selectedCourseId === "all" }
  );

  const resolvedReviews = useMemo(() => {
    if (!feedbackData?.data) return [];
    return feedbackData.data.map(fb => ({
      id: fb?._id,
      reviewerName: fb?.reviewerId ? `${fb.reviewerId.firstName || ""} ${fb.reviewerId.lastName || ""}`.trim() : "Anonymous",
      rating: fb?.rating || 0,
      comment: fb?.comment || fb?.message || "",
      date: fb?.createdAt,
      courseTitle: teacherCourses.find(c => String(c?._id) === String(fb?.courseId))?.title
    }));
  }, [feedbackData, teacherCourses]);

  const stats = useMemo(() => {
    if (selectedCourseId === "all") {
        const totalPossibleReviews = teacherCourses.reduce((sum, c) => sum + (Number(c.reviewCount) || 0), 0);
        const avgRating = teacherCourses.length > 0 
            ? (teacherCourses.reduce((sum, c) => sum + (parseFloat(c.rating) || 0), 0) / teacherCourses.length).toFixed(1)
            : "0.0";
        return { avgRating, totalReviews: totalPossibleReviews, totalCourses: teacherCourses.length };
    }
    
    const course = teacherCourses.find(c => String(c?._id) === String(selectedCourseId));
    return {
      avgRating: course?.rating || "0.0",
      totalReviews: resolvedReviews.length,
      totalCourses: 1
    };
  }, [selectedCourseId, teacherCourses, resolvedReviews]);

  if (loadingCourses) {
    return (
      <AdminLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-studprimary dark:text-premium-gold" size={42} />
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
        <motion.section 
          variants={itemVariants}
          className="relative bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#F5F3FF] dark:from-navy-charcoal dark:to-deep-charcoal rounded-[3rem] px-8 py-16 border border-white/50 dark:border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-studprimary/5 dark:bg-premium-gold/5 rounded-full blur-[120px]" 
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left space-y-6">
              <Badge variant="outline" className="bg-studprimary/10 dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold border-studprimary/20 dark:border-premium-gold/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                <TrendingUp size={14} className="mr-2 inline" /> Quality Insights
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Course <span className="text-studprimary dark:text-premium-gold">Reviews</span>.
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-xl text-center md:text-left">
                Monitor student feedback across your curriculum. Understand your impact and refine your teaching approach based on real student experiences.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              {[
                { label: "Overall Rating", value: stats.avgRating, icon: Star, color: "text-yellow-500", suffix: "/5.0" },
                { label: "Total Reviews", value: stats.totalReviews, icon: MessageSquare, color: "text-studprimary dark:text-premium-gold" },
                { label: "Courses", value: stats.totalCourses, icon: BookOpen, color: "text-purple-500" },
                { label: "Students", value: teacherCourses.reduce((s, c) => s + (Number(c.studentCount) || 0), 0), icon: Users, color: "text-emerald-500" }
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none text-wrap sm:text-nowrap">{stat.value}</span>
                    {stat.suffix && <span className="hidden sm:block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">{stat.suffix}</span>}
                  </div>
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.aside variants={itemVariants} className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            <Card className="p-6 rounded-[2.5rem] bg-white dark:bg-transparent dark:dark-glass shadow-xl border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
                  <Filter size={18} className="text-studprimary dark:text-premium-gold" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Filter Reviews</h3>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 text-center">Select Course to View Feedback</p>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => setSelectedCourseId("all")}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border font-bold text-sm ${
                      selectedCourseId === "all"
                        ? "bg-studprimary text-white border-studprimary dark:bg-premium-gold dark:text-deep-charcoal dark:border-premium-gold shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20"
                        : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    }`}
                  >
                    <span>Summary Overview</span>
                    <TrendingUp size={16} className={selectedCourseId === "all" ? "opacity-100" : "opacity-30"} />
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-white/5 my-4" />

                  {teacherCourses.map((course) => (
                    <button
                      key={course._id}
                      onClick={() => setSelectedCourseId(course._id)}
                      className={`group w-full flex flex-col items-start p-4 rounded-2xl transition-all duration-300 border text-left ${
                        selectedCourseId === course._id
                          ? "bg-studprimary text-white border-studprimary dark:bg-premium-gold dark:text-deep-charcoal dark:border-premium-gold shadow-lg"
                          : "bg-white border-slate-100 text-slate-700 hover:border-studprimary/30 dark:bg-white/5 dark:border-white/5 dark:text-slate-200 dark:hover:border-premium-gold/30 shadow-sm"
                      }`}
                    >
                      <span className="text-sm font-black truncate w-full mb-1">{course.title}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star size={10} className={selectedCourseId === course._id ? "text-white" : "text-yellow-500"} fill={selectedCourseId === course._id ? "white" : "currentColor"} />
                          <span className="text-[10px] font-black">{course.rating || "0.0"}</span>
                        </div>
                        <span className="text-[10px] opacity-60 font-medium">({course.reviewCount || 0} reviews)</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-studprimary/5 dark:bg-premium-gold/5 border border-studprimary/10 dark:border-premium-gold/10">
              <Sparkles className="w-6 h-6 text-studprimary dark:text-premium-gold mb-4" />
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">Teacher Tip</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Address constructive criticism early. High-quality interaction in reviews often leads to better student retention and future enrollments.
              </p>
            </div>
          </motion.aside>

          <main className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
            <AnimatePresence mode="popLayout">
              {selectedCourseId === "all" ? (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20 bg-slate-50/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10"
                >
                  <div className="w-24 h-24 rounded-[2.5rem] bg-white dark:bg-white/5 flex items-center justify-center shadow-xl border border-slate-100 dark:border-white/10">
                    <TrendingUp size={40} className="text-studprimary dark:text-premium-gold" />
                  </div>
                  <div className="max-w-md space-y-4">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Select a Course</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                      To view detailed student feedback and individual comments, please select a specific course from the filter menu on the left.
                    </p>
                  </div>
                </motion.div>
              ) : loadingFeedback ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-studprimary dark:text-premium-gold" size={32} />
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Testimonials...</p>
                  </div>
                </div>
              ) : resolvedReviews.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <MessageSquare size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">No reviews yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Stay tuned. As students complete your course, their feedback will appear here in real-time.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 flex-1"
                >
                  <div className="flex items-center justify-between px-4 mb-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Student Testimonials</h3>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full">
                      {resolvedReviews.length} Records found
                    </span>
                  </div>
                  <div className="space-y-6 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar pb-10 min-h-[400px]">
                    {resolvedReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </motion.div>
    </AdminLayout>
  );
}

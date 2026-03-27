import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getTodayLectures } from "../../../redux/Apis/lectureApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";
import { Card } from "../../../components/Card";
import LecturesPoster from "./ConductedLectures/LecturesPoster";
import LectureCard from "./ConductedLectures/LectureCard";
import LecturesEmpty from "./ConductedLectures/LecturesEmpty";

/* ── Skeleton shimmer block ── */
function Shimmer({ className }) {
  return (
    <div className={`rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse ${className}`} />
  );
}

function LectureCardSkeleton() {
  return (
    <Card className="relative bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl p-0 gap-0 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 dark:bg-white/10 animate-pulse rounded-l-2xl" />
      <div className="pl-6 pr-5 pt-5 pb-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Shimmer className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-4">
              <Shimmer className="h-5 w-1/2" />
              <Shimmer className="h-5 w-20 rounded-full" />
            </div>
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
          <Shimmer className="h-4" />
          <Shimmer className="h-4" />
          <Shimmer className="h-4" />
        </div>
        <div className="flex gap-3">
          <Shimmer className="h-9 w-28 rounded-xl" />
          <Shimmer className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const StudentConductedLectures = () => {
  const dispatch = useDispatch();
  const { lectures, loading } = useSelector((state) => state.lecture);

  useEffect(() => {
    dispatch(getTodayLectures());
  }, [dispatch]);

  const count = loading ? 0 : (lectures?.length ?? 0);

  return (
    <AdminLayout
      showSearch={false}
      breadcrumbItems={getBreadcrumbs("DASHBOARD")}
    >
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-6"
      >
        <motion.div variants={itemVariants}>
          <LecturesPoster count={count} />
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[0, 1, 2].map((i) => (
                <motion.div key={i} variants={itemVariants}>
                  <LectureCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : !lectures || lectures.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <LecturesEmpty />
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {lectures.map((lecture) => (
                <motion.div key={lecture._id} variants={itemVariants}>
                  <LectureCard lecture={lecture} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  );
};

export default StudentConductedLectures;

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  Calendar,
  Clock,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";
 
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const QuickAccess = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: "lectures",
      title: "Today's Lectures",
      description: "View your scheduled lectures",
      icon: BookOpen,
      link: "/student/conducted-lectures",
    },
    {
      id: "upcoming-lectures",
      title: "Upcoming Lectures",
      description: "See lectures for next 7 days",
      icon: Clock,
      link: "/student/upcoming-lectures",
    },
    {
      id: "exams",
      title: "Upcoming Exams",
      description: "View and prepare for exams",
      icon: ClipboardList,
      link: "/student/upcoming-exams",
    },
    {
      id: "exam-results",
      title: "Exam Results",
      description: "Check your exam scores",
      icon: Award,
      link: "/student/exam-results",
    },
    {
      id: "timetable",
      title: "My Timetable",
      description: "View weekly schedule",
      icon: Calendar,
      link: "/student/timetable",
    },
    {
      id: "enrollments",
      title: "My Enrollments",
      description: "Manage course enrollments",
      icon: Users,
      link: "/student/enrollments",
    },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-5 md:p-6 shadow-sm"
    >
      <div className="pointer-events-none absolute -top-20 -right-16 h-44 w-44 rounded-full bg-lavender-light dark:bg-premium-gold/10 blur-3xl" />

      <div className="relative mb-5 flex items-center justify-between gap-4">
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Quick Access
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Jump to your most-used student actions
          </p>
        </motion.div>
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.3 }}
          className="hidden sm:flex items-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          {quickActions.length} shortcuts
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.link)}
              className="group flex h-full items-start gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-4 text-left transition-all duration-300 hover:border-studprimary/30 dark:hover:border-premium-gold/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studprimary/40 dark:focus-visible:ring-premium-gold/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lavender-light text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold transition-colors group-hover:bg-studprimary/10 dark:group-hover:bg-premium-gold/15">
                <IconComponent className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">
                  {action.title}
                </h4>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {action.description}
                </p>

                <div className="mt-3 flex items-center text-xs font-semibold text-studprimary dark:text-premium-gold">
                  Open
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.section>
  );
};

export default QuickAccess;


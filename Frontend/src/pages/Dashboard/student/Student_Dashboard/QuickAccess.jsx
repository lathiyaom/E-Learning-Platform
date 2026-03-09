import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, Calendar, Clock, Users, Award } from "lucide-react";

const QuickAccess = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: "lectures",
      title: "Today's Lectures",
      description: "View your scheduled lectures",
      icon: BookOpen,
      color: "bg-blue-500",
      link: "/student/conducted-lectures",
    },
    {
      id: "upcoming-lectures",
      title: "Upcoming Lectures",
      description: "See lectures for next 7 days",
      icon: Clock,
      color: "bg-purple-500",
      link: "/student/upcoming-lectures",
    },
    {
      id: "exams",
      title: "Upcoming Exams",
      description: "View and prepare for exams",
      icon: ClipboardList,
      color: "bg-red-500",
      link: "/student/upcoming-exams",
    },
    {
      id: "exam-results",
      title: "Exam Results",
      description: "Check your exam scores",
      icon: Award,
      color: "bg-green-500",
      link: "/student/exam-results",
    },
    {
      id: "timetable",
      title: "My Timetable",
      description: "View weekly schedule",
      icon: Calendar,
      color: "bg-orange-500",
      link: "/student/timetable",
    },
    {
      id: "enrollments",
      title: "My Enrollments",
      description: "Manage course enrollments",
      icon: Users,
      color: "bg-indigo-500",
      link: "/student/enrollments",
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-white/5">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Quick Access
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.link)}
              className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className={`p-3 rounded-lg ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                <IconComponent className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuickAccess;

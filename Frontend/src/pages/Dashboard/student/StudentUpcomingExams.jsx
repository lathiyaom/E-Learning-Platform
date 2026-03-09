import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, BookOpen, Loader2, AlertCircle, Play } from "lucide-react";
import { useGetStudentExamsQuery } from "../../../redux/Apis/examApi";

const StudentUpcomingExams = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: examsData, isLoading, error } = useGetStudentExamsQuery();

  const upcomingExams = examsData?.data?.filter(exam => {
    const examDate = new Date(exam.startDate);
    const now = new Date();
    return examDate > now && exam.status === "published";
  }) || [];

  const handleTakeExam = (examId) => {
    navigate(`/student/exam-taking/${examId}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading exams</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-charcoal dark:to-deep-charcoal min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Upcoming Exams
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and prepare for your upcoming examinations
        </p>
      </div>

      {upcomingExams.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No upcoming exams
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have any upcoming exams scheduled.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {upcomingExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {exam.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                        {exam.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {exam.status?.charAt(0).toUpperCase() + exam.status?.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Date:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(exam.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {exam.duration} minutes
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Total Marks:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {exam.totalMarks}
                      </span>
                    </div>
                  </div>

                  {exam.courseId && (
                    <div className="mb-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Course: <span className="font-medium text-slate-900 dark:text-white">
                          {exam.courseId.title || 'N/A'}
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {exam.questions?.length || 0} questions
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Starts: {new Date(exam.startDate).toLocaleTimeString()}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Ends: {new Date(exam.endDate).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleTakeExam(exam._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition"
                    >
                      <Play className="w-4 h-4" />
                      Take Exam
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentUpcomingExams;

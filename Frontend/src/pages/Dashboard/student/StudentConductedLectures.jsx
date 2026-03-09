import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, MapPin, Users, Calendar, Loader2, Play, BookOpen } from "lucide-react";
import { getTodayLectures } from "../../../redux/Apis/lectureApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";

const StudentConductedLectures = () => {
  const dispatch = useDispatch();
  const { lectures, loading, pagination } = useSelector((state) => state.lecture);

  useEffect(() => {
    dispatch(getTodayLectures());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <AdminLayout showSearch={false} breadcrumbItems={getBreadcrumbs("DASHBOARD")}>
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-charcoal dark:to-deep-charcoal min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Today's Lectures
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and join your scheduled lectures for today
        </p>
      </div>

      {!lectures || lectures.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No lectures today
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have any lectures scheduled for today.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {lectures.map((lecture) => (
            <div
              key={lecture._id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  lecture.status === 'ongoing' ? 'bg-green-100 dark:bg-green-900' : 
                  lecture.status === 'completed' ? 'bg-gray-100 dark:bg-gray-900' : 
                  'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <Play className={`w-6 h-6 ${
                    lecture.status === 'ongoing' ? 'text-green-600 dark:text-green-400' : 
                    lecture.status === 'completed' ? 'text-gray-600 dark:text-gray-400' : 
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {lecture.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                        {lecture.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lecture.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      lecture.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' :
                      lecture.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {lecture.status?.charAt(0).toUpperCase() + lecture.status?.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Date:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(lecture.lectureDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Time:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {lecture.startTime} - {lecture.endTime}
                      </span>
                    </div>
                    
                    {lecture.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Room:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {lecture.room}
                        </span>
                      </div>
                    )}
                  </div>

                  {lecture.courseId && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Course: <span className="font-medium text-slate-900 dark:text-white">
                          {lecture.courseId.title || 'N/A'}
                        </span>
                      </span>
                    </div>
                  )}

                  {lecture.conductedBy && (
                    <div className="mt-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Instructor: <span className="font-medium text-slate-900 dark:text-white">
                          {lecture.conductedBy.firstName} {lecture.conductedBy.lastName}
                        </span>
                      </span>
                    </div>
                  )}

                  {lecture.videoUrl && (
                    <div className="mt-4">
                      <a
                        href={lecture.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                          lecture.status === 'ongoing' ? 'bg-green-500 hover:bg-green-600 text-white' :
                          lecture.status === 'completed' ? 'bg-gray-500 hover:bg-gray-600 text-white' :
                          'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <Play className="w-4 h-4" />
                        {lecture.status === 'ongoing' ? 'Join Now' : 
                         lecture.status === 'completed' ? 'View Recording' : 'Join Lecture'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default StudentConductedLectures;

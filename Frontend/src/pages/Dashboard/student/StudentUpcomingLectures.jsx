import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, MapPin, Users, Calendar, Loader2, Play, BookOpen, Download } from "lucide-react";
import { getUpcomingLectures } from "../../../redux/Apis/lectureApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";

const StudentUpcomingLectures = () => {
  const dispatch = useDispatch();
  const { lectures, loading, pagination } = useSelector((state) => state.lecture);

  useEffect(() => {
    dispatch(getUpcomingLectures({ days: 7, page: 1, limit: 50 }));
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
          Upcoming Lectures
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and join your scheduled lectures
        </p>
      </div>

      {!lectures || lectures.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No upcoming lectures
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have any lectures scheduled for the next 7 days.
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
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                      lecture.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      lecture.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {lecture.status}
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
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        <Play className="w-4 h-4" />
                        Join Lecture
                      </a>
                    </div>
                  )}

                  {/* Materials Section */}
                  {lecture.materials && lecture.materials.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        Download Materials
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {lecture.materials.map((mat, i) => (
                           <a
                             key={i}
                             href={mat.url}
                             target="_blank"
                             download={mat.name}
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:hover:text-blue-400 rounded-lg text-sm transition shadow-sm border border-slate-200 dark:border-slate-600"
                             title={mat.name}
                           >
                             <Download className="w-4 h-4" />
                             <span className="truncate max-w-[200px]">{mat.name}</span>
                           </a>
                        ))}
                      </div>
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

export default StudentUpcomingLectures;

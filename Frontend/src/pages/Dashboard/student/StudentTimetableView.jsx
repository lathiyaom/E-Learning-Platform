import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, MapPin, Users, Loader2, BookOpen } from "lucide-react";
import { getMySchedule } from "../../../redux/Apis/timetableApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../utils/breadcrumbs";

const StudentTimetableView = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mySchedule, loading } = useSelector((state) => state.timetable);

  useEffect(() => {
    if (user?._id || user?.id) {
      dispatch(getMySchedule());
    }
  }, [dispatch, user]);

  const schedule = mySchedule || {};
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <AdminLayout showSearch={false} breadcrumbItems={getBreadcrumbs("DASHBOARD")}>
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Timetable</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {days.map((day) => {
          const slots = schedule[day] || [];
          return (
            <section key={day} className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-lg capitalize mb-3">{day}</h2>
              {slots.length === 0 ? (
                <p className="text-sm text-gray-500">No classes scheduled</p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div key={slot._id} className="border rounded-lg p-3 bg-slate-50">
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        <BookOpen size={16} />
                        {slot.courseId?.title || "Class"}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Clock size={14} />
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <MapPin size={14} />
                        {slot.room || "N/A"}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Users size={14} />
                        {slot.conductedBy?.firstName} {slot.conductedBy?.lastName}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {slot.type || "lecture"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {Object.keys(schedule).length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center mt-6">
          <Clock className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">No timetable available yet</p>
          <p className="text-sm text-gray-400 mt-2">Your class schedule will appear here once set by your teachers</p>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default StudentTimetableView;

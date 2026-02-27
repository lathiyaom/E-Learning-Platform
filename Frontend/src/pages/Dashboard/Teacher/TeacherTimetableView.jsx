import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, MapPin, Users, Loader2 } from "lucide-react";
import { getMySchedule } from "../../../redux/Apis/timetableApi";

const TeacherTimetableView = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mySchedule, loading } = useSelector((state) => state.timetable);

  useEffect(() => {
    if (user?._id || user?.id) {
      dispatch(getMySchedule());
    }
  }, [dispatch, user]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  const timetable = mySchedule || {};

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Timetable</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-200">
              <th className="border p-3 text-left font-semibold">Time</th>
              {daysOfWeek.map((day) => (
                <th key={day} className="border p-3 text-center font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} className="hover:bg-slate-50">
                <td className="border p-3 font-medium text-gray-700">{time}</td>
                {daysOfWeek.map((day) => {
                  const slot = timetable[day]?.find((s) => s.time === time);
                  return (
                    <td key={`${day}-${time}`} className="border p-2">
                      {slot ? (
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <p className="font-semibold text-blue-900">{slot.subject}</p>
                          <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                            <MapPin size={14} />
                            <span>{slot.room}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Users size={14} />
                            <span>{slot.class}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-4">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(timetable).length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center mt-6">
          <Clock className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">No timetable scheduled yet</p>
        </div>
      )}
    </div>
  );
};

export default TeacherTimetableView;

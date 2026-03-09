import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { getMySchedule, createTimetable } from "../../../redux/Apis/timetableApi";
import AdminLayout from "../../../utils/Adminlayoute";
import axiosInstance from "../../../utils/axiosintence";

const TeacherTimetableManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mySchedule, loading } = useSelector((state) => state.timetable);
  const { data: coursesData } = useGetAllCoursesQuery();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    dayOfWeek: "monday",
    startTime: "",
    endTime: "",
    room: "",
    type: "lecture",
    recurrenceStart: "",
    recurrenceEnd: "",
  });

  const teacherId = String(user?._id || user?.id || "");
  const courses = (coursesData?.data || []).filter(
    (course) =>
      String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
      String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
  );

  useEffect(() => {
    if (user?._id || user?.id) {
      dispatch(getMySchedule());
    }
  }, [dispatch, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseId || !formData.startTime || !formData.endTime || !formData.recurrenceStart || !formData.recurrenceEnd) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await dispatch(createTimetable({
        ...formData,
        conductedBy: user?._id || user?.id,
      })).unwrap();

      alert("Timetable entry created successfully!");
      setShowModal(false);
      setFormData({
        courseId: "",
        dayOfWeek: "monday",
        startTime: "",
        endTime: "",
        room: "",
        type: "lecture",
        recurrenceStart: "",
        recurrenceEnd: "",
      });
      dispatch(getMySchedule());
    } catch (error) {
      alert("Failed to create timetable: " + (error.message || error));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timetable entry?")) return;

    try {
      await axiosInstance.delete(`/Timetable/delete/${id}`);
      alert("Timetable entry deleted successfully!");
      dispatch(getMySchedule());
    } catch (error) {
      alert("Failed to delete: " + (error.response?.data?.message || error.message));
    }
  };

  const schedule = mySchedule || {};
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  if (loading) {
    return (
      <AdminLayout showSearch={false}>
        <div className="p-8 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSearch={false} className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Timetable</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Timetable Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {days.map((day) => {
          const slots = schedule[day] || [];
          return (
            <section key={day} className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-lg capitalize mb-3">{day}</h2>
              {slots.length === 0 ? (
                <p className="text-sm text-gray-500">No lectures scheduled</p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div key={slot._id} className="border rounded-lg p-3 bg-slate-50">
                      <p className="font-semibold text-slate-900">
                        {slot.courseId?.title || "Lecture"}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-sm text-slate-600">Room: {slot.room || "N/A"}</p>
                      <p className="text-sm text-slate-600">Type: {slot.type || "lecture"}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleDelete(slot._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Timetable Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Day of Week *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Room</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="practical">Practical</option>
                  <option value="seminar">Seminar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.recurrenceStart}
                    onChange={(e) => setFormData({ ...formData, recurrenceStart: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.recurrenceEnd}
                    onChange={(e) => setFormData({ ...formData, recurrenceEnd: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TeacherTimetableManagement;

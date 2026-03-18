import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Search, ChevronDown } from "lucide-react";
import { getLecturesByCourse, createLecture, updateLecture, deleteLecture } from "../../../redux/Apis/lectureApi";
import { Link, useParams } from "react-router-dom";
import AdminLayout from './../../../utils/Adminlayoute';

const AdminLecturesManagement = () => {
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const { lectures, loading, error, pagination } = useSelector((state) => state.lecture);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lectureDate: "",
    startTime: "",
    endTime: "",
    room: "",
    type: "theory",
    videoUrl: "",
  });

  useEffect(() => {
    if (courseId) {
      dispatch(getLecturesByCourse({ courseId, page: currentPage, limit: 10 }));
    }
  }, [dispatch, courseId, currentPage]);

  const handleOpenModal = (lecture = null) => {
    if (lecture) {
      setEditingLecture(lecture);
      setFormData({
        title: lecture.title,
        description: lecture.description,
        lectureDate: lecture.lectureDate?.split("T")[0],
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        room: lecture.room,
        type: lecture.type,
        videoUrl: lecture.videoUrl,
      });
    } else {
      setEditingLecture(null);
      setFormData({
        title: "",
        description: "",
        lectureDate: "",
        startTime: "",
        endTime: "",
        room: "",
        type: "theory",
        videoUrl: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLecture(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId) {
      return;
    }
    
    const lectureData = {
      ...formData,
      courseId,
      conductedBy: "current-user-id", // Replace with actual user ID from auth
    };

    if (editingLecture) {
      dispatch(updateLecture({ id: editingLecture._id, data: formData }));
    } else {
      dispatch(createLecture(lectureData));
    }

    handleCloseModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch = lecture.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || lecture.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-charcoal dark:to-deep-charcoal min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Lectures Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage all course lectures, materials, and scheduling
        </p>
        {!courseId && (
          <div className="mt-4 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            Select a course first to manage lectures. Go to <Link className="font-semibold underline" to="/managecourses">Manage Courses</Link> and open a specific course lecture route.
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Add Lecture
          </button>
        </div>
      </div>

      {/* Lectures Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading lectures...</div>
        ) : filteredLectures.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No lectures found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredLectures.map((lecture) => (
                    <tr
                      key={lecture._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      <td className="px-6 py-4 text-slate-900 dark:text-white">
                        <div>
                          <p className="font-medium">{lecture.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {lecture.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                        <div>
                          {new Date(lecture.lectureDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {lecture.startTime} - {lecture.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                        <span className="capitalize bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {lecture.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            lecture.status
                          )}`}
                        >
                          {lecture.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(lecture)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => dispatch(deleteLecture(lecture._id))}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {pagination?.pages || 1}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => p + 1)
                  }
                  disabled={currentPage >= (pagination?.pages || 1)}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-slate-100 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingLecture ? "Edit" : "Add"} Lecture
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="seminar">Seminar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="lectureDate"
                    value={formData.lectureDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="e.g., A-101"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  {editingLecture ? "Update" : "Create"} Lecture
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminLecturesManagement;

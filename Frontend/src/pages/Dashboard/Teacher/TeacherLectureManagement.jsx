import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Trash2, Search, FileUp, Play } from "lucide-react";
import { getLecturesByCourse, createLecture, updateLecture, deleteLecture } from "../../../redux/Apis/lectureApi";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import AdminLayout from "../../../utils/Adminlayoute";

const TeacherLectureManagement = () => {
    const dispatch = useDispatch();
    const { lectures, loading, error, pagination } = useSelector((state) => state.lecture);
    const { user } = useSelector((state) => state.auth || {});
    const teacherId = String(user?._id || user?.id || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingLecture, setEditingLecture] = useState(null);
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState(null);
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
    const [materials, setMaterials] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState({ text: "", type: "" });

    // Fetch courses from API
    const { data: coursesData } = useGetAllCoursesQuery();
    const courses = (coursesData?.data || []).filter(
      (course) =>
        String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
        String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId,
    );

    useEffect(() => {
        if (selectedCourse) {
            dispatch(getLecturesByCourse({ courseId: selectedCourse, page: currentPage }));
        }
    }, [dispatch, selectedCourse, currentPage]);

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

        const lectureData = {
            ...formData,
            courseId: selectedCourse,
            conductedBy: user?._id || user?.id,
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

    const filteredLectures = lectures.filter((lecture) =>
        lecture.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const colors = {
            scheduled: "bg-blue-100 text-blue-800",
            ongoing: "bg-purple-100 text-purple-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <AdminLayout showSearch={false} className="p-0">
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-charcoal dark:to-deep-charcoal min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Manage Lectures
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Conduct lectures, upload materials, and manage schedules
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Course Select */}
                    <select
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.title}
                            </option>
                        ))}
                    </select>

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

                    {/* Add Button */}
                    {selectedCourse && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            <Plus className="w-5 h-5" />
                            Schedule Lecture
                        </button>
                    )}
                </div>
            </div>

            {/* Lectures List */}
            {!selectedCourse ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                        Select a course to view and manage lectures
                    </p>
                </div>
            ) : loading ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">Loading lectures...</p>
                </div>
            ) : filteredLectures.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">No lectures found</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {filteredLectures.map((lecture) => (
                            <div
                                key={lecture._id}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {lecture.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {lecture.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Date</span>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {new Date(lecture.lectureDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Time</span>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {lecture.startTime} - {lecture.endTime}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Type</span>
                                                <p className="font-medium text-slate-900 dark:text-white capitalize">
                                                    {lecture.type}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Status</span>
                                                <p className={`font-medium inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusBadge(lecture.status)}`}>
                                                    {lecture.status}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Display Uploaded Materials if any */}
                                        {lecture.materials && lecture.materials.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1 mb-2">
                                                    <FileUp className="w-3 h-3" /> Attached Materials:
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {lecture.materials.map((mat, i) => (
                                                        <a 
                                                            key={i} 
                                                            href={mat.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs px-2 py-1.5 rounded-md transition border border-slate-200 dark:border-slate-600 max-w-full"
                                                            title={mat.name}
                                                        >
                                                            <span className="truncate max-w-[150px] sm:max-w-[200px]">{mat.name}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 md:flex-col">
                                        <button
                                            onClick={() => {
                                                setSelectedLecture(lecture);
                                                setMaterials(Array.isArray(lecture.materials) ? lecture.materials : []);
                                                setShowMaterialsModal(true);
                                            }}
                                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm transition"
                                        >
                                            <FileUp className="w-4 h-4" />
                                            Materials
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(lecture)}
                                            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 px-3 py-2 rounded-lg text-sm transition"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => dispatch(deleteLecture(lecture._id))}
                                            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 px-3 py-2 rounded-lg text-sm transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredLectures.length > 0 && (
                        <div className="mt-8 flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Page {currentPage} of {pagination?.pages || 1}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={currentPage >= (pagination?.pages || 1)}
                                    className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal - Schedule/Edit Lecture */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-slate-100 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingLecture ? "Edit" : "Schedule"} Lecture
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                X
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
                                        Type
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
                                    {editingLecture ? "Update" : "Schedule"} Lecture
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

            {/* Modal - Materials */}
            {showMaterialsModal && selectedLecture && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-slate-100 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Lecture Materials
                            </h2>
                            <button
                                onClick={() => {
                                    setShowMaterialsModal(false);
                                    setUploadMessage({text: "", type: ""});
                                }}
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                X
                            </button>
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                                {selectedLecture.title}
                            </h3>

                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 mb-6 text-center">
                                <FileUp className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    Materials attached to this lecture
                                </p>

                                {uploadMessage.text && (
                                    <div className={`mb-4 p-3 rounded text-sm ${uploadMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {uploadMessage.text}
                                    </div>
                                )}

                                <label className={`inline-block px-4 py-2 rounded-lg transition ${isUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-600 cursor-pointer dark:bg-blue-900 dark:text-blue-300'}`}>
                                    {isUploading ? "Uploading... Please wait" : "Upload Material"}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        disabled={isUploading}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            setIsUploading(true);
                                            setUploadMessage({ text: "Uploading file... This may take a moment based on file size.", type: "info" });
                                            
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            // Handle populated objects safely
                                            const courseIdValue = selectedLecture.courseId?._id || selectedLecture.courseId || selectedCourse;
                                            formData.append("course_id", courseIdValue);
                                            formData.append("title", file.name);
                                            formData.append("type", file.type.includes("video") ? "video" : "document");
                                            
                                            try {
                                                const storedUser = JSON.parse(sessionStorage.getItem("authUser") || "{}");
                                                const token = storedUser?.accessToken || document.cookie.split("token=")[1]?.split(";")[0];
                                                
                                                const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
                                                const res = await fetch(`${baseUrl}/Material/upload`, {
                                                    method: "POST",
                                                    headers: { Authorization: `Bearer ${token}` },
                                                    body: formData
                                                });
                                                
                                                if (res.ok) {
                                                    const resultData = await res.json();
                                                    // Now attach this material to the lecture
                                                    const attachRes = await fetch(`${baseUrl}/Lecture/${selectedLecture._id}/materials`, {
                                                        method: "POST",
                                                        headers: { 
                                                            "Content-Type": "application/json",
                                                            Authorization: `Bearer ${token}` 
                                                        },
                                                        body: JSON.stringify({
                                                            name: file.name,
                                                            url: resultData.data.file_url,
                                                            type: resultData.data.type === "video" ? "video" : "doc"
                                                        })
                                                    });
                                                    
                                                    if (attachRes.ok) {
                                                        const attachData = await attachRes.json();
                                                        setUploadMessage({ text: "Uploaded and attached successfully!", type: "success" });
                                                        setMaterials(attachData.data?.materials || [...materials, { name: file.name, url: resultData.data.file_url }]);
                                                        // Refresh lecture list so new materials appear in the background card
                                                        if (selectedCourse) {
                                                            dispatch(getLecturesByCourse({ courseId: selectedCourse, page: currentPage }));
                                                        }
                                                    } else {
                                                        const attErr = await attachRes.json().catch(() => ({}));
                                                        setUploadMessage({ text: "Uploaded to course, but failed to attach to lecture. " + (attErr.message || ''), type: "error" });
                                                    }
                                                } else {
                                                    const errData = await res.json().catch(() => ({}));
                                                    setUploadMessage({ 
                                                        text: "Upload failed: " + (errData.message || res.statusText) + (errData.error ? " Details: " + errData.error : ""), 
                                                        type: "error" 
                                                    });
                                                }
                                            } catch (error) {
                                                setUploadMessage({ text: "Upload failed: " + error.message, type: "error" });
                                            } finally {
                                                setIsUploading(false);
                                                e.target.value = null; // reset input so same file can be clicked again
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Materials List */}
                            <div className="space-y-2">
                                {materials.length === 0 && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        No materials uploaded yet.
                                    </p>
                                )}
                                {materials.map((material, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileUp className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {material.name || material.title || "Material"}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {material.type || "file"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => {
                                    setShowMaterialsModal(false);
                                    setUploadMessage({text: "", type: ""});
                                }}
                                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                                Done
                            </button>
                        </div>
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

export default TeacherLectureManagement;




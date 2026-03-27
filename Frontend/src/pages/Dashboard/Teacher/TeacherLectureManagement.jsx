import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    CalendarClock,
    CheckCircle2,
    Clock3,
    Edit,
    FileUp,
    Plus,
    Search,
    Trash2,
    Video,
    X,
} from "lucide-react";
import { getLecturesByCourse, createLecture, updateLecture, deleteLecture } from "../../../redux/Apis/lectureApi";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/Tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/table";

const PANEL_CLASS =
    "rounded-2xl border border-studprimary/15 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm";
const INPUT_CLASS =
    "w-full rounded-lg border border-studprimary/15 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-studprimary/40 focus:ring-2 focus:ring-studprimary/20 dark:border-white/10 dark:bg-deep-charcoal dark:text-white/80 dark:focus:border-premium-gold/45 dark:focus:ring-premium-gold/20";
const BADGE_HOVER_CLASS = "border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm";

const DEFAULT_FORM_DATA = {
    title: "",
    description: "",
    lectureDate: "",
    startTime: "",
    endTime: "",
    room: "",
    type: "theory",
    videoUrl: "",
};

const getStatusBadgeClass = (status) => {
    const normalized = String(status || "scheduled").toLowerCase();
    if (normalized === "completed") {
        return `${BADGE_HOVER_CLASS} border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25`;
    }
    if (normalized === "ongoing") {
        return `${BADGE_HOVER_CLASS} border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25`;
    }
    if (normalized === "cancelled") {
        return `${BADGE_HOVER_CLASS} border-red-200 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25`;
    }
    return `${BADGE_HOVER_CLASS} border-studprimary/25 bg-lavender-light text-studprimary hover:bg-lavender dark:border-premium-gold/35 dark:bg-premium-gold/15 dark:text-premium-gold dark:hover:bg-premium-gold/25`;
};

const getClassroomBadgeClass = (classroomLabel) => {
    if (String(classroomLabel).toLowerCase() === "virtual") {
        return `${BADGE_HOVER_CLASS} border-studprimary/25 bg-lavender-light text-superadminprimary hover:bg-lavender dark:border-premium-gold/35 dark:bg-premium-gold/15 dark:text-premium-gold dark:hover:bg-premium-gold/25`;
    }
    return `${BADGE_HOVER_CLASS} border-slate-200 bg-slate-100 text-superadminprimary hover:bg-slate-200 dark:border-white/20 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20`;
};

const getClassroomLabel = (lecture) => {
    if (lecture?.room) return lecture.room;
    if (lecture?.videoUrl) return "Virtual";
    return "TBD";
};

const isUpcomingLecture = (lecture) => {
    if (!lecture?.lectureDate) return true;
    const lectureDate = new Date(lecture.lectureDate);
    const today = new Date();
    lectureDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return lectureDate >= today;
};

const LectureFormModal = ({
    showModal,
    editingLecture,
    formData,
    handleInputChange,
    handleSubmit,
    handleCloseModal,
    loading,
}) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-auto rounded-2xl border border-studprimary/20 bg-white shadow-2xl dark:border-white/10 dark:bg-navy-charcoal max-h-[92vh]">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-studprimary/10 bg-white/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-navy-charcoal/95">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingLecture ? "Edit" : "Schedule"} Lecture</h2>
                    <button
                        onClick={handleCloseModal}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="Close modal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Lecture Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Type</label>
                            <select name="type" value={formData.type} onChange={handleInputChange} className={INPUT_CLASS}>
                                <option value="theory">Theory</option>
                                <option value="practical">Practical</option>
                                <option value="lab">Lab</option>
                                <option value="tutorial">Tutorial</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Date *</label>
                            <input
                                type="date"
                                name="lectureDate"
                                value={formData.lectureDate}
                                onChange={handleInputChange}
                                required
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Room / Mode</label>
                            <input
                                type="text"
                                name="room"
                                value={formData.room}
                                onChange={handleInputChange}
                                placeholder="e.g., Room 302 or Virtual"
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Start Time *</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                required
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">End Time *</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                required
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Video URL</label>
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleInputChange}
                                placeholder="https://..."
                                className={INPUT_CLASS}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-studprimary/10 pt-4 sm:flex-row">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-studprimary text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                        >
                            {editingLecture ? "Update" : "Schedule"} Lecture
                        </Button>
                        <Button type="button" onClick={handleCloseModal} variant="outline" className="flex-1 border-studprimary/20">
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MaterialsModal = ({
    showMaterialsModal,
    selectedLecture,
    setShowMaterialsModal,
    uploadMessage,
    isUploading,
    materials,
    setUploadMessage,
    onUploadFile,
}) => {
    if (!showMaterialsModal || !selectedLecture) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-auto rounded-2xl border border-studprimary/20 bg-white shadow-2xl dark:border-white/10 dark:bg-navy-charcoal max-h-[92vh]">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-studprimary/10 bg-white/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-navy-charcoal/95">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lecture Materials</h2>
                    <button
                        onClick={() => {
                            setShowMaterialsModal(false);
                            setUploadMessage({ text: "", type: "" });
                        }}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="Close materials modal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-5 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedLecture.title}</h3>

                    <div className="rounded-xl border-2 border-dashed border-studprimary/25 bg-background-light p-6 text-center dark:border-premium-gold/30 dark:bg-white/5">
                        <FileUp className="mx-auto mb-2 h-10 w-10 text-studprimary dark:text-premium-gold" />
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Materials attached to this lecture</p>

                        {uploadMessage.text ? (
                            <div
                                className={`mb-4 rounded-lg p-3 text-sm ${
                                    uploadMessage.type === "error"
                                        ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                }`}
                            >
                                {uploadMessage.text}
                            </div>
                        ) : null}

                        <label
                            className={`inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                isUploading
                                    ? "cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700"
                                    : "bg-studprimary text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                            }`}
                        >
                            {isUploading ? "Uploading..." : "Upload Material"}
                            <input type="file" className="hidden" disabled={isUploading} onChange={onUploadFile} />
                        </label>
                    </div>

                    <div className="space-y-2">
                        {materials.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No materials uploaded yet.</p>
                        ) : (
                            materials.map((material, idx) => (
                                <a
                                    key={`${material?.url || material?.name || "material"}-${idx}`}
                                    href={material?.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between rounded-lg border border-studprimary/10 bg-background-light px-3 py-2.5 text-sm transition hover:border-studprimary/25 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                                >
                                    <span className="truncate pr-2 text-slate-700 dark:text-slate-200">{material?.name || material?.title || "Material"}</span>
                                    <Badge className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">{material?.type || "file"}</Badge>
                                </a>
                            ))
                        )}
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            setShowMaterialsModal(false);
                            setUploadMessage({ text: "", type: "" });
                        }}
                        className="w-full bg-studprimary text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
};

const TeacherLectureManagement = () => {
    const dispatch = useDispatch();
    const { lectures, loading, error, pagination } = useSelector((state) => state.lecture);
    const { user } = useSelector((state) => state.auth || {});
    const teacherId = String(user?._id || user?.id || "");

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [timeTab, setTimeTab] = useState("upcoming");
    const [showModal, setShowModal] = useState(false);
    const [editingLecture, setEditingLecture] = useState(null);
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [materials, setMaterials] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState({ text: "", type: "" });

    const { data: coursesData } = useGetAllCoursesQuery();
    const courses = useMemo(
        () =>
            (coursesData?.data || []).filter(
                (course) =>
                    String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
                    String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
            ),
        [coursesData?.data, teacherId]
    );

    useEffect(() => {
        if (selectedCourse) {
            dispatch(getLecturesByCourse({ courseId: selectedCourse, page: currentPage }));
        }
    }, [dispatch, selectedCourse, currentPage]);

    const refreshLectures = () => {
        if (selectedCourse) {
            dispatch(getLecturesByCourse({ courseId: selectedCourse, page: currentPage }));
        }
    };

    const statusOptions = useMemo(
        () => ["all", ...new Set((lectures || []).map((lecture) => String(lecture?.status || "scheduled").toLowerCase()))],
        [lectures]
    );

    const typeOptions = useMemo(
        () => ["all", ...new Set((lectures || []).map((lecture) => String(lecture?.type || "theory").toLowerCase()))],
        [lectures]
    );

    const filteredLectures = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return (lectures || []).filter((lecture) => {
            const status = String(lecture?.status || "scheduled").toLowerCase();
            const type = String(lecture?.type || "theory").toLowerCase();
            const textBlob = `${lecture?.title || ""} ${lecture?.description || ""} ${lecture?.room || ""}`.toLowerCase();

            const statusMatch = statusFilter === "all" ? true : status === statusFilter;
            const typeMatch = typeFilter === "all" ? true : type === typeFilter;
            const queryMatch = query ? textBlob.includes(query) : true;
            const timeMatch = timeTab === "all" ? true : timeTab === "upcoming" ? isUpcomingLecture(lecture) : !isUpcomingLecture(lecture);

            return statusMatch && typeMatch && queryMatch && timeMatch;
        });
    }, [lectures, searchQuery, statusFilter, typeFilter, timeTab]);

    const stats = useMemo(() => {
        const total = lectures?.length || 0;
        const completed = (lectures || []).filter((item) => String(item?.status || "").toLowerCase() === "completed").length;
        const upcoming = (lectures || []).filter((item) => isUpcomingLecture(item)).length;

        return { total, completed, upcoming };
    }, [lectures]);

    const totalPages = Math.max(pagination?.pages || 1, 1);
    const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

    const handleOpenModal = (lecture = null) => {
        if (lecture) {
            setEditingLecture(lecture);
            setFormData({
                title: lecture?.title || "",
                description: lecture?.description || "",
                lectureDate: lecture?.lectureDate?.split("T")[0] || "",
                startTime: lecture?.startTime || "",
                endTime: lecture?.endTime || "",
                room: lecture?.room || "",
                type: lecture?.type || "theory",
                videoUrl: lecture?.videoUrl || "",
            });
        } else {
            setEditingLecture(null);
            setFormData(DEFAULT_FORM_DATA);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingLecture(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const lectureData = {
            ...formData,
            courseId: selectedCourse,
            conductedBy: user?._id || user?.id,
        };

        try {
            if (editingLecture?._id) {
                await dispatch(updateLecture({ id: editingLecture._id, data: formData })).unwrap();
            } else {
                await dispatch(createLecture(lectureData)).unwrap();
            }
            handleCloseModal();
            refreshLectures();
        } catch {
            // Existing redux error flow handles surface state.
        }
    };

    const handleDeleteLecture = async (lectureId) => {
        if (!lectureId) return;
        const confirmed = window.confirm("Delete this lecture?");
        if (!confirmed) return;

        try {
            await dispatch(deleteLecture(lectureId)).unwrap();
            refreshLectures();
        } catch {
            // Existing redux error flow handles surface state.
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUploadFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !selectedLecture?._id) return;

        setIsUploading(true);
        setUploadMessage({ text: "Uploading file...", type: "info" });

        const payload = new FormData();
        payload.append("file", file);
        const courseIdValue = selectedLecture?.courseId?._id || selectedLecture?.courseId || selectedCourse;
        payload.append("course_id", courseIdValue);
        payload.append("title", file.name);
        payload.append("type", file.type.includes("video") ? "video" : "document");

        try {
            const storedUser = JSON.parse(sessionStorage.getItem("authUser") || "{}");
            const token = storedUser?.accessToken || document.cookie.split("token=")[1]?.split(";")[0];
            const baseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

            const uploadResponse = await fetch(`${baseUrl}/Material/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: payload,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                setUploadMessage({ text: `Upload failed: ${errorData.message || uploadResponse.statusText}`, type: "error" });
                return;
            }

            const resultData = await uploadResponse.json();

            const attachResponse = await fetch(`${baseUrl}/Lecture/${selectedLecture._id}/materials`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: file.name,
                    url: resultData?.data?.file_url,
                    type: resultData?.data?.type === "video" ? "video" : "doc",
                }),
            });

            if (!attachResponse.ok) {
                const attachError = await attachResponse.json().catch(() => ({}));
                setUploadMessage({ text: `Uploaded, but attach failed: ${attachError.message || "Unknown error"}`, type: "error" });
                return;
            }

            const attachData = await attachResponse.json();
            setUploadMessage({ text: "Uploaded and attached successfully!", type: "success" });
            setMaterials(attachData?.data?.materials || []);
            refreshLectures();
        } catch (uploadError) {
            setUploadMessage({ text: `Upload failed: ${uploadError.message}`, type: "error" });
        } finally {
            setIsUploading(false);
            event.target.value = null;
        }
    };

    return (
        <AdminLayout showSearch={false} className="p-0">
            <div className="min-h-screen bg-background-light p-4 dark:bg-transparent sm:p-6 lg:p-8">
                <section className="mb-5 rounded-2xl border border-studprimary/12 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Lecture Management</h1>
                            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                                Schedule, edit, and monitor academic sessions across your courses.
                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={() => handleOpenModal()}
                            disabled={!selectedCourse}
                            className="bg-studprimary text-white hover:bg-studprimary/90 disabled:opacity-50 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule New Lecture
                        </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto_auto]">
                        <select
                            value={selectedCourse}
                            onChange={(event) => {
                                setSelectedCourse(event.target.value);
                                setCurrentPage(1);
                            }}
                            className={INPUT_CLASS}
                        >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                                <option key={course._id || course.id} value={course._id || course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>

                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search lectures..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className={`${INPUT_CLASS} pl-9`}
                            />
                        </div>

                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={INPUT_CLASS}>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status === "all" ? "All Status" : status[0].toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>

                        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={INPUT_CLASS}>
                            {typeOptions.map((type) => (
                                <option key={type} value={type}>
                                    {type === "all" ? "All Types" : type[0].toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <Tabs value={timeTab} onValueChange={setTimeTab}>
                            <TabsList className="h-auto rounded-xl bg-lavender-light p-1 dark:bg-premium-gold/10">
                                <TabsTrigger value="upcoming" className="text-xs font-bold uppercase tracking-wide data-[state=active]:bg-studprimary data-[state=active]:text-white dark:data-[state=active]:bg-premium-gold dark:data-[state=active]:text-deep-charcoal">
                                    Upcoming
                                </TabsTrigger>
                                <TabsTrigger value="past" className="text-xs font-bold uppercase tracking-wide data-[state=active]:bg-studprimary data-[state=active]:text-white dark:data-[state=active]:bg-premium-gold dark:data-[state=active]:text-deep-charcoal">
                                    Past
                                </TabsTrigger>
                                <TabsTrigger value="all" className="text-xs font-bold uppercase tracking-wide data-[state=active]:bg-studprimary data-[state=active]:text-white dark:data-[state=active]:bg-premium-gold dark:data-[state=active]:text-deep-charcoal">
                                    All
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </section>

                <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                    <div className="space-y-4 xl:col-span-9">
                        {!selectedCourse ? (
                            <Card className={PANEL_CLASS}>
                                <CardContent className="py-14 text-center">
                                    <CalendarClock className="mx-auto h-10 w-10 text-studprimary dark:text-premium-gold" />
                                    <p className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Select a course to manage lectures</p>
                                </CardContent>
                            </Card>
                        ) : loading ? (
                            <Card className={PANEL_CLASS}>
                                <CardContent className="py-14 text-center text-slate-500 dark:text-slate-300">Loading lectures...</CardContent>
                            </Card>
                        ) : filteredLectures.length === 0 ? (
                            <Card className={PANEL_CLASS}>
                                <CardContent className="py-14 text-center">
                                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No lectures found</p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing filters or schedule a new lecture.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className={PANEL_CLASS}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-black text-slate-900 dark:text-white">Lecture Schedule</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Lecture</TableHead>
                                                <TableHead>Date &amp; Time</TableHead>
                                                <TableHead>Classroom</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLectures.map((lecture) => {
                                                const classroomLabel = getClassroomLabel(lecture);
                                                return (
                                                <TableRow key={lecture._id}>
                                                    <TableCell>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{lecture.title}</p>
                                                        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{lecture.description || "No description"}</p>
                                                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 capitalize">Type: {lecture.type || "theory"}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium text-slate-800 dark:text-slate-100">
                                                            {lecture.lectureDate ? new Date(lecture.lectureDate).toLocaleDateString() : "TBD"}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {lecture.startTime || "--:--"} - {lecture.endTime || "--:--"}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge  variant="outline" className={getClassroomBadgeClass(classroomLabel)}>{classroomLabel}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${getStatusBadgeClass(lecture.status)} capitalize`}>{lecture.status || "scheduled"}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedLecture(lecture);
                                                                    setMaterials(Array.isArray(lecture.materials) ? lecture.materials : []);
                                                                    setShowMaterialsModal(true);
                                                                }}
                                                                className="h-8 border-studprimary/20 px-2"
                                                                title="Materials"
                                                            >
                                                                <FileUp className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenModal(lecture)}
                                                                className="h-8 border-studprimary/20 px-2"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteLecture(lecture._id)}
                                                                className="h-8 border-red-300 px-2 text-red-600 hover:bg-red-50 dark:border-red-500/35 dark:text-red-300 dark:hover:bg-red-500/10"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        </TableBody>
                                    </Table>

                                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-studprimary/15 bg-background-light px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                        <span className="text-sm font-semibold text-studprimary dark:text-premium-gold">Page {currentPage} of {totalPages}</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="h-8 border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/30 dark:text-premium-gold dark:hover:bg-premium-gold/10"
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {pageNumbers.map((page) => (
                                                    <button
                                                        key={page}
                                                        type="button"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`h-8 w-8 rounded-md text-xs font-bold transition ${
                                                            page === currentPage
                                                                ? "bg-studprimary text-white dark:bg-premium-gold dark:text-deep-charcoal"
                                                                : "border border-studprimary/20 bg-white text-slate-700 hover:bg-lavender-light dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={currentPage >= totalPages}
                                                className="h-8 border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/30 dark:text-premium-gold dark:hover:bg-premium-gold/10"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4 xl:col-span-3">
                        <Card className={PANEL_CLASS}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Lectures</p>
                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Upcoming</p>
                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.upcoming}</p>
                                </div>
                                <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Completed</p>
                                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.completed}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={PANEL_CLASS}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    type="button"
                                    onClick={() => handleOpenModal()}
                                    disabled={!selectedCourse}
                                    className="w-full justify-start bg-studprimary text-white hover:bg-studprimary/90 disabled:opacity-50 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Schedule Session
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setTimeTab("upcoming")}
                                    className="w-full justify-start border-studprimary/20"
                                >
                                    <Clock3 className="mr-2 h-4 w-4" />
                                    View Upcoming
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setTypeFilter("theory")}
                                    className="w-full justify-start border-studprimary/20"
                                >
                                    <Video className="mr-2 h-4 w-4" />
                                    Theory Sessions
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <LectureFormModal
                    showModal={showModal}
                    editingLecture={editingLecture}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    handleCloseModal={handleCloseModal}
                    loading={loading}
                />

                <MaterialsModal
                    showMaterialsModal={showMaterialsModal}
                    selectedLecture={selectedLecture}
                    setShowMaterialsModal={setShowMaterialsModal}
                    uploadMessage={uploadMessage}
                    isUploading={isUploading}
                    materials={materials}
                    setUploadMessage={setUploadMessage}
                    onUploadFile={handleUploadFile}
                />

                {error ? (
                    <div className="fixed bottom-4 right-4 rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
                        {error}
                    </div>
                ) : null}
            </div>
        </AdminLayout>
    );
};

export default TeacherLectureManagement;




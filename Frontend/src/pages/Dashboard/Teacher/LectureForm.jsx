import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import AdminLayout from "../../../utils/Adminlayoute";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { Badge } from "../../../components/Badge";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import {
  createLecture,
  getLecturesByCourse,
  updateLecture,
} from "../../../redux/Apis/lectureApi";

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

const TYPE_OPTIONS = ["theory", "practical", "lab", "tutorial"];
const PAGE_SHELL_CLASS =
  "min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(77,95,218,0.12),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(180,140,76,0.12),_transparent_48%),linear-gradient(180deg,#f7f9ff,#f2f5fb)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(176,141,87,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(77,95,218,0.18),_transparent_45%),linear-gradient(180deg,#0f1424,#0c1020)]";
const PANEL_CLASS =
  "rounded-2xl border border-studprimary/15 bg-white/90 backdrop-blur-sm shadow-sm dark:border-premium-gold/25 dark:bg-white/5";
const LABEL_CLASS =
  "mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300";
const INPUT_BASE_CLASS =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500";

const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const validateForm = (formData, selectedCourse) => {
  const errors = {};

  if (!selectedCourse) errors.courseId = "Please select a course.";
  if (!String(formData.title || "").trim()) errors.title = "Lecture title is required.";
  if (!formData.lectureDate) errors.lectureDate = "Lecture date is required.";
  if (!formData.startTime) errors.startTime = "Start time is required.";
  if (!formData.endTime) errors.endTime = "End time is required.";

  if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
    errors.endTime = "End time must be after start time.";
  }

  if (!isValidUrl(String(formData.videoUrl || "").trim())) {
    errors.videoUrl = "Please enter a valid URL (http or https).";
  }

  return errors;
};

const LectureForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const initialCourse = searchParams.get("course") || "";

  const { user } = useSelector((state) => state.auth || {});
  const { lectures, loading } = useSelector((state) => state.lecture || {});

  const { data: coursesData } = useGetAllCoursesQuery();
  const teacherId = String(user?._id || user?.id || "");

  const courses = useMemo(
    () =>
      (coursesData?.data || []).filter(
        (course) =>
          String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
          String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
      ),
    [coursesData?.data, teacherId]
  );

  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const lectureFromState = location?.state?.lecture || null;
  const editingLecture = useMemo(() => {
    if (!editId) return null;
    if (lectureFromState?._id === editId) return lectureFromState;
    return (lectures || []).find((lecture) => String(lecture?._id || "") === String(editId)) || null;
  }, [editId, lectureFromState, lectures]);

  useEffect(() => {
    if (editId && selectedCourse && !editingLecture) {
      dispatch(getLecturesByCourse({ courseId: selectedCourse, page: 1, limit: 100 }));
    }
  }, [dispatch, editId, selectedCourse, editingLecture]);

  useEffect(() => {
    if (!editId) return;
    if (!editingLecture) return;

    setFormData({
      title: editingLecture?.title || "",
      description: editingLecture?.description || "",
      lectureDate: editingLecture?.lectureDate?.split("T")[0] || "",
      startTime: editingLecture?.startTime || "",
      endTime: editingLecture?.endTime || "",
      room: editingLecture?.room || "",
      type: editingLecture?.type || "theory",
      videoUrl: editingLecture?.videoUrl || "",
    });

    if (!selectedCourse) {
      const courseFromLecture =
        editingLecture?.courseId?._id || editingLecture?.courseId || initialCourse;
      if (courseFromLecture) {
        setSelectedCourse(String(courseFromLecture));
      }
    }
  }, [editId, editingLecture, initialCourse, selectedCourse]);

  const completionStats = useMemo(() => {
    const checks = [
      Boolean(selectedCourse),
      Boolean(String(formData.title).trim()),
      Boolean(formData.lectureDate),
      Boolean(formData.startTime),
      Boolean(formData.endTime),
      !String(formData.videoUrl || "").trim() || isValidUrl(String(formData.videoUrl || "").trim()),
    ];

    const completed = checks.filter(Boolean).length;
    const total = checks.length;
    return {
      completed,
      total,
      progressPercent: Math.round((completed / total) * 100),
    };
  }, [formData, selectedCourse]);

  const getInputClass = (fieldError) =>
    `${INPUT_BASE_CLASS} ${
      fieldError
        ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20"
        : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
    }`;

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", endTime: name === "startTime" ? "" : prev.endTime }));
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(formData, selectedCourse);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    try {
      if (editId) {
        await dispatch(updateLecture({ id: editId, data: formData })).unwrap();
        window.alert("Lecture updated successfully!");
      } else {
        const payload = {
          ...formData,
          courseId: selectedCourse,
          conductedBy: user?._id || user?.id,
        };
        await dispatch(createLecture(payload)).unwrap();
        window.alert("Lecture scheduled successfully!");
      }

      navigate("/teacher/lectures");
    } catch (error) {
      setSubmitError(error?.message || "Unable to save lecture.");
    }
  };

  const handleReset = () => {
    if (editId && editingLecture) {
      setFormData({
        title: editingLecture?.title || "",
        description: editingLecture?.description || "",
        lectureDate: editingLecture?.lectureDate?.split("T")[0] || "",
        startTime: editingLecture?.startTime || "",
        endTime: editingLecture?.endTime || "",
        room: editingLecture?.room || "",
        type: editingLecture?.type || "theory",
        videoUrl: editingLecture?.videoUrl || "",
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
    setErrors({});
    setSubmitError("");
  };

  return (
    <AdminLayout showSearch={false} className="p-3 md:p-6">
      <div className={`dark:bg-deep-charcoal`}>
        <div className="mx-auto max-w-7xl space-y-5 px-1 pb-8 pt-2 sm:px-2">
          <Card className={`${PANEL_CLASS} overflow-hidden border-studprimary/20 py-0`}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(77,95,218,0.2),_transparent_50%),linear-gradient(120deg,rgba(120,126,255,0.08),rgba(180,140,76,0.08))]" />
              <CardContent className="relative z-10 p-5 sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-studprimary dark:text-premium-gold">
                      Teacher Workspace
                    </p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      {editId ? "Edit Lecture" : "Schedule Lecture"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Plan and schedule sessions with the same structured experience as Create Course.
                    </p>
                  </div>

                  <div className="min-w-[220px] rounded-xl border border-studprimary/20 bg-white/80 px-4 py-3 dark:border-premium-gold/25 dark:bg-white/5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Form Completion
                    </p>
                    <div className="mt-2 h-2.5 rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-studprimary to-superadminprimary dark:from-premium-gold dark:to-premium-gold/70 transition-all duration-300"
                        style={{ width: `${completionStats.progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {completionStats.completed}/{completionStats.total} sections ready
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="space-y-5 xl:col-span-8">
                <Card className={PANEL_CLASS}>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      Lecture Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={LABEL_CLASS}>Course *</label>
                        <select
                          value={selectedCourse}
                          onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setErrors((prev) => ({ ...prev, courseId: "" }));
                          }}
                          className={getInputClass(errors.courseId)}
                        >
                          <option value="">Select Course</option>
                          {courses.map((course) => (
                            <option key={course._id || course.id} value={course._id || course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                        {errors.courseId ? (
                          <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.courseId}</p>
                        ) : null}
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => handleFieldChange("type", e.target.value)}
                          className={getInputClass("")}
                        >
                          {TYPE_OPTIONS.map((type) => (
                            <option key={type} value={type}>
                              {type[0].toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Lecture Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        className={getInputClass(errors.title)}
                        placeholder="e.g., Introduction to Variables"
                      />
                      {errors.title ? (
                        <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.title}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Description</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        className={getInputClass("")}
                        placeholder="Write a short overview of this lecture."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className={PANEL_CLASS}>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      Schedule and Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className={LABEL_CLASS}>Date *</label>
                        <input
                          type="date"
                          value={formData.lectureDate}
                          onChange={(e) => handleFieldChange("lectureDate", e.target.value)}
                          className={getInputClass(errors.lectureDate)}
                        />
                        {errors.lectureDate ? (
                          <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.lectureDate}</p>
                        ) : null}
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Start Time *</label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => handleFieldChange("startTime", e.target.value)}
                          className={getInputClass(errors.startTime)}
                        />
                        {errors.startTime ? (
                          <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.startTime}</p>
                        ) : null}
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>End Time *</label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => handleFieldChange("endTime", e.target.value)}
                          className={getInputClass(errors.endTime)}
                        />
                        {errors.endTime ? (
                          <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.endTime}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={LABEL_CLASS}>Room / Mode</label>
                        <input
                          type="text"
                          value={formData.room}
                          onChange={(e) => handleFieldChange("room", e.target.value)}
                          className={getInputClass("")}
                          placeholder="e.g., Room 302 or Virtual"
                        />
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Video URL</label>
                        <input
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) => handleFieldChange("videoUrl", e.target.value)}
                          className={getInputClass(errors.videoUrl)}
                          placeholder="https://meet.example.com/..."
                        />
                        {errors.videoUrl ? (
                          <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.videoUrl}</p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-4">
                <div className="sticky top-4 space-y-4">
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                        Session Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-5">
                      <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mode</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                          {editId ? "Update Existing Lecture" : "Schedule New Lecture"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Selected Course</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                          {courses.find((c) => String(c._id || c.id) === String(selectedCourse))?.title || "Not selected"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Time Slot</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                          {formData.startTime && formData.endTime
                            ? `${formData.startTime} - ${formData.endTime}`
                            : "Not set"}
                        </p>
                      </div>

                      {submitError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="mt-0.5 h-4 w-4" />
                            <span>{submitError}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4" />
                            <span>Schedule is ready for submission.</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={PANEL_CLASS}>
                    <CardContent className="space-y-3 py-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full rounded-xl bg-studprimary text-sm font-bold text-white hover:bg-studprimary/90 disabled:opacity-60 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <Save className="mr-1.5 h-4 w-4" />
                            {editId ? "Update Lecture" : "Schedule Lecture"}
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={handleReset}
                        variant="outline"
                        className="h-11 w-full rounded-xl border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/35 dark:text-premium-gold dark:hover:bg-premium-gold/10"
                      >
                        <RotateCcw className="mr-1.5 h-4 w-4" />
                        {editId ? "Reset Changes" : "Clear Form"}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => navigate("/teacher/lectures")}
                        variant="outline"
                        className="h-11 w-full rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        <CalendarClock className="mr-1.5 h-4 w-4" />
                        Back to Lectures
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>

          {editId && !editingLecture && !loading ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Could not preload lecture details. Please go back and open edit from the lecture list.
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
};

export default LectureForm;

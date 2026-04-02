import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Image,
  Layers3,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tag,
  Tags,
  Trash2,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";

import AdminLayout from "../../../utils/Adminlayoute";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import {
  useCreateCourseMutation,
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
} from "../../../redux/Apis/courseApi";
import { useGetSubjectsQuery } from "../../../redux";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

const PAGE_SHELL_CLASS =
  "min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(77,95,218,0.10),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(180,140,76,0.12),_transparent_45%),linear-gradient(180deg,#f8faff,#F9FAFB)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(176,141,87,0.16),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(77,95,218,0.16),_transparent_42%),linear-gradient(180deg,#0e1424,#0b1020)]";
const PANEL_CLASS =
  "rounded-2xl border border-studprimary/15 bg-white/92 backdrop-blur-sm shadow-sm dark:border-premium-gold/20 dark:bg-white/5";
const LABEL_CLASS =
  "mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300";
const INPUT_BASE_CLASS =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500";

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "",
  subjectId: "",
  priceUSD: "",
  image: "",
  videoUrl: "",
  tags: "",
  currency: "USD",
  isPaid: true,
  level: "Easy",
  status: "published",
  lessons: [{ videoUrl: "", description: "" }],
};

const CATEGORIES = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Personal Development",
  "Photography",
  "Music",
];

const LEVELS = ["Easy", "Medium", "Hard"];
const CURRENCIES = ["USD", "INR", "EUR"];

const isValidHttpUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeLessons = (course) => {
  if (Array.isArray(course?.lessons) && course.lessons.length > 0) {
    return course.lessons.map((lesson) => ({
      videoUrl: lesson.videoUrl || lesson.video_url || "",
      description: lesson.description || "",
    }));
  }

  const fallback = String(course?.videoUrl || course?.video_url || "").trim();
  if (!fallback) return [{ videoUrl: "", description: "" }];
  return [{ videoUrl: fallback, description: "" }];
};

const getCourseStatus = (course) => {
  if (typeof course?.status === "string" && course.status.trim()) {
    return course.status.toLowerCase();
  }
  if (course?.isPublished === false) return "draft";
  return "published";
};

const getPriceNumber = (course) => Number(course?.priceUSD ?? course?.price ?? course?.pricing ?? 0);

const validateForm = (formData, isEditMode) => {
  const errors = {};

  if (!String(formData.title || "").trim()) errors.title = "Title is required.";
  if (!String(formData.description || "").trim()) errors.description = "Description is required.";
  if (!String(formData.category || "").trim()) errors.category = "Category is required.";

  const price = Number(formData.priceUSD || 0);
  if (Number.isNaN(price) || price < 0) errors.priceUSD = "Price must be a valid non-negative number.";

  if (String(formData.image || "").trim() && !isValidHttpUrl(String(formData.image).trim())) {
    errors.image = "Image URL must start with http:// or https://";
  }

  const lessons = Array.isArray(formData.lessons)
    ? formData.lessons
        .map((lesson) => ({
          videoUrl: String(lesson?.videoUrl || "").trim(),
          description: String(lesson?.description || "").trim(),
        }))
        .filter((lesson) => lesson.videoUrl)
    : [];

  if (lessons.length === 0) {
    errors.lessons = "At least one lesson video URL is required.";
  } else if (lessons.some((lesson) => !isValidHttpUrl(lesson.videoUrl))) {
    errors.lessons = "Each lesson video URL must start with http:// or https://";
  } else if (lessons.some((lesson) => !lesson.description)) {
    errors.lessons = "Each lesson needs a description.";
  }

  if (String(formData.videoUrl || "").trim() && !isValidHttpUrl(String(formData.videoUrl).trim())) {
    errors.videoUrl = "Video URL must start with http:// or https://";
  }

  if (isEditMode && !String(formData.status || "").trim()) {
    errors.status = "Status is required.";
  }

  return errors;
};

const CourseCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const { data: courseResponse, isLoading: isCourseLoading } = useGetCourseByIdQuery(editId, {
    skip: !editId,
  });
  const { data: subjectsResponse } = useGetSubjectsQuery({ status: "active" });

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const subjects = subjectsResponse?.data || [];
  const course = courseResponse?.data?.data || courseResponse?.data || courseResponse;

  useEffect(() => {
    if (!isEditMode || !course) return;

    setFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      subjectId: course.subjectId?._id || course.subjectId || "",
      priceUSD: String(course.priceUSD ?? course.price ?? ""),
      image: course.image || "",
      videoUrl: course.videoUrl || course.video_url || "",
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : "",
      currency: course.currency || "USD",
      isPaid: course.isPaid ?? Number(course.priceUSD || 0) > 0,
      level: course.level || "Easy",
      status: getCourseStatus(course),
      lessons: normalizeLessons(course),
    });
  }, [course, isEditMode]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(String(formData.title).trim()),
      Boolean(String(formData.description).trim()),
      Boolean(String(formData.category).trim()),
      Boolean(String(formData.priceUSD).trim()),
      Boolean(Array.isArray(formData.lessons) && formData.lessons.some((lesson) => String(lesson.videoUrl).trim())),
    ];

    const completed = checks.filter(Boolean).length;
    return {
      completed,
      total: checks.length,
      percent: Math.round((completed / checks.length) * 100),
    };
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleLessonChange = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, [key]: value } : lesson
      ),
    }));
    setErrors((prev) => {
      if (!prev.lessons) return prev;
      const next = { ...prev };
      delete next.lessons;
      return next;
    });
  };

  const addLesson = () => {
    setFormData((prev) => ({
      ...prev,
      lessons: [...prev.lessons, { videoUrl: "", description: "" }],
    }));
  };

  const removeLesson = (index) => {
    setFormData((prev) => {
      if (prev.lessons.length <= 1) return prev;
      return {
        ...prev,
        lessons: prev.lessons.filter((_, lessonIndex) => lessonIndex !== index),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(formData, isEditMode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      ErrorToster("Please fix the highlighted fields", 2500);
      return;
    }

    const normalizedLessons = formData.lessons
      .map((lesson) => ({
        videoUrl: String(lesson.videoUrl || "").trim(),
        description: String(lesson.description || "").trim(),
      }))
      .filter((lesson) => lesson.videoUrl);

    const primaryVideoUrl = normalizedLessons[0]?.videoUrl || String(formData.videoUrl || "").trim();
    const payload = {
      title: String(formData.title).trim(),
      description: String(formData.description).trim(),
      category: String(formData.category).trim(),
      subjectId: formData.subjectId || undefined,
      priceUSD: Number(formData.priceUSD || 0),
      image: String(formData.image || "").trim(),
      videoUrl: primaryVideoUrl,
      video_url: primaryVideoUrl,
      lessons: normalizedLessons,
      tags: String(formData.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      currency: formData.currency,
      isPaid: Boolean(formData.isPaid),
      level: formData.level,
      isPublished: formData.status !== "draft",
      status: formData.status,
    };

    try {
      if (isEditMode) {
        await updateCourse({ id: editId, ...payload }).unwrap();
        SuccessToster("Course updated successfully", 2500);
      } else {
        await createCourse(payload).unwrap();
        SuccessToster("Course created successfully", 2500);
      }
      navigate("/managecourses");
    } catch (error) {
      ErrorToster(error?.data?.message || (isEditMode ? "Failed to update course" : "Failed to create course"), 3000);
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`${PAGE_SHELL_CLASS} min-h-screen p-4 sm:p-6 lg:p-8`}
      >
        <div className="mx-auto max-w-7xl space-y-5">
          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl border border-white/60 bg-lavender-light p-5 shadow-sm dark:border-white/10 dark:bg-navy-charcoal sm:p-6"
          >
            <div className="pointer-events-none absolute -right-14 -top-12 h-40 w-40 rounded-full bg-studprimary/10 blur-3xl dark:bg-premium-gold/10" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
              style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "1.4rem 1.4rem" }}
            />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-studprimary/20 bg-studprimary/10 px-3 py-1 text-xs font-semibold text-studprimary dark:border-premium-gold/20 dark:bg-premium-gold/10 dark:text-premium-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isEditMode ? "Edit Course Workspace" : "Create Course Workspace"}
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {isEditMode ? "Edit Course" : "Create New Course"}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  {isEditMode
                    ? "Update an existing course directly on the page with a smoother editing flow."
                    : "Create a new course directly on the page without a modal, while keeping the management layout intact."}
                </p>
              </div>

              <div className="min-w-[220px] rounded-2xl border border-studprimary/15 bg-white/80 px-4 py-3 dark:border-premium-gold/20 dark:bg-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Form Completion</p>
                <div className="mt-2 h-2.5 rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-studprimary to-superadminprimary transition-all duration-300 dark:from-premium-gold dark:to-premium-gold/70"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {completion.completed}/{completion.total} key sections ready
                </p>
              </div>
            </div>
          </motion.section>

          {isEditMode && isCourseLoading ? (
            <motion.section variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-studprimary dark:border-premium-gold" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">Loading course data...</p>
            </motion.section>
          ) : null}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="space-y-5 xl:col-span-8">
                <motion.div variants={itemVariants}>
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Course Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <div>
                        <label className={LABEL_CLASS}>Title *</label>
                        <div className="relative">
                          <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(event) => handleChange("title", event.target.value)}
                            className={`${INPUT_BASE_CLASS} pl-10 ${errors.title ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            placeholder="Course title"
                          />
                        </div>
                        {errors.title ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.title}</p> : null}
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Description *</label>
                        <div className="relative">
                          <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(event) => handleChange("description", event.target.value)}
                            className={`${INPUT_BASE_CLASS} pl-10 resize-none ${errors.description ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            placeholder="Write a short description of the course."
                          />
                        </div>
                        {errors.description ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.description}</p> : null}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Category *</label>
                          <div className="relative">
                            <Tags className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <select
                              value={formData.category}
                              onChange={(event) => handleChange("category", event.target.value)}
                              className={`${INPUT_BASE_CLASS} pl-10 ${errors.category ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                            >
                              <option value="">Select category</option>
                              {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          </div>
                          {errors.category ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.category}</p> : null}
                        </div>

                        <div>
                          <label className={LABEL_CLASS}>Subject</label>
                          <select
                            value={formData.subjectId}
                            onChange={(event) => handleChange("subjectId", event.target.value)}
                            className={`${INPUT_BASE_CLASS} border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20`}
                          >
                            <option value="">Select subject (optional)</option>
                            {subjects.map((subject) => (
                              <option key={subject._id || subject.id} value={subject._id || subject.id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Pricing & Media</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Price</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.priceUSD}
                            onChange={(event) => handleChange("priceUSD", event.target.value)}
                            className={`${INPUT_BASE_CLASS} border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20 ${errors.priceUSD ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : ""}`}
                            placeholder="0.00"
                          />
                          {errors.priceUSD ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.priceUSD}</p> : null}
                        </div>

                        <div>
                          <label className={LABEL_CLASS}>Currency</label>
                          <select
                            value={formData.currency}
                            onChange={(event) => handleChange("currency", event.target.value)}
                            className="w-full rounded-xl border border-studprimary/20 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 dark:border-premium-gold/30 dark:bg-white/5 dark:text-slate-100"
                          >
                            {CURRENCIES.map((currency) => (
                              <option key={currency} value={currency}>
                                {currency}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Image URL</label>
                          <div className="relative">
                            <Image className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="url"
                              value={formData.image}
                              onChange={(event) => handleChange("image", event.target.value)}
                              className={`${INPUT_BASE_CLASS} pl-10 ${errors.image ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                              placeholder="https://..."
                            />
                          </div>
                          {errors.image ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.image}</p> : null}
                        </div>

                        <div>
                          <label className={LABEL_CLASS}>Video URL</label>
                          <div className="relative">
                            <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="url"
                              value={formData.videoUrl}
                              onChange={(event) => handleChange("videoUrl", event.target.value)}
                              className={`${INPUT_BASE_CLASS} pl-10 ${errors.videoUrl ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20" : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"}`}
                              placeholder="https://..."
                            />
                          </div>
                          {errors.videoUrl ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.videoUrl}</p> : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Content Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className={LABEL_CLASS}>Lessons *</label>
                          <button
                            type="button"
                            onClick={addLesson}
                            className="inline-flex items-center gap-1 rounded-lg bg-studprimary px-3 py-1.5 text-xs font-semibold text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Lesson
                          </button>
                        </div>

                        <div className="space-y-3">
                          {formData.lessons.map((lesson, index) => (
                            <div key={`lesson-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Lesson {index + 1}</p>
                                {formData.lessons.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => removeLesson(index)}
                                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                                    aria-label="Remove lesson"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                ) : null}
                              </div>

                              <input
                                value={lesson.videoUrl}
                                onChange={(event) => handleLessonChange(index, "videoUrl", event.target.value)}
                                placeholder="https://youtube.com/..."
                                className="mb-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-white/10 dark:bg-deep-charcoal dark:text-slate-100 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
                              />
                              <textarea
                                value={lesson.description}
                                onChange={(event) => handleLessonChange(index, "description", event.target.value)}
                                rows={2}
                                placeholder="What this lesson teaches"
                                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-white/10 dark:bg-deep-charcoal dark:text-slate-100 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
                              />
                            </div>
                          ))}
                        </div>
                        {errors.lessons ? <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-300">{errors.lessons}</p> : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Publishing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Level</label>
                          <select
                            value={formData.level}
                            onChange={(event) => handleChange("level", event.target.value)}
                            className="w-full rounded-xl border border-studprimary/20 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 dark:border-premium-gold/30 dark:bg-white/5 dark:text-slate-100"
                          >
                            {LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={LABEL_CLASS}>Status</label>
                          <select
                            value={formData.status}
                            onChange={(event) => handleChange("status", event.target.value)}
                            className={`${INPUT_BASE_CLASS} border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20 ${errors.status ? "border-red-300 bg-red-50/60 dark:border-red-400/45 dark:bg-red-500/10" : ""}`}
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                          {errors.status ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.status}</p> : null}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={LABEL_CLASS}>Tags</label>
                          <div className="relative">
                            <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={formData.tags}
                              onChange={(event) => handleChange("tags", event.target.value)}
                              className="w-full rounded-xl border border-studprimary/20 bg-white px-3.5 py-2.5 pl-10 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:text-slate-100 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
                              placeholder="Popular, Beginner, Design"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={formData.isPaid}
                            onChange={(event) => handleChange("isPaid", event.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-studprimary focus:ring-studprimary dark:border-white/20 dark:text-premium-gold"
                          />
                          Paid course
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="xl:col-span-4">
                <div className="sticky top-4 space-y-4">
                  <motion.div variants={itemVariants}>
                    <Card className={PANEL_CLASS}>
                      <CardHeader className="pb-0">
                        <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                          {isEditMode ? "Update Summary" : "Create Summary"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-5">
                        <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mode</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{isEditMode ? "Edit Existing Course" : "Create New Course"}</p>
                        </div>

                        <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{formData.category || "Not selected"}</p>
                        </div>

                        <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Price</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {String(formData.priceUSD).trim() ? `${formData.currency} ${Number(formData.priceUSD || 0).toFixed(2)}` : "Not set"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Lessons</p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{formData.lessons.length} section(s)</p>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <div className="flex items-start gap-1.5">
                            <BadgeCheck className="mt-0.5 h-4 w-4" />
                            <span>This page sends the same course payload without using a modal.</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className={PANEL_CLASS}>
                      <CardContent className="space-y-3 py-4">
                        <Button
                          type="submit"
                          disabled={isCreating || isUpdating || isCourseLoading}
                          className="h-11 w-full rounded-xl bg-studprimary text-sm font-bold text-white hover:bg-studprimary/90 disabled:opacity-60 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                        >
                          {isCreating || isUpdating || isCourseLoading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <>
                              <Save className="mr-1.5 h-4 w-4" />
                              {isEditMode ? "Update Course" : "Create Course"}
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          onClick={() => navigate("/managecourses")}
                          variant="outline"
                          className="h-11 w-full rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/10"
                        >
                          <ArrowLeft className="mr-1.5 h-4 w-4" />
                          Back to Courses
                        </Button>

                        <Button
                          type="button"
                          onClick={() => setShowPreview((prev) => !prev)}
                          variant="outline"
                          className="h-11 w-full rounded-xl border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/35 dark:text-premium-gold dark:hover:bg-premium-gold/10"
                        >
                          {showPreview ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
                          {showPreview ? "Hide Preview" : "Show Preview"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </form>

          {showPreview ? (
            <motion.section variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-studprimary dark:text-premium-gold">Live Preview</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{formData.title || "Course title preview"}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formData.description || "Course description preview"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Media</p>
                  <p className="mt-1 max-w-xs truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {formData.videoUrl || formData.image || "No media added yet"}
                  </p>
                </div>
              </div>
            </motion.section>
          ) : null}

          {isEditMode && !course && !isCourseLoading ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Could not preload course details. Please go back and open edit from the course list.
            </div>
          ) : null}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default CourseCreate;

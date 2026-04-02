import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateCourseMutation, useUpdateCourseMutation, useGetCourseByIdQuery } from "../../../redux/Apis/courseApi";
import { useGetSubjectsQuery } from "../../../redux";
import { AlertCircle, CheckCircle2, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import AdminLayout from "../../../utils/Adminlayoute";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Card";
import { Button } from "../../../components/Button";

const CATEGORY_OPTIONS = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Design",
  "Business",
  "Marketing",
  "Other",
];

const LEVEL_OPTIONS = ["Easy", "Medium", "Hard"];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "INR", label: "INR (₹)" },
];

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  category: "",
  subjectId: "",
  level: "Easy",
  video_url: "",
  image: "",
  tags: [],
  price: 0,
  currency: "USD",
  isPaid: false,
  lessons: [{ videoUrl: "", description: "" }],
};

const PAGE_SHELL_CLASS =
  "min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(77,95,218,0.12),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(180,140,76,0.12),_transparent_48%),linear-gradient(180deg,#f7f9ff,#f2f5fb)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(176,141,87,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(77,95,218,0.18),_transparent_45%),linear-gradient(180deg,#0f1424,#0c1020)]";
const PANEL_CLASS =
  "rounded-2xl border border-studprimary/15 bg-white/90 backdrop-blur-sm shadow-sm dark:border-premium-gold/25 dark:bg-white/5";
const SECTION_TITLE_CLASS = "text-lg font-black tracking-tight text-slate-900 dark:text-white";
const LABEL_CLASS = "mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300";
const INPUT_BASE_CLASS =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500";

const isValidHttpUrl = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const getNormalizedLessons = (lessons) =>
  lessons
    .map((lesson) => ({
      videoUrl: String(lesson?.videoUrl || "").trim(),
      description: String(lesson?.description || "").trim(),
    }))
    .filter((lesson) => lesson.videoUrl && lesson.description);

const validateCourseForm = (formData) => {
  const errors = {
    lessons: formData.lessons.map(() => ({ videoUrl: "", description: "" })),
  };

  const title = String(formData.title || "").trim();
  const description = String(formData.description || "").trim();
  const category = String(formData.category || "").trim();
  const image = String(formData.image || "").trim();

  if (!title) errors.title = "Course title is required.";
  else if (title.length < 5) errors.title = "Use at least 5 characters for title.";

  if (!description) errors.description = "Course description is required.";
  else if (description.length < 20) errors.description = "Description should be at least 20 characters.";

  if (!category) errors.category = "Select a course category.";
  if (!formData.level) errors.level = "Select a difficulty level.";

  if (!image) errors.image = "Course image URL is required.";
  else if (!isValidHttpUrl(image)) errors.image = "Enter a valid image URL (http or https).";

  const hasAtLeastOneValidLesson = formData.lessons.some((lesson) => {
    const videoUrl = String(lesson?.videoUrl || "").trim();
    const lessonDescription = String(lesson?.description || "").trim();
    return Boolean(videoUrl && lessonDescription);
  });

  formData.lessons.forEach((lesson, index) => {
    const videoUrl = String(lesson?.videoUrl || "").trim();
    const lessonDescription = String(lesson?.description || "").trim();
    const isAnyFilled = Boolean(videoUrl || lessonDescription);

    if (!isAnyFilled) return;

    if (!videoUrl) errors.lessons[index].videoUrl = "Video URL is required.";
    else if (!isValidHttpUrl(videoUrl)) errors.lessons[index].videoUrl = "Enter a valid lesson URL.";

    if (!lessonDescription) errors.lessons[index].description = "Lesson description is required.";
  });

  if (!hasAtLeastOneValidLesson) {
    errors.lessonSummary = "Add at least one lesson with video URL and description.";
  }

  if (formData.isPaid) {
    const amount = Number(formData.price);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.price = "Price must be greater than 0 for paid course.";
    }
  }

  return errors;
};

const hasValidationErrors = (errors) => {
  if (!errors || typeof errors !== "object") return false;
  return Object.entries(errors).some(([key, value]) => {
    if (key === "lessons") {
      return Array.isArray(value)
        ? value.some((lessonErrors) => Boolean(lessonErrors?.videoUrl || lessonErrors?.description))
        : false;
    }
    return Boolean(value);
  });
};

const CourseForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const { data: courseData, isLoading: loadingCourse } = useGetCourseByIdQuery(editId, { skip: !editId });
  const { data: subjectsResponse } = useGetSubjectsQuery({ status: "active" });
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();
  const activeSubjects = subjectsResponse?.data || [];

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({ lessons: [{ videoUrl: "", description: "" }] });
  const [submitError, setSubmitError] = useState("");

  const [tagInput, setTagInput] = useState("");

  const isBusy = creating || updating;

  useEffect(() => {
    if (editId && courseData?.data) {
      const course = courseData.data;
      const parsedLessons = Array.isArray(course.lessons) && course.lessons.length > 0
        ? course.lessons.map((lesson) => ({
            videoUrl: lesson.videoUrl || lesson.video_url || "",
            description: lesson.description || "",
          }))
        : [{ videoUrl: course.video_url || course.videoUrl || "", description: "" }];

      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        subjectId: course.subjectId?._id || course.subjectId || "",
        level: course.level || "Easy",
        video_url: parsedLessons[0]?.videoUrl || "",
        image: course.image || "",
        tags: course.tags || [],
        price: course.price || course.pricing || 0,
        currency: course.currency || "USD",
        isPaid: course.isPaid !== undefined ? course.isPaid : (course.price > 0 || course.pricing > 0),
        lessons: parsedLessons,
      });
      setErrors({ lessons: parsedLessons.map(() => ({ videoUrl: "", description: "" })) });
    }
  }, [editId, courseData]);

  const completionStats = useMemo(() => {
    const checks = [
      Boolean(String(formData.title).trim()),
      Boolean(String(formData.description).trim()),
      Boolean(String(formData.category).trim()),
      Boolean(String(formData.image).trim() && isValidHttpUrl(formData.image)),
      getNormalizedLessons(formData.lessons).length > 0,
      !formData.isPaid || Number(formData.price) > 0,
    ];

    const completed = checks.filter(Boolean).length;
    const total = checks.length;
    return {
      completed,
      total,
      progressPercent: Math.round((completed / total) * 100),
    };
  }, [formData]);

  const getInputClass = (errorText) =>
    `${INPUT_BASE_CLASS} ${
      errorText
        ? "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-400/45 dark:bg-red-500/10 dark:focus:ring-red-500/20"
        : "border-studprimary/20 bg-white focus:border-studprimary focus:ring-4 focus:ring-studprimary/15 dark:border-premium-gold/30 dark:bg-white/5 dark:focus:border-premium-gold dark:focus:ring-premium-gold/20"
    }`;

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError("");
  };

  const handleLessonChange = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, [key]: value } : lesson
      ),
    }));

    setErrors((prev) => {
      const nextLessons = Array.isArray(prev?.lessons)
        ? [...prev.lessons]
        : formData.lessons.map(() => ({ videoUrl: "", description: "" }));
      nextLessons[index] = { ...(nextLessons[index] || { videoUrl: "", description: "" }), [key]: "" };
      return { ...prev, lessons: nextLessons, lessonSummary: "" };
    });
  };

  const handleAddLesson = () => {
    setFormData((prev) => ({
      ...prev,
      lessons: [...prev.lessons, { videoUrl: "", description: "" }],
    }));
    setErrors((prev) => ({
      ...prev,
      lessons: [...(prev.lessons || []), { videoUrl: "", description: "" }],
      lessonSummary: "",
    }));
  };

  const handleRemoveLesson = (index) => {
    setFormData((prev) => {
      if (prev.lessons.length <= 1) return prev;
      return {
        ...prev,
        lessons: prev.lessons.filter((_, lessonIndex) => lessonIndex !== index),
      };
    });

    setErrors((prev) => {
      const nextLessons = Array.isArray(prev?.lessons)
        ? prev.lessons.filter((_, lessonIndex) => lessonIndex !== index)
        : [{ videoUrl: "", description: "" }];
      return { ...prev, lessons: nextLessons, lessonSummary: "" };
    });
  };

  const handleAddTag = () => {
    const cleanTag = tagInput.trim();
    if (cleanTag && !formData.tags.includes(cleanTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, cleanTag] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateCourseForm(formData);
    setErrors(nextErrors);
    setSubmitError("");

    if (hasValidationErrors(nextErrors)) {
      setSubmitError("Please fix highlighted fields before submitting.");
      return;
    }

    const normalizedLessons = getNormalizedLessons(formData.lessons);
    const primaryLessonVideo = normalizedLessons[0]?.videoUrl || "";

    try {
      const coursePayload = {
        ...formData,
        title: String(formData.title).trim(),
        description: String(formData.description).trim(),
        category: String(formData.category).trim(),
        image: String(formData.image).trim(),
        tags: formData.tags.map((tag) => String(tag).trim()).filter(Boolean),
        price: formData.isPaid ? Number(formData.price) : 0,
        pricing: formData.price,
        video_url: primaryLessonVideo,
        videoUrl: primaryLessonVideo,
        lessons: normalizedLessons,
      };

      if (editId) {
        await updateCourse({ id: editId, ...coursePayload }).unwrap();
        window.alert("Course updated successfully!");
      } else {
        await createCourse(coursePayload).unwrap();
        window.alert("Course created successfully!");
      }
      navigate("/teacher/courses");
    } catch (error) {
      setSubmitError(error?.data?.message || error?.message || "Failed to save course.");
    }
  };

  if (loadingCourse) {
    return (
      <AdminLayout showSearch={false}>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="animate-spin text-studprimary dark:text-premium-gold" size={48} />
        </div>
      </AdminLayout>
    );
  }

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
                      {editId ? "Edit Course" : "Create Course"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Build your course with structured sections, clean visuals, and instant validation.
                    </p>
                  </div>

                  <div className="min-w-[220px] rounded-xl border border-studprimary/20 bg-white/80 px-4 py-3 dark:border-premium-gold/25 dark:bg-white/5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Form Completion</p>
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
                    <CardTitle className={SECTION_TITLE_CLASS}>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-5">
                    <div>
                      <label className={LABEL_CLASS}>Course Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        className={getInputClass(errors.title)}
                        placeholder="e.g., Mastering React from Scratch"
                        maxLength={120}
                      />
                      {errors.title ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.title}</p> : null}
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        className={getInputClass(errors.description)}
                        rows={5}
                        placeholder="Describe outcomes, target learners, and what this course delivers."
                        maxLength={1500}
                      />
                      <div className="mt-1 flex items-center justify-between gap-2">
                        {errors.description ? (
                          <p className="text-xs font-semibold text-red-600 dark:text-red-300">{errors.description}</p>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Minimum 20 characters recommended.</p>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">{String(formData.description || "").length}/1500</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className={LABEL_CLASS}>Subject</label>
                        <select
                          value={formData.subjectId}
                          onChange={(e) => updateField("subjectId", e.target.value)}
                          className={getInputClass("")}
                          style={{ colorScheme: "light dark" }}
                        >
                          <option value="">Select Subject (optional)</option>
                          {activeSubjects.map((subject) => (
                            <option key={subject._id || subject.id} value={subject._id || subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => updateField("category", e.target.value)}
                          className={getInputClass(errors.category)}
                          style={{ colorScheme: "light dark" }}
                        >
                          <option value="">Select Category</option>
                          {CATEGORY_OPTIONS.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.category ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.category}</p> : null}
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Level *</label>
                        <select
                          value={formData.level}
                          onChange={(e) => updateField("level", e.target.value)}
                          className={getInputClass(errors.level)}
                          style={{ colorScheme: "light dark" }}
                        >
                          {LEVEL_OPTIONS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        {errors.level ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.level}</p> : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={PANEL_CLASS}>
                  <CardHeader className="pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className={SECTION_TITLE_CLASS}>Course Lessons</CardTitle>
                      <Button
                        type="button"
                        onClick={handleAddLesson}
                        className="h-9 rounded-lg bg-studprimary px-3 text-xs font-bold text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-5">
                    {formData.lessons.map((lesson, index) => {
                      const lessonErrors = errors.lessons?.[index] || {};
                      return (
                        <div
                          key={`lesson-${index}`}
                          className="rounded-xl border border-studprimary/15 bg-background-light/70 p-3 dark:border-premium-gold/25 dark:bg-white/5"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-xs font-black uppercase tracking-[0.08em] text-studprimary dark:text-premium-gold">
                              Lesson {index + 1}
                            </p>
                            {formData.lessons.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveLesson(index)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                                aria-label="Remove lesson"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>

                          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                              <label className={LABEL_CLASS}>Video URL *</label>
                              <input
                                type="url"
                                value={lesson.videoUrl}
                                onChange={(e) => handleLessonChange(index, "videoUrl", e.target.value)}
                                className={getInputClass(lessonErrors.videoUrl)}
                                placeholder="https://youtube.com/watch?v=..."
                              />
                              {lessonErrors.videoUrl ? (
                                <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{lessonErrors.videoUrl}</p>
                              ) : null}
                            </div>

                            <div className="lg:col-span-3">
                              <label className={LABEL_CLASS}>Lesson Description *</label>
                              <textarea
                                value={lesson.description}
                                onChange={(e) => handleLessonChange(index, "description", e.target.value)}
                                className={getInputClass(lessonErrors.description)}
                                rows={2}
                                placeholder="Summarize what students learn in this lesson."
                              />
                              {lessonErrors.description ? (
                                <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{lessonErrors.description}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {errors.lessonSummary ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                        {errors.lessonSummary}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        First valid lesson video is used as the course preview video.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className={PANEL_CLASS}>
                  <CardHeader className="pb-0">
                    <CardTitle className={SECTION_TITLE_CLASS}>Media and Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-5">
                    <div>
                      <label className={LABEL_CLASS}>Course Image URL *</label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => updateField("image", e.target.value)}
                        className={getInputClass(errors.image)}
                        placeholder="https://example.com/course-cover.jpg"
                      />
                      {errors.image ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.image}</p> : null}
                      {formData.image && isValidHttpUrl(formData.image) ? (
                        <img
                          src={formData.image}
                          alt="Course preview"
                          className="mt-3 h-44 w-full rounded-xl object-cover ring-1 ring-studprimary/15 dark:ring-premium-gold/30"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Tags</label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className={getInputClass("")}
                          placeholder="Type a tag and press Enter"
                          maxLength={30}
                        />
                        <Button
                          type="button"
                          onClick={handleAddTag}
                          className="h-11 rounded-xl bg-superadminprimary px-5 font-semibold text-white hover:bg-superadminprimary/90 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                        >
                          <Tag className="mr-1.5 h-4 w-4" />
                          Add Tag
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.tags.length === 0 ? (
                          <span className="text-xs text-slate-500 dark:text-slate-400">No tags added yet.</span>
                        ) : (
                          formData.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-2 rounded-full border border-studprimary/20 bg-lavender-light px-3 py-1 text-xs font-semibold text-studprimary dark:border-premium-gold/35 dark:bg-premium-gold/15 dark:text-premium-gold"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-current opacity-80 transition-opacity hover:opacity-100"
                                aria-label={`Remove ${tag} tag`}
                              >
                                x
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={PANEL_CLASS}>
                  <CardHeader className="pb-0">
                    <CardTitle className={SECTION_TITLE_CLASS}>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.isPaid}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            isPaid: checked,
                            price: checked ? Number(prev.price) || 0 : 0,
                          }));
                          setErrors((prev) => ({ ...prev, price: "" }));
                        }}
                        className="h-4 w-4 rounded border-studprimary/30 text-studprimary focus:ring-studprimary/40 dark:border-premium-gold/40 dark:text-premium-gold dark:focus:ring-premium-gold/40"
                      />
                      This is a paid course
                    </label>

                    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${formData.isPaid ? "" : "opacity-70"}`}>
                      <div>
                        <label className={LABEL_CLASS}>Price {formData.isPaid ? "*" : ""}</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                          className={getInputClass(errors.price)}
                          min="0"
                          step="0.01"
                          disabled={!formData.isPaid}
                        />
                        {errors.price ? <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">{errors.price}</p> : null}
                      </div>

                      <div>
                        <label className={LABEL_CLASS}>Currency</label>
                        <select
                          value={formData.currency}
                          onChange={(e) => updateField("currency", e.target.value)}
                          className={getInputClass("")}
                          disabled={!formData.isPaid}
                          style={{ colorScheme: "light dark" }}
                        >
                          {CURRENCY_OPTIONS.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-4">
                <div className="sticky top-4 space-y-4">
                  <Card className={PANEL_CLASS}>
                    <CardHeader className="pb-0">
                      <CardTitle className={SECTION_TITLE_CLASS}>Publish Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-5">
                      <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mode</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{editId ? "Update Existing Course" : "Create New Course"}</p>
                      </div>
                      <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Lessons Ready</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{getNormalizedLessons(formData.lessons).length} completed</p>
                      </div>
                      <div className="rounded-xl border border-studprimary/15 bg-background-light/80 px-3 py-2 dark:border-premium-gold/30 dark:bg-white/5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pricing</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                          {formData.isPaid ? `${formData.currency} ${Number(formData.price || 0)}` : "Free Course"}
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
                            <span>All good. Submit when you are ready.</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={PANEL_CLASS}>
                    <CardContent className="space-y-3 py-4">
                      <Button
                        type="submit"
                        disabled={isBusy}
                        className="h-11 w-full rounded-xl bg-studprimary text-sm font-bold text-white hover:bg-studprimary/90 disabled:opacity-60 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
                      >
                        {isBusy ? (
                          <Loader2 className="animate-spin" />
                        ) : editId ? (
                          "Update Course"
                        ) : (
                          "Create Course"
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => navigate("/teacher/courses")}
                        variant="outline"
                        className="h-11 w-full rounded-xl border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/35 dark:text-premium-gold dark:hover:bg-premium-gold/10"
                      >
                        Cancel
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseForm;

import React, { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Download,
  Edit,
  FilePlus2,
  Filter,
  Layers3,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import AdminLayout from "../../../utils/Adminlayoute";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetAllCoursesQuery,
  useUpdateCourseMutation,
} from "../../../redux/Apis/courseApi";
import { useGetSubjectsQuery } from "../../../redux";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/table";
import { DataTablePagination } from "../../../components/data-table-pagination";
import {
  AnalyticsLineChart,
  AnalyticsRadarChart,
} from "../student/Student_Dashboard/ChartComponents";
import { enrollmentApi } from "../../../api/enrollmentApi";
import filterData from "../student/exploreCourses/filterData";

const EMPTY_COURSE = {
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
};

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_err) {
    return false;
  }
};

const validateCourseForm = (form) => {
  const errors = {};

  if (!String(form.title || "").trim()) {
    errors.title = "Title is required.";
  }

  if (!String(form.description || "").trim()) {
    errors.description = "Description is required.";
  }

  if (!String(form.category || "").trim()) {
    errors.category = "Category is required.";
  }

  const price = Number(form.priceUSD || 0);
  if (Number.isNaN(price) || price < 0) {
    errors.priceUSD = "Price must be a valid non-negative number.";
  }

  if (String(form.image || "").trim() && !isValidHttpUrl(String(form.image).trim())) {
    errors.image = "Image URL must start with http:// or https://";
  }

  if (!String(form.videoUrl || "").trim()) {
    errors.videoUrl = "Video URL is required.";
  } else if (!isValidHttpUrl(String(form.videoUrl).trim())) {
    errors.videoUrl = "Video URL must start with http:// or https://";
  }

  return errors;
};

const getPriceNumber = (course) => Number(course.priceUSD ?? course.price ?? course.pricing ?? 0);
const getCurrency = (course) => course.currency || "USD";

const getCourseStatus = (course) => {
  if (typeof course?.status === "string" && course.status.trim()) {
    return course.status.toLowerCase();
  }
  if (course?.isPublished === false) return "draft";
  return "published";
};

const formatPrice = (course) => {
  const value = getPriceNumber(course);
  if (value <= 0) return "Free";

  const currency = getCurrency(course);
  if (currency === "USD") return `$${value.toFixed(2)}`;
  return `${currency} ${value.toFixed(2)}`;
};

const statusClassMap = {
  published:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  draft: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

const CourseStatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
      statusClassMap[status] || statusClassMap.published
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);

const CourseThumb = ({ course }) => {
  const src =
    course?.image ||
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=200&q=80";

  return (
    <img
      src={src}
      alt={course?.title || "Course thumbnail"}
      className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-white/10"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src =
          "https://placehold.co/120x120/e6e6fa/4c4c4c?text=Course";
      }}
    />
  );
};

const MetricCard = ({ title, value, hint, icon: Icon }) => (
  <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 shadow-sm dark:shadow-none">
    <div className="flex items-center justify-between">
      <div className="h-10 w-10 rounded-xl bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Live
      </span>
    </div>
    <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
  </article>
);

const CourseFormModal = ({ mode, course, onClose, onSaved }) => {
  const [form, setForm] = useState(
    mode === "edit"
      ? {
          title: course?.title || "",
          description: course?.description || "",
          category: course?.category || "",
          subjectId: course?.subjectId?._id || course?.subjectId || "",
          priceUSD: String(course?.priceUSD ?? course?.price ?? ""),
          image: course?.image || "",
          videoUrl: course?.videoUrl || course?.video_url || "",
          tags: Array.isArray(course?.tags) ? course.tags.join(", ") : "",
          currency: course?.currency || "USD",
          isPaid: course?.isPaid ?? Number(course?.priceUSD || 0) > 0,
          status: getCourseStatus(course),
        }
      : {
          ...EMPTY_COURSE,
          status: "published",
        }
  );

  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();
  const { data: subjectsResponse } = useGetSubjectsQuery({ status: "active" });
  const subjects = subjectsResponse?.data || [];
  const isBusy = creating || updating;
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateCourseForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      ErrorToster("Please fix highlighted form fields", 2500);
      return;
    }

    try {
      const payload = {
        ...form,
        priceUSD: Number(form.priceUSD || 0),
        videoUrl: form.videoUrl,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        isPublished: form.status !== "draft",
      };

      if (mode === "edit") {
        await updateCourse({ id: course._id || course.id, ...payload }).unwrap();
        SuccessToster("Course updated", 2000);
      } else {
        await createCourse(payload).unwrap();
        SuccessToster("Course created", 2000);
      }
      onSaved();
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to save course", 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-navy-charcoal border border-slate-200 dark:border-white/10 shadow-2xl max-h-[calc(100vh-2rem)] flex flex-col my-auto mx-auto">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === "edit" ? "Edit Course" : "Create New Course"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto modal-scrollbar modal-scroll-smooth" style={{ touchAction: "pan-y" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.title)}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.title ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.title ? <p className="mt-1 text-xs text-red-500">{errors.title}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                aria-invalid={Boolean(errors.description)}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 resize-none ${errors.description ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.description ? <p className="mt-1 text-xs text-red-500">{errors.description}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="">Select subject (optional)</option>
                {subjects.map((subject) => (
                  <option key={subject._id || subject.id} value={subject._id || subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.category)}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.category ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.category ? <p className="mt-1 text-xs text-red-500">{errors.category}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Price
              </label>
              <input
                name="priceUSD"
                type="number"
                min="0"
                step="0.01"
                value={form.priceUSD}
                onChange={handleChange}
                aria-invalid={Boolean(errors.priceUSD)}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.priceUSD ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.priceUSD ? <p className="mt-1 text-xs text-red-500">{errors.priceUSD}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Image URL
              </label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
                aria-invalid={Boolean(errors.image)}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.image ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.image ? <p className="mt-1 text-xs text-red-500">{errors.image}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Video URL *
              </label>
              <input
                name="videoUrl"
                value={form.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                required
                aria-invalid={Boolean(errors.videoUrl)}
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 dark:focus:ring-premium-gold/30 ${errors.videoUrl ? "border-red-400 focus:ring-red-200" : "border-slate-300 dark:border-white/10 focus:ring-studprimary/30"}`}
              />
              {errors.videoUrl ? <p className="mt-1 text-xs text-red-500">{errors.videoUrl}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tags
              </label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Popular, Beginner, Design"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              />
            </div>

            <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                name="isPaid"
                checked={form.isPaid}
                onChange={(e) => setForm((prev) => ({ ...prev, isPaid: e.target.checked }))}
              />
              Paid course
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 py-2.5 rounded-xl bg-studprimary dark:bg-premium-gold hover:bg-studprimary/90 dark:hover:brightness-110 text-white dark:text-deep-charcoal disabled:opacity-60"
            >
              {isBusy ? "Saving..." : mode === "edit" ? "Update Course" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Courses = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [statusTab, setStatusTab] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sorting, setSorting] = useState([{ id: "title", desc: false }]);
  const [paginationState, setPaginationState] = useState({ pageIndex: 0, pageSize: 10 });
  const [enrollmentByCourse, setEnrollmentByCourse] = useState({});
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const { data, isLoading, error, refetch } = useGetAllCoursesQuery();
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation();

  const courses = data?.data || [];

  const categories = useMemo(() => {
    const fromCourses = Array.from(
      new Set(courses.map((course) => course.category).filter(Boolean))
    );

    if (fromCourses.length) return fromCourses;
    return filterData.categories.map((entry) => entry.name);
  }, [courses]);

  useEffect(() => {
    if (!courses.length) {
      setEnrollmentByCourse({});
      return;
    }

    let mounted = true;

    const loadEnrollmentStats = async () => {
      setEnrollmentLoading(true);
      try {
        const requests = courses.map(async (course) => {
          const courseId = course._id || course.id;
          if (!courseId) return null;

          const response = await enrollmentApi.getCourseEnrollments(courseId);
          const list = response?.data?.data || [];
          return [courseId, list.length];
        });

        const result = await Promise.allSettled(requests);
        const map = {};

        result.forEach((item) => {
          if (item.status === "fulfilled" && Array.isArray(item.value)) {
            map[item.value[0]] = item.value[1];
          }
        });

        if (mounted) setEnrollmentByCourse(map);
      } catch (_err) {
        if (mounted) setEnrollmentByCourse({});
      } finally {
        if (mounted) setEnrollmentLoading(false);
      }
    };

    loadEnrollmentStats();

    return () => {
      mounted = false;
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return courses.filter((course) => {
      const title = String(course.title || "").toLowerCase();
      const description = String(course.description || "").toLowerCase();
      const category = String(course.category || "").toLowerCase();
      const status = getCourseStatus(course);
      const rating = Number(course.rating || 0);
      const price = getPriceNumber(course);

      const matchSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        category.includes(normalizedSearch);

      const matchStatus = statusTab === "all" || status === statusTab;
      const matchCategory =
        selectedCategory === "all" || category === selectedCategory.toLowerCase();
      const matchPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && price <= 0) ||
        (priceFilter === "paid" && price > 0);
      const matchRating = rating >= minRating;

      return matchSearch && matchStatus && matchCategory && matchPrice && matchRating;
    });
  }, [courses, minRating, priceFilter, search, selectedCategory, statusTab]);

  const stats = useMemo(() => {
    const published = courses.filter((course) => getCourseStatus(course) === "published").length;
    const drafts = courses.filter((course) => getCourseStatus(course) === "draft").length;
    const totalEnrolled = Object.values(enrollmentByCourse).reduce((sum, value) => sum + Number(value || 0), 0);
    const avgCompletion = courses.length
      ? Math.round(
          courses.reduce((sum, course) => sum + Number(course?.completionRate || course?.avgProgress || 0), 0) /
            courses.length
        )
      : 0;

    return {
      total: courses.length,
      published,
      drafts,
      totalEnrolled,
      avgCompletion,
    };
  }, [courses, enrollmentByCourse]);

  const categoryChartData = useMemo(() => {
    const categoryCounts = courses.reduce((acc, course) => {
      const category = course.category || "General";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [courses]);

  const enrollmentChartData = useMemo(() => {
    return courses
      .map((course) => {
        const id = course._id || course.id;
        return {
          name: course.title || "Untitled",
          enrolled: Number(enrollmentByCourse[id] || 0),
        };
      })
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 8);
  }, [courses, enrollmentByCourse]);

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete course "${course.title}"?`)) return;
    try {
      await deleteCourse(course._id || course.id).unwrap();
      SuccessToster("Course deleted", 2000);
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to delete course", 3000);
    }
  };

  const onSaved = () => {
    setModal(null);
    refetch();
  };

  const exportFilteredCourses = () => {
    if (!filteredCourses.length) {
      ErrorToster("No courses to export", 2000);
      return;
    }

    const header = ["Title", "Category", "Price", "Status", "Enrolled", "Rating"];
    const rows = filteredCourses.map((course) => {
      const id = course._id || course.id;
      return [
        `"${String(course.title || "").replace(/"/g, '""')}"`,
        `"${String(course.category || "General").replace(/"/g, '""')}"`,
        formatPrice(course),
        getCourseStatus(course),
        String(enrollmentByCourse[id] || 0),
        String(Number(course.rating || 0).toFixed(1)),
      ].join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "courses-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1.5"
          >
            Course Detail <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => {
          const course = row.original;
          const id = course._id || course.id;
          return (
            <div className="min-w-[240px] flex items-center gap-3">
              <CourseThumb course={course} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {course.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {course.teacher_id?.firstName
                    ? `${course.teacher_id.firstName} ${course.teacher_id.lastName || ""}`.trim()
                    : "Course owner"}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {enrollmentByCourse[id] || 0} enrolled
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1.5"
          >
            Category <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-lavender-light text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold">
            {row.original.category || "General"}
          </span>
        ),
      },
      {
        id: "enrolled",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1.5"
          >
            Enrolled <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        accessorFn: (row) => Number(enrollmentByCourse[row._id || row.id] || 0),
        cell: ({ row }) => {
          const count = Number(enrollmentByCourse[row.original._id || row.original.id] || 0);
          return <span className="text-sm font-semibold text-slate-900 dark:text-white">{count.toLocaleString()}</span>;
        },
      },
      {
        id: "price",
        accessorFn: (row) => getPriceNumber(row),
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1.5"
          >
            Price <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatPrice(row.original)}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => getCourseStatus(row),
        header: "Status",
        cell: ({ row }) => <CourseStatusBadge status={getCourseStatus(row.original)} />,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setModal({ type: "edit", course })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10 transition-colors"
                title="Edit course"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(course)}
                disabled={deleting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
                title="Delete course"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [deleting, enrollmentByCourse]
  );

  const table = useReactTable({
    data: filteredCourses,
    columns,
    state: {
      sorting,
      pagination: paginationState,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPaginationState,
  });

  useEffect(() => {
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, statusTab, priceFilter, minRating, selectedCategory]);

  const statusTabs = [
    { key: "all", label: "All Courses", count: courses.length },
    { key: "published", label: "Published", count: stats.published },
    { key: "draft", label: "Drafts", count: stats.drafts },
  ];

  return (
    <AdminLayout showSearch={false}>
      <div className="space-y-6 p-4 sm:p-6">
        <section className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] px-5 py-8 md:px-6 md:py-10 bg-lavender-light dark:bg-navy-charcoal border border-white/60 dark:border-white/10 shadow-sm dark:shadow-none">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-studprimary dark:text-premium-gold pointer-events-none" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "1.5rem 1.5rem" }} />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-studprimary/20 dark:border-premium-gold/20 bg-studprimary/10 dark:bg-premium-gold/10 px-3 py-1 text-xs font-semibold text-studprimary dark:text-premium-gold">
                <Layers3 className="h-3.5 w-3.5" />
                Courses Hub
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Manage Courses</h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Review, organize, and manage your full course catalog with live analytics.
              </p>
            </div>

            <button
              onClick={() => setModal({ type: "add" })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-studprimary dark:bg-premium-gold px-4 py-2.5 text-sm font-semibold text-white dark:text-deep-charcoal shadow-sm dark:shadow-none transition hover:bg-studprimary/90 dark:hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Create New Course
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Courses" value={stats.total} hint="Catalog size" icon={FilePlus2} />
          <MetricCard title="Active Learners" value={stats.totalEnrolled.toLocaleString()} hint="Across all courses" icon={Users} />
          <MetricCard title="Published" value={stats.published} hint="Visible to learners" icon={TrendingUp} />
          <MetricCard title="Avg. Completion" value={`${stats.avgCompletion}%`} hint="Progress indicator" icon={TrendingUp} />
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-4 md:p-5 shadow-sm dark:shadow-none">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusTab(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    statusTab === tab.key
                      ? "bg-studprimary/10 text-studprimary dark:bg-premium-gold/10 dark:text-premium-gold"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportFilteredCourses}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-3">
            <div className="xl:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, category, description"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              />
            </div>

            <div className="xl:col-span-2">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2">
              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value="all">All Prices</option>
                {filterData.priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2">
              <select
                value={minRating}
                onChange={(event) => setMinRating(Number(event.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30"
              >
                <option value={0}>All Ratings</option>
                {filterData.ratings.map((rating) => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-1 flex items-center">
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setPriceFilter("all");
                  setMinRating(0);
                  setStatusTab("all");
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/10 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <Filter className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-premium-gold/15 bg-white dark:bg-transparent dark:dark-glass shadow-sm dark:shadow-none overflow-hidden">
          {isLoading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-studprimary dark:border-premium-gold" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl m-4">
              {error?.data?.message || "Failed to load courses"}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <Layers3 className="h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">No courses found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-slate-100/80 dark:bg-premium-surface-2/70 hover:bg-slate-100/80 dark:hover:bg-premium-surface-2/70">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="px-1 pb-1">
                <DataTablePagination table={table} pageSizeOptions={[5, 10, 20, 30, 50]} className="rounded-b-xl" />
              </div>
            </>
          )}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <article className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-premium-gold/15 bg-white dark:bg-transparent p-4 md:p-5 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Courses by Category</h3>
            {categoryChartData.length ? (
              <AnalyticsLineChart
                data={categoryChartData}
                title="Category Distribution"
                xKey="name"
                yKey="total"
                lineColor="#b48c4c"
              />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No category data available.</p>
            )}
          </article>

          <article className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-premium-gold/15 bg-white dark:bg-transparent p-4 md:p-5 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Students Enrolled per Course</h3>
            {enrollmentLoading ? (
              <div className="h-[340px] flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-studprimary dark:border-premium-gold" />
              </div>
            ) : enrollmentChartData.length ? (
              <AnalyticsRadarChart
                data={enrollmentChartData}
                title="Top Enrolled Courses"
                angleKey="name"
                valueKey="enrolled"
                color="#10b981"
              />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No enrollment data available.</p>
            )}
          </article>
        </section>

        {modal?.type === "add" && (
          <CourseFormModal mode="create" onClose={() => setModal(null)} onSaved={onSaved} />
        )}
        {modal?.type === "edit" && (
          <CourseFormModal
            mode="edit"
            course={modal.course}
            onClose={() => setModal(null)}
            onSaved={onSaved}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default Courses;

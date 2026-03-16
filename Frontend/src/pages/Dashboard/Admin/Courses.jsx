import React, { useMemo, useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  useGetAllCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from "../../../redux/Apis/courseApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";

const EMPTY_COURSE = {
  title: "",
  description: "",
  category: "",
  priceUSD: "",
  image: "",
};

const CourseFormModal = ({ mode, course, onClose, onSaved }) => {
  const [form, setForm] = useState(
    mode === "edit"
      ? {
          title: course?.title || "",
          description: course?.description || "",
          category: course?.category || "",
          priceUSD: String(course?.priceUSD ?? ""),
          image: course?.image || "",
        }
      : EMPTY_COURSE
  );

  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();
  const isBusy = creating || updating;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        priceUSD: Number(form.priceUSD || 0),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === "edit" ? "Edit Course" : "Add Course"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (USD)</label>
              <input
                name="priceUSD"
                type="number"
                min="0"
                step="0.01"
                value={form.priceUSD}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
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
  const { data, isLoading, error, refetch } = useGetAllCoursesQuery();
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation();

  const courses = data?.data || [];

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(search.toLowerCase()) ||
          course.category?.toLowerCase().includes(search.toLowerCase())
      ),
    [courses, search]
  );

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete course \"${course.title}\"?`)) return;
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

  return (
    <AdminLayout showSearch={false}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Courses</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create, edit and remove courses</p>
          </div>
          <button
            onClick={() => setModal({ type: "add" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Course
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-56">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error?.data?.message || "Failed to load courses"}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No courses found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id || course.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <img
                  src={course.image || "https://via.placeholder.com/600x280?text=Course"}
                  alt={course.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {course.category || "General"}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">${Number(course.priceUSD || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setModal({ type: "edit", course })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      disabled={deleting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal?.type === "add" && <CourseFormModal mode="create" onClose={() => setModal(null)} onSaved={onSaved} />}
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

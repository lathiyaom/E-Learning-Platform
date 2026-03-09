import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateCourseMutation, useUpdateCourseMutation, useGetCourseByIdQuery } from "../../../redux/Apis/courseApi";
import { Loader2 } from "lucide-react";
import AdminLayout from "../../../utils/Adminlayoute";

const CourseForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const { data: courseData, isLoading: loadingCourse } = useGetCourseByIdQuery(editId, { skip: !editId });
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    video_url: "",
    image: "",
    tags: [],
    price: 0,
    currency: "USD",
    isPaid: false,
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (editId && courseData?.data) {
      const course = courseData.data;
      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        video_url: course.video_url || course.videoUrl || "",
        image: course.image || "",
        tags: course.tags || [],
        price: course.price || course.pricing || 0,
        currency: course.currency || "USD",
        isPaid: course.isPaid !== undefined ? course.isPaid : (course.price > 0 || course.pricing > 0),
      });
    }
  }, [editId, courseData]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.video_url || !formData.image) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const coursePayload = {
        ...formData,
        pricing: formData.price,
        videoUrl: formData.video_url,
      };

      if (editId) {
        await updateCourse({ id: editId, ...coursePayload }).unwrap();
        alert("Course updated successfully!");
      } else {
        await createCourse(coursePayload).unwrap();
        alert("Course created successfully!");
      }
      navigate("/teacher/courses");
    } catch (error) {
      alert("Failed to save course: " + (error.data?.message || error.message));
    }
  };

  if (loadingCourse) {
    return (
      <AdminLayout showSearch={false}>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSearch={false} className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{editId ? "Edit" : "Create"} Course</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Course Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Introduction to Web Development"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows="4"
              placeholder="Describe what students will learn in this course"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Category</option>
              <option value="Programming">Programming</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course Video URL *</label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">YouTube or Vimeo URL for course intro video</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course Image URL *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="mt-2 w-full h-40 object-cover rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-900 hover:text-red-600">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Pricing</h2>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked, price: e.target.checked ? formData.price : 0 })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">This is a paid course</span>
              </label>
            </div>

            {formData.isPaid && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded"
                    min="0"
                    step="0.01"
                    required={formData.isPaid}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={creating || updating}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {creating || updating ? <Loader2 className="animate-spin mx-auto" /> : editId ? "Update Course" : "Create Course"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/teacher/courses")}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CourseForm;

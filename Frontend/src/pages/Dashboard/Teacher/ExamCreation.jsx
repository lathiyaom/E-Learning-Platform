import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useCreateExamMutation, useUpdateExamMutation } from "../../../redux/Apis/examApi";
import { Plus, Trash2, Loader2 } from "lucide-react";
import AdminLayout from "../../../utils/Adminlayoute";

const ExamCreation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { user } = useSelector((state) => state.auth);
  const { data: coursesData } = useGetAllCoursesQuery();
  const [createExam, { isLoading: creating }] = useCreateExamMutation();
  const [updateExam, { isLoading: updating }] = useUpdateExamMutation();

  const teacherId = String(user?._id || user?.id || "");
  const myCourses = (coursesData?.data || []).filter(
    (course) =>
      String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
      String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
  );

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: 60,
    totalMarks: 100,
    status: "draft",
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.marks) {
      alert("Please fill question text and marks");
      return;
    }

    if (currentQuestion.type === "mcq" && currentQuestion.options.some((o) => !o)) {
      alert("Please fill all MCQ options");
      return;
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }],
    });

    setCurrentQuestion({
      text: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
    });
  };

  const handleRemoveQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseId || !formData.title || !formData.startDate || !formData.endDate) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      if (editId) {
        await updateExam({ id: editId, ...formData }).unwrap();
        alert("Exam updated successfully!");
      } else {
        await createExam(formData).unwrap();
        alert("Exam created successfully!");
      }
      navigate("/teacher/exams");
    } catch (error) {
      alert("Failed to save exam: " + (error.data?.message || error.message));
    }
  };

  const handlePublishExam = async () => {
    if (!formData.courseId || !formData.title || !formData.startDate || !formData.endDate) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      const examData = { ...formData, status: "published" };
      if (editId) {
        await updateExam({ id: editId, ...examData }).unwrap();
        alert("Exam published successfully!");
      } else {
        await createExam(examData).unwrap();
        alert("Exam published successfully!");
      }
      navigate("/teacher/exams");
    } catch (error) {
      alert("Failed to publish exam: " + (error.data?.message || error.message));
    }
  };

  return (
    <AdminLayout showSearch={false} className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{editId ? "Edit" : "Create"} Exam</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-1">Course *</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Course</option>
              {myCourses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Exam Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Midterm Exam"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows="3"
              placeholder="Exam instructions and details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks *</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Questions Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Questions ({formData.questions.length})</h2>

            {/* Existing Questions */}
            {formData.questions.map((q, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded mb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">
                      Q{index + 1}. {q.text}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {q.type} | Marks: {q.marks}
                    </p>
                    {q.type === "mcq" && (
                      <ul className="text-sm mt-2 space-y-1">
                        {q.options.map((opt, i) => (
                          <li key={i} className={opt === q.correctAnswer ? "text-green-600 font-semibold" : ""}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Question */}
            <div className="bg-blue-50 p-4 rounded space-y-4">
              <h3 className="font-semibold">Add New Question</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <textarea
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="2"
                  placeholder="Enter question"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="short">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Marks</label>
                  <input
                    type="number"
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                    min="1"
                  />
                </div>
              </div>

              {currentQuestion.type === "mcq" && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Options</label>
                    {currentQuestion.options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[i] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        className="w-full px-3 py-2 border rounded"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                    <select
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">Select correct answer</option>
                      {currentQuestion.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} /> Add Question
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={creating || updating}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {creating || updating ? <Loader2 className="animate-spin mx-auto" /> : editId ? "Update Draft" : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={handlePublishExam}
              disabled={creating || updating || formData.questions.length === 0}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {creating || updating ? <Loader2 className="animate-spin mx-auto" /> : "Publish Exam"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/teacher/exams")}
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

export default ExamCreation;

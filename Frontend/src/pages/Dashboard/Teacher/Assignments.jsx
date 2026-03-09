import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Plus,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
} from "lucide-react";
import {
  useGetTeacherAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
} from "../../../redux/Apis/assignmentApi";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { SuccessToster, ErrorToster } from "../../../components/toster";

const Assignments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const [selectedCourse, setSelectedCourse] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // API calls
  const { data: assignmentsData, isLoading, error, refetch } = useGetTeacherAssignmentsQuery({
    courseId: selectedCourse || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    limit: 10,
  });

  const { data: coursesData } = useGetAllCoursesQuery();
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();

  // Filter courses for current teacher
  const courses = coursesData?.data?.filter(course => 
    course.createdBy === user?._id || course.teacher_id === user?._id
  ) || [];

  const assignments = assignmentsData?.data || [];
  const pagination = assignmentsData?.pagination || {};

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAssignment = async (assignmentData) => {
    try {
      await createAssignment(assignmentData).unwrap();
      SuccessToster("Assignment created successfully");
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to create assignment");
    }
  };

  const handleUpdateAssignment = async (assignmentData) => {
    try {
      await updateAssignment({ id: selectedAssignment._id, ...assignmentData }).unwrap();
      SuccessToster("Assignment updated successfully");
      setSelectedAssignment(null);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to update assignment");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteAssignment(assignmentId).unwrap();
        SuccessToster("Assignment deleted successfully");
        refetch();
      } catch (error) {
        ErrorToster(error?.data?.message || "Failed to delete assignment");
      }
    }
  };

  const getStatusColor = (assignment) => {
    if (!assignment.isVisible) return "bg-gray-100 text-gray-800";
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    if (now > dueDate) return "bg-red-100 text-red-800";
    if (dueDate - now < 48 * 60 * 60 * 1000) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (assignment) => {
    if (!assignment.isVisible) return "Draft";
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    if (now > dueDate) return "Overdue";
    if (dueDate - now < 48 * 60 * 60 * 1000) return "Due Soon";
    return "Active";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600">Manage course assignments and track submissions</p>
            </div>
            <button
              onClick={() => {
                setSelectedAssignment(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Assignment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCourse("");
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No assignments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{assignment.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {assignment.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignment.courseId?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 capitalize">
                          {assignment.assignmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(assignment.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment)}`}>
                          {getStatusText(assignment)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignment.submissionCount || 0} submitted
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowCreateModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmissionsModal(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="View Submissions"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Assignment Modal */}
      {showCreateModal && (
        <AssignmentModal
          assignment={selectedAssignment}
          courses={courses}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedAssignment(null);
          }}
          onSubmit={selectedAssignment ? handleUpdateAssignment : handleCreateAssignment}
        />
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <SubmissionsModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowSubmissionsModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

// Assignment Modal Component
const AssignmentModal = ({ assignment, courses, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    instructions: assignment?.instructions || "",
    courseId: assignment?.courseId?._id || "",
    assignmentType: assignment?.assignmentType || "homework",
    maxPoints: assignment?.maxPoints || 100,
    dueDate: assignment?.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : "",
    submissionType: assignment?.submissionType || "text",
    isVisible: assignment?.isVisible !== false,
    allowLateSubmission: assignment?.allowLateSubmission || false,
    latePenaltyPercent: assignment?.latePenaltyPercent || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: new Date(formData.dueDate),
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            {assignment ? "Edit Assignment" : "Create Assignment"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Type
                </label>
                <select
                  name="assignmentType"
                  value={formData.assignmentType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="homework">Homework</option>
                  <option value="project">Project</option>
                  <option value="quiz">Quiz</option>
                  <option value="essay">Essay</option>
                  <option value="presentation">Presentation</option>
                  <option value="lab">Lab</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Points *
                </label>
                <input
                  type="number"
                  name="maxPoints"
                  value={formData.maxPoints}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Type
              </label>
              <select
                name="submissionType"
                value={formData.submissionType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="text">Text Only</option>
                <option value="file">File Upload</option>
                <option value="link">Link</option>
                <option value="multiple">Multiple Types</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Provide detailed instructions for students..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Allow late submissions
                </label>
              </div>

              {formData.allowLateSubmission && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Late Penalty (%)
                  </label>
                  <input
                    type="number"
                    name="latePenaltyPercent"
                    value={formData.latePenaltyPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {assignment ? "Update" : "Create"} Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Submissions Modal Component
const SubmissionsModal = ({ assignment, onClose }) => {
  const { data: submissionsData, isLoading } = useGetAssignmentSubmissionsQuery({
    id: assignment._id,
  });

  const submissions = submissionsData?.data || [];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Submissions</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">{assignment.title}</p>
        </div>
        
        <div className="p-6">
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {submission.studentId?.firstName} {submission.studentId?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      {submission.isLate && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mt-1">
                          Late Submission
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {submission.grade !== null ? (
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {submission.grade}/{submission.maxGrade}
                          </div>
                          <div className="text-sm text-gray-600">
                            {submission.percentage?.toFixed(1)}% - {submission.letterGrade}
                          </div>
                        </div>
                      ) : (
                        <span className="text-yellow-600 font-medium">Not Graded</span>
                      )}
                    </div>
                  </div>
                  
                  {submission.textContent && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{submission.textContent}</p>
                    </div>
                  )}
                  
                  {submission.fileSubmissions?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Files:</p>
                      <div className="space-y-1">
                        {submission.fileSubmissions.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Download size={14} />
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {file.originalName}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {submission.teacherFeedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-800 mb-1">Teacher Feedback:</p>
                      <p className="text-sm text-blue-700">{submission.teacherFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignments;

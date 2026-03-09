import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Eye,
  Download,
  Filter,
  Search,
  Upload,
  ExternalLink,
} from "lucide-react";
import {
  useGetStudentAssignmentsQuery,
  useSubmitAssignmentMutation,
  useGetAssignmentQuery,
} from "../../../redux/Apis/assignmentApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { SuccessToster, ErrorToster } from "../../../components/toster";

const StudentAssignments = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [selectedCourse, setSelectedCourse] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // API calls
  const { data: assignmentsData, isLoading, error, refetch } = useGetStudentAssignmentsQuery({
    courseId: selectedCourse || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    limit: 10,
  });

  const [submitAssignment] = useSubmitAssignmentMutation();
  const { data: assignmentDetails } = useGetAssignmentQuery(selectedAssignment?._id, {
    skip: !selectedAssignment,
  });

  const assignments = assignmentsData?.data || [];
  const pagination = assignmentsData?.pagination || {};

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitAssignment = async (submissionData) => {
    try {
      await submitAssignment({ id: selectedAssignment._id, ...submissionData }).unwrap();
      SuccessToster("Assignment submitted successfully");
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to submit assignment");
    }
  };

  const getStatusColor = (assignment) => {
    if (assignment.submissionStatus === "graded") return "bg-green-100 text-green-800";
    if (assignment.submissionStatus === "submitted") return "bg-blue-100 text-blue-800";
    if (assignment.isOverdue) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (assignment) => {
    if (assignment.submissionStatus === "graded") return "Graded";
    if (assignment.submissionStatus === "submitted") return "Submitted";
    if (assignment.isOverdue) return "Overdue";
    return "Pending";
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

  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff < 0) return "Overdue";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return "Due soon";
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
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600">View and submit your course assignments</p>
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
                {Array.from(new Set(assignments.map(a => a.courseId?.title))).filter(Boolean).map(courseTitle => (
                  <option key={courseTitle} value={courseTitle}>
                    {courseTitle}
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
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="overdue">Overdue</option>
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
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 capitalize">
                              {assignment.assignmentType}
                            </span>
                            <span className="text-xs text-gray-500">
                              • {assignment.maxPoints} points
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignment.courseId?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(assignment.dueDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTimeRemaining(assignment.dueDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment)}`}>
                          {getStatusText(assignment)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {assignment.grade !== null ? (
                          <div>
                            <div className="text-sm font-medium text-green-600">
                              {assignment.grade}/{assignment.maxPoints}
                            </div>
                            <div className="text-xs text-gray-500">
                              {((assignment.grade / assignment.maxPoints) * 100).toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmitModal(true);
                            }}
                            className={`${
                              assignment.submissionStatus === "submitted" || assignment.submissionStatus === "graded"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:text-blue-800"
                            }`}
                            title={
                              assignment.submissionStatus === "submitted" || assignment.submissionStatus === "graded"
                                ? "Already submitted"
                                : "Submit assignment"
                            }
                            disabled={assignment.submissionStatus === "submitted" || assignment.submissionStatus === "graded"}
                          >
                            <Upload size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedAssignment(assignment)}
                            className="text-green-600 hover:text-green-800"
                            title="View details"
                          >
                            <Eye size={16} />
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

        {/* Assignment Details Modal */}
        {selectedAssignment && !showSubmitModal && (
          <AssignmentDetailsModal
            assignment={selectedAssignment}
            onClose={() => setSelectedAssignment(null)}
            onSubmit={() => setShowSubmitModal(true)}
          />
        )}

        {/* Submit Assignment Modal */}
        {showSubmitModal && selectedAssignment && (
          <SubmitAssignmentModal
            assignment={selectedAssignment}
            details={assignmentDetails}
            onClose={() => {
              setShowSubmitModal(false);
            }}
            onSubmit={handleSubmitAssignment}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Assignment Details Modal
const AssignmentDetailsModal = ({ assignment, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{assignment.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">{assignment.courseId?.title}</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{assignment.description}</p>
            </div>

            {assignment.instructions && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
                <p className="text-gray-700">{assignment.instructions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Assignment Type</h3>
                <p className="text-gray-700 capitalize">{assignment.assignmentType}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Max Points</h3>
                <p className="text-gray-700">{assignment.maxPoints}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Due Date</h3>
                <p className="text-gray-700">
                  {new Date(assignment.dueDate).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                <p className="text-gray-700 capitalize">{assignment.submissionStatus || "not_submitted"}</p>
              </div>
            </div>

            {assignment.grade !== null && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Your Grade</h3>
                <div className="text-lg font-semibold text-green-600">
                  {assignment.grade}/{assignment.maxPoints} ({((assignment.grade / assignment.maxPoints) * 100).toFixed(1)}%)
                </div>
              </div>
            )}

            {assignment.allowLateSubmission && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Late Submissions Allowed</p>
                    <p className="text-sm text-yellow-700">
                      Late penalty: {assignment.latePenaltyPercent}% deduction
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            {(assignment.submissionStatus !== "submitted" && assignment.submissionStatus !== "graded") && (
              <button
                onClick={onSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Assignment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Submit Assignment Modal
const SubmitAssignmentModal = ({ assignment, details, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    submissionType: details?.submissionType || "text",
    textContent: "",
    studentNotes: "",
    fileSubmissions: [],
    linkSubmissions: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      fileSubmissions: files.map(file => ({
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // In real app, this would be uploaded to server
        uploadedAt: new Date(),
      })),
    }));
  };

  const addLinkSubmission = () => {
    setFormData(prev => ({
      ...prev,
      linkSubmissions: [...prev.linkSubmissions, { url: "", title: "", description: "" }],
    }));
  };

  const updateLinkSubmission = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      linkSubmissions: prev.linkSubmissions.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const removeLinkSubmission = (index) => {
    setFormData(prev => ({
      ...prev,
      linkSubmissions: prev.linkSubmissions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Submit Assignment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">{assignment.title}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {formData.submissionType === "text" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer *
                </label>
                <textarea
                  name="textContent"
                  value={formData.textContent}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter your assignment response here..."
                />
              </div>
            )}

            {formData.submissionType === "file" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files *
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.ppt,.pptx"
                />
                {formData.fileSubmissions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.fileSubmissions.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={14} />
                        {file.originalName} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.submissionType === "link" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Links *
                </label>
                {formData.linkSubmissions.map((link, index) => (
                  <div key={index} className="border rounded-lg p-3 mb-2">
                    <input
                      type="url"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLinkSubmission(index, "url", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={link.title}
                      onChange={(e) => updateLinkSubmission(index, "title", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={link.description}
                      onChange={(e) => updateLinkSubmission(index, "description", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => removeLinkSubmission(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove Link
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLinkSubmission}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Link
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="studentNotes"
                value={formData.studentNotes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Add any notes for your instructor..."
              />
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentAssignments;

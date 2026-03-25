import React, { useState, useMemo, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
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
  Search,
  X,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  Upload,
  Link2,
  Settings2,
  Send,
  Save,
  RotateCcw,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import {
  useGetTeacherAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
} from "../../../redux/Apis/assignmentApi";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useUploadDocumentMutation, useDeleteFileMutation } from "../../../redux/Apis/uploadApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { SuccessToster, ErrorToster } from "../../../components/toster";

/* reusable components */
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../components/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/Card";
import { Button } from "../../../components/Button";
import { Badge } from "../../../components/Badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../../components/Breadcrumb";

/* ─────────── helpers ─────────── */
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusMeta = (a) => {
  if (!a.isVisible)
    return { label: "Draft", variant: "outline", dot: "#94a3b8" };
  const now = new Date();
  const due = new Date(a.dueDate);
  if (now > due) return { label: "Overdue", variant: "destructive", dot: "#ef4444" };
  if (due - now < 48 * 3600 * 1000)
    return { label: "Due Soon", variant: "secondary", dot: "#f59e0b" };
  return { label: "Active", variant: "default", dot: "#10b981" };
};

const TYPE_COLORS = {
  homework: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  project: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  quiz: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  essay: "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  presentation: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  lab: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
};

/* shared input / label classes */
const INPUT =
  "w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-deep-charcoal border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 focus:border-studprimary dark:focus:border-premium-gold/50 transition-all resize-none";
const LABEL =
  "block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5";

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="relative overflow-hidden bg-white dark:bg-transparent dark:dark-glass border border-[rgba(180,140,76,0.12)] dark:border-white/10 rounded-2xl p-5 flex items-start justify-between group hover:shadow-md transition-all duration-300">
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{ background: `linear-gradient(135deg,${accent}08 0%,transparent 60%)` }}
    />
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
        {value}
      </p>
    </div>
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: accent + "1a" }}
    >
      <Icon size={18} style={{ color: accent }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   SECTION WRAPPER (card-like section)
───────────────────────────────────────────── */
const Section = ({ icon: Icon, title, accent = "#b48c4c", children }) => (
  <div className="bg-white dark:bg-transparent dark:dark-glass border border-[rgba(180,140,76,0.12)] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/10">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent + "18" }}
      >
        <Icon size={16} style={{ color: accent }} />
      </div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─────────────────────────────────────────────
   CUSTOM TOGGLE
───────────────────────────────────────────── */
const Toggle = ({ name, checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 dark:border-white/5 last:border-0">
    <div>
      <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange({ target: { name, type: "checkbox", checked: !checked } })
      }
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-studprimary/40 dark:focus:ring-premium-gold/40 ${
        checked ? "bg-studprimary dark:bg-premium-gold" : "bg-slate-200 dark:bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

/* ─────────────────────────────────────────────
   SUBMISSIONS MODAL
───────────────────────────────────────────── */
const SubmissionsModal = ({ assignment, onClose }) => {
  const { data: submissionsData, isLoading } = useGetAssignmentSubmissionsQuery({
    id: assignment._id,
  });
  const submissions = submissionsData?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1A1B23] rounded-2xl shadow-2xl border border-[rgba(180,140,76,0.15)] dark:border-white/10">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-[#1A1B23] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Users size={17} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Submissions</h2>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{assignment.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-studprimary/20 border-t-studprimary animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <AlertCircle size={26} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  className="border border-slate-100 dark:border-white/10 rounded-xl p-4 bg-slate-50/50 dark:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {sub.studentId?.firstName} {sub.studentId?.lastName}
                        </p>
                        {sub.isLate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            <Clock size={9} /> Late
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submitted {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {sub.grade !== null && sub.grade !== undefined ? (
                        <div>
                          <p className="text-lg font-extrabold text-studprimary dark:text-premium-gold">
                            {sub.grade}
                            <span className="text-sm font-normal text-slate-400">/{sub.maxGrade}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {sub.percentage?.toFixed(1)}% · {sub.letterGrade}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {sub.textContent && (
                    <div className="mt-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10">
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{sub.textContent}</p>
                    </div>
                  )}
                  {sub.fileSubmissions?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {sub.fileSubmissions.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-medium text-studprimary dark:text-premium-gold hover:underline"
                        >
                          <Download size={12} /> {file.originalName}
                        </a>
                      ))}
                    </div>
                  )}
                  {sub.teacherFeedback && (
                    <div className="mt-3 p-3 bg-studprimary/5 dark:bg-premium-gold/5 rounded-lg border-l-2 border-studprimary dark:border-premium-gold">
                      <p className="text-[11px] font-bold text-studprimary dark:text-premium-gold uppercase tracking-wider mb-1">
                        Teacher Feedback
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{sub.teacherFeedback}</p>
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

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const EMPTY_FORM = {
  title: "",
  description: "",
  instructions: "",
  courseId: "",
  assignmentType: "homework",
  maxPoints: 100,
  dueDate: "",
  submissionType: "text",
  isVisible: true,
  allowLateSubmission: false,
  latePenaltyPercent: 0,
};

const Assignments = () => {
  const { user } = useSelector((state) => state.auth || {});

  /* view: "list" | "create" | "edit" */
  const [view, setView] = useState("list");
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submissionsTarget, setSubmissionsTarget] = useState(null);

  /* file upload & links state */
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const fileInputRef = useRef(null);

  /* filters */
  const [selectedCourse, setSelectedCourse] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  /* API */
  const {
    data: assignmentsData,
    isLoading,
    refetch,
  } = useGetTeacherAssignmentsQuery({
    courseId: selectedCourse || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const { data: coursesData } = useGetAllCoursesQuery();
  const [createAssignment, { isLoading: creating }] = useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: updating }] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  const [deleteFile] = useDeleteFileMutation();

  const courses =
    coursesData?.data?.filter(
      (c) =>
        String(c.createdBy?._id || c.createdBy) === String(user?._id || user?.id) ||
        String(c.teacher_id?._id || c.teacher_id) === String(user?._id || user?.id)
    ) || [];

  const assignments = assignmentsData?.data || [];
  const pagination = assignmentsData?.pagination || {};

  const filteredAssignments = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [assignments, searchTerm]
  );

  /* stats */
  const stats = useMemo(() => {
    const all = filteredAssignments;
    return {
      total: pagination.total || all.length,
      active: all.filter((a) => a.isVisible && new Date() <= new Date(a.dueDate)).length,
      drafts: all.filter((a) => !a.isVisible).length,
      submissions: all.reduce((s, a) => s + (a.submissionCount || 0), 0),
    };
  }, [filteredAssignments, pagination.total]);

  /* form helpers */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingAssignment(null);
    setUploadedFiles([]);
    setExternalLinks([]);
    setShowLinkInput(false);
    setLinkInputValue("");
    setView("create");
  };

  const openEdit = (a) => {
    setFormData({
      title: a.title || "",
      description: a.description || "",
      instructions: a.instructions || "",
      courseId: a.courseId?._id || "",
      assignmentType: a.assignmentType || "homework",
      maxPoints: a.maxPoints || 100,
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : "",
      submissionType: a.submissionType || "text",
      isVisible: a.isVisible !== false,
      allowLateSubmission: a.allowLateSubmission || false,
      latePenaltyPercent: a.latePenaltyPercent || 0,
    });

    // ── Restore previously saved attachments ──
    const savedAttachments = a.attachments || [];
    // Re-hydrate file entries (already on Cloudinary — no re-upload needed)
    const restoredFiles = savedAttachments
      .filter((att) => att.attachmentType === "file" || !att.attachmentType)
      .map((att) => ({
        id: att.publicId || att._id || att.url,
        name: att.name,
        size: att.size || 0,
        url: att.url,
        publicId: att.publicId || null,
        uploading: false,
      }));
    // Re-hydrate external links
    const restoredLinks = savedAttachments
      .filter((att) => att.attachmentType === "link")
      .map((att) => ({
        id: att._id || att.url,
        url: att.url,
        label: att.name || att.url,
      }));

    setUploadedFiles(restoredFiles);
    setExternalLinks(restoredLinks);
    setShowLinkInput(false);
    setLinkInputValue("");
    setEditingAssignment(a);
    setView("edit");
  };

  const handleDiscard = () => {
    setFormData(EMPTY_FORM);
    setEditingAssignment(null);
    setUploadedFiles([]);
    setExternalLinks([]);
    setShowLinkInput(false);
    setLinkInputValue("");
    setView("list");
  };

  /* Build attachments array from current state to send in payload */
  const buildAttachmentsPayload = () => [
    ...uploadedFiles
      .filter((f) => !f.uploading && f.url)  // only successfully uploaded
      .map((f) => ({
        url: f.url,
        publicId: f.publicId || undefined,
        name: f.name,
        size: f.size || 0,
        attachmentType: "file",
      })),
    ...externalLinks.map((l) => ({
      url: l.url,
      name: l.label || l.url,
      attachmentType: "link",
    })),
  ];

  const handlePublish = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      dueDate: new Date(formData.dueDate),
      isVisible: true,
      attachments: buildAttachmentsPayload(),
    };
    await submitForm(payload, "published");
  };

  const handleSaveDraft = async () => {
    const payload = {
      ...formData,
      dueDate: new Date(formData.dueDate),
      isVisible: false,
      attachments: buildAttachmentsPayload(),
    };
    await submitForm(payload, "draft");
  };

  const submitForm = async (payload, kind) => {
    try {
      if (view === "edit" && editingAssignment) {
        await updateAssignment({ id: editingAssignment._id, ...payload }).unwrap();
        SuccessToster("Assignment updated successfully");
      } else {
        await createAssignment(payload).unwrap();
        SuccessToster(`Assignment ${kind === "draft" ? "saved as draft" : "published"} successfully`);
      }
      setView("list");
      setEditingAssignment(null);
      refetch();
    } catch (err) {
      ErrorToster(err?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment? This cannot be undone.")) return;
    try {
      await deleteAssignment(id).unwrap();
      SuccessToster("Assignment deleted");
      refetch();
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to delete");
    }
  };

  /* file upload helpers — wired to Cloudinary /Upload/document */
  const handleFilesAdded = useCallback(async (files) => {
    const fileArray = Array.from(files);
    for (const f of fileArray) {
      // Optimistic local entry while uploading
      const tempId = `temp-${f.name}-${Date.now()}`;
      setUploadedFiles((prev) => [
        ...prev,
        { id: tempId, name: f.name, size: f.size, uploading: true, url: null, publicId: null },
      ]);
      try {
        const fd = new FormData();
        fd.append("document", f);
        const result = await uploadDocument(fd).unwrap();
        const { url, publicId, name, size } = result.data;
        // Replace optimistic entry with real data
        setUploadedFiles((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { id: publicId || tempId, name: name || f.name, size: size || f.size, url, publicId, uploading: false }
              : item
          )
        );
      } catch (err) {
        // Remove failed entry
        setUploadedFiles((prev) => prev.filter((item) => item.id !== tempId));
        ErrorToster(`Failed to upload "${f.name}": ${err?.data?.message || "Upload error"}`);
      }
    }
  }, [uploadDocument]);

  const removeFile = async (item) => {
    if (item.publicId) {
      try { await deleteFile(item.publicId).unwrap(); } catch (_) {}
    }
    setUploadedFiles((prev) => prev.filter((f) => f.id !== item.id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFilesAdded(e.dataTransfer.files);
  };

  /* external link helpers */
  const addExternalLink = () => {
    const trimmed = linkInputValue.trim();
    if (!trimmed) return;
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    setExternalLinks((prev) => [
      ...prev,
      { id: `${Date.now()}`, url, label: trimmed },
    ]);
    setLinkInputValue("");
    setShowLinkInput(false);
  };
  const removeLink = (id) =>
    setExternalLinks((prev) => prev.filter((l) => l.id !== id));

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* derived summary data for sidebar */
  const selectedCourseName =
    courses.find((c) => c._id === formData.courseId)?.title || "—";

  /* ── ISLoading ── */
  if (isLoading && view === "list") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-studprimary/20 border-t-studprimary animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading…</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  /* ══════════════════════════════════════
     CREATE / EDIT VIEW
  ══════════════════════════════════════ */
  if (view === "create" || view === "edit") {
    const isEdit = view === "edit";
    const saving = creating || updating;

    return (
      <AdminLayout>
        <div className="p-4 md:p-6 space-y-5 min-h-full bg-background-light dark:bg-transparent">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to="/teacher/assignments">Assignments</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{isEdit ? "Edit Assignment" : "Create New"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isEdit ? "Edit Assignment" : "Create Assignment"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEdit
                ? "Update the assignment details below."
                : "Design a comprehensive task for your students with rich resources and clear objectives."}
            </p>
          </div>

          {/* Two-column layout */}
          <form onSubmit={handlePublish}>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
              {/* ── LEFT COLUMN ── */}
              <div className="space-y-5">
                {/* Assignment Overview */}
                <Section icon={ClipboardList} title="Assignment Overview">
                  <div className="space-y-4">
                    <div>
                      <label className={LABEL}>
                        Assignment Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., The Industrial Revolution: Impact on Urban Planning"
                        className={INPUT}
                      />
                    </div>

                    <div>
                      <label className={LABEL}>
                        Detailed Instructions <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Provide clear, step-by-step instructions for your students…"
                        className={INPUT}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}>
                          Target Course <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="courseId"
                          value={formData.courseId}
                          onChange={handleChange}
                          required
                          className={INPUT}
                        >
                          <option value="">Select course…</option>
                          {courses.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={LABEL}>Category / Type</label>
                        <select
                          name="assignmentType"
                          value={formData.assignmentType}
                          onChange={handleChange}
                          className={INPUT}
                        >
                          {["homework", "project", "quiz", "essay", "presentation", "lab", "other"].map(
                            (t) => (
                              <option key={t} value={t} className="capitalize">
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}>
                          Max Points <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="maxPoints"
                          value={formData.maxPoints}
                          onChange={handleChange}
                          required
                          min="1"
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className={LABEL}>
                          Due Date &amp; Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          required
                          className={INPUT}
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Learning Materials */}
                <Section icon={Upload} title="Learning Materials" accent="#6366f1">
                  <div className="space-y-4">
                    <div>
                      <label className={LABEL}>Submission Type</label>
                      <select
                        name="submissionType"
                        value={formData.submissionType}
                        onChange={handleChange}
                        className={INPUT}
                      >
                        <option value="text">Text Only</option>
                        <option value="file">File Upload</option>
                        <option value="link">Link / URL</option>
                        <option value="multiple">Multiple Types</option>
                      </select>
                    </div>

                    {/* ── File Upload Zone ── */}
                    <div>
                      <label className={LABEL}>Attach Files</label>
                      {/* Hidden native file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        className="hidden"
                        onChange={(e) => e.target.files?.length && handleFilesAdded(e.target.files)}
                      />

                      {/* Drop zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                          isDragging
                            ? "border-studprimary dark:border-premium-gold bg-studprimary/5 dark:bg-premium-gold/5 scale-[1.01]"
                            : "border-slate-200 dark:border-white/10 hover:border-studprimary/50 dark:hover:border-premium-gold/40 hover:bg-slate-50/60 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isDragging ? "bg-studprimary/15 dark:bg-premium-gold/15" : "bg-studprimary/10 dark:bg-white/5"
                        }`}>
                          {isUploading ? (
                            <div className="w-5 h-5 rounded-full border-2 border-studprimary/30 border-t-studprimary dark:border-premium-gold/30 dark:border-t-premium-gold animate-spin" />
                          ) : (
                            <Upload size={20} className="text-studprimary dark:text-premium-gold" />
                          )}
                        </div>
                        <div className="text-center pointer-events-none">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {isDragging ? "Drop files here" : "Click to upload or drag & drop"}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            PDF, DOCX, XLSX, PPTX, TXT (max 10 MB each)
                          </p>
                        </div>
                      </div>

                      {/* Uploaded file list */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {uploadedFiles.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0">
                                  {f.uploading ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-studprimary/30 border-t-studprimary animate-spin" />
                                  ) : (
                                    <Paperclip size={13} className="text-studprimary dark:text-premium-gold" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{f.name}</p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                    {f.uploading ? "Uploading…" : formatFileSize(f.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {f.url && (
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-studprimary dark:hover:text-premium-gold transition-colors"
                                    title="Preview"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeFile(f); }}
                                  disabled={f.uploading}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                                  title="Remove"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── External Link ── */}
                    <div>
                      <label className={LABEL}>Embed External Link</label>
                      <div className="space-y-2">
                        {/* Add link button / input */}
                        {showLinkInput ? (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              <input
                                type="url"
                                value={linkInputValue}
                                onChange={(e) => setLinkInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExternalLink())}
                                placeholder="https://youtube.com/watch?v=…"
                                autoFocus
                                className={`${INPUT} pl-9`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={addExternalLink}
                              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowLinkInput(false); setLinkInputValue(""); }}
                              className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowLinkInput(true)}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-400/50 dark:hover:border-indigo-400/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                              <Link2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-slate-800 dark:text-white">Embed External Link</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">YouTube, Drive, or any web URL</p>
                            </div>
                          </button>
                        )}

                        {/* Link list */}
                        {externalLinks.length > 0 && (
                          <div className="space-y-2">
                            {externalLinks.map((link) => (
                              <div
                                key={link.id}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                    <Link2 size={12} className="text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                                  >
                                    {link.label}
                                  </a>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeLink(link.id)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                  title="Remove"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={LABEL}>Instructions (Optional)</label>
                      <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Provide additional step-by-step instructions for students…"
                        className={INPUT}
                      />
                    </div>
                  </div>
                </Section>

                {/* Submission Settings */}
                <Section icon={Settings2} title="Submission Settings" accent="#10b981">
                  <div>
                    <Toggle
                      name="isVisible"
                      checked={formData.isVisible}
                      onChange={handleChange}
                      label="Publish Immediately"
                      description="Make this assignment visible to students right away"
                    />
                    <Toggle
                      name="allowLateSubmission"
                      checked={formData.allowLateSubmission}
                      onChange={handleChange}
                      label="Allow Late Submissions"
                      description="Students can submit after the deadline with a point penalty"
                    />
                    {formData.allowLateSubmission && (
                      <div className="pt-3 pl-2">
                        <label className={LABEL}>Late Penalty (%)</label>
                        <input
                          type="number"
                          name="latePenaltyPercent"
                          value={formData.latePenaltyPercent}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          className={`${INPUT} max-w-[160px]`}
                        />
                      </div>
                    )}
                  </div>
                </Section>
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <div className="space-y-4 xl:sticky xl:top-6">
                {/* Assignment Summary */}
                <div className="bg-studprimary dark:bg-premium-gold rounded-2xl overflow-hidden shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/15">
                  <div className="px-5 py-4 border-b border-white/20">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                      Assignment Summary
                    </p>
                    <p className="text-[11px] text-white/60 mt-0.5">Review before publishing</p>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Points</span>
                      <span className="text-sm font-bold text-white bg-white/20 px-3 py-1 rounded-full">
                        {formData.maxPoints}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Due Date</span>
                      <span className="text-xs font-semibold text-white text-right">
                        {formData.dueDate
                          ? new Date(formData.dueDate).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Course</span>
                      <span className="text-xs font-semibold text-white text-right max-w-[150px] truncate">
                        {selectedCourseName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Type</span>
                      <span className="text-xs font-semibold text-white capitalize">{formData.assignmentType}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="px-5 pb-5 space-y-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-studprimary dark:text-deep-charcoal bg-white hover:bg-white/90 shadow transition-all disabled:opacity-60"
                    >
                      <Send size={15} />
                      {saving ? "Saving…" : isEdit ? "Update Assignment" : "Publish Assignment"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveDraft}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-white/20 hover:bg-white/30 transition-all disabled:opacity-60"
                    >
                      <Save size={15} />
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscard}
                      className="w-full text-center text-xs text-white/60 hover:text-white transition-colors py-1"
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>

                {/* Scheduling hint */}
                <div className="bg-white dark:bg-transparent dark:dark-glass border border-[rgba(180,140,76,0.12)] dark:border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={15} className="text-studprimary dark:text-premium-gold" />
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Scheduling</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Want to release this later? Set the due date and save as draft — publish when ready.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </AdminLayout>
    );
  }

  /* ══════════════════════════════════════
     LIST VIEW
  ══════════════════════════════════════ */
  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6 min-h-full bg-background-light dark:bg-transparent">
        {/* breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Assignments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-studprimary dark:bg-premium-gold" />
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Assignments
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 pl-3">
              Manage course assignments and track submissions
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-studprimary dark:bg-premium-gold dark:text-deep-charcoal shadow-md shadow-studprimary/25 dark:shadow-premium-gold/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studprimary"
          >
            <Plus size={18} />
            Create Assignment
          </button>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total" value={stats.total} accent="#b48c4c" />
          <StatCard icon={CheckCircle} label="Active" value={stats.active} accent="#10b981" />
          <StatCard icon={Clock} label="Drafts" value={stats.drafts} accent="#64748b" />
          <StatCard icon={TrendingUp} label="Submissions" value={stats.submissions} accent="#6366f1" />
        </div>

        {/* filter bar */}
        <div className="bg-white dark:bg-transparent dark:dark-glass border border-[rgba(180,140,76,0.12)] dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            {/* search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search assignments…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-deep-charcoal border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 focus:border-studprimary dark:focus:border-premium-gold/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* course */}
            <select
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-deep-charcoal border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 focus:border-studprimary dark:focus:border-premium-gold/50 transition-all min-w-[160px]"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>

            {/* status */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-deep-charcoal border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 focus:border-studprimary dark:focus:border-premium-gold/50 transition-all min-w-[130px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* clear */}
            {(selectedCourse || statusFilter !== "all" || searchTerm) && (
              <button
                onClick={() => { setSelectedCourse(""); setStatusFilter("all"); setSearchTerm(""); setCurrentPage(1); }}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-studprimary dark:text-premium-gold border border-studprimary/30 dark:border-premium-gold/30 rounded-xl hover:bg-studprimary/5 dark:hover:bg-premium-gold/5 transition-all whitespace-nowrap"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="shadow-sm rounded-2xl overflow-hidden border border-[rgba(180,140,76,0.12)] dark:border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60 dark:bg-white/5">
                <TableHead className="pl-5">Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        <FileText size={26} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        No assignments found
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Adjust your filters or create a new assignment
                      </p>
                      <button
                        onClick={openCreate}
                        className="mt-1 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-studprimary dark:bg-premium-gold dark:text-deep-charcoal rounded-xl shadow-sm hover:brightness-110 transition-all"
                      >
                        <Plus size={15} /> Create Assignment
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((a) => {
                  const status = getStatusMeta(a);
                  return (
                    <TableRow key={a._id}>
                      <TableCell className="pl-5 max-w-[220px]">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <BookOpen size={14} className="text-studprimary dark:text-premium-gold" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{a.title}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">{a.description}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[140px]">
                        <span className="text-sm truncate block">{a.courseId?.title || "—"}</span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            TYPE_COLORS[a.assignmentType] ||
                            "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                          }`}
                        >
                          {a.assignmentType}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="text-xs whitespace-nowrap">{formatDate(a.dueDate)}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            status.label === "Active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : status.label === "Overdue"
                              ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : status.label === "Due Soon"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: status.dot }}
                          />
                          {status.label}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className="text-slate-400" />
                          <span className="text-sm font-semibold">{a.submissionCount || 0}</span>
                        </div>
                      </TableCell>

                      <TableCell className="pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(a)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-studprimary dark:hover:text-premium-gold hover:bg-studprimary/10 dark:hover:bg-premium-gold/10 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setSubmissionsTarget(a)}
                            title="View Submissions"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* ── PAGINATION ── */}
          {pagination.pages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {(currentPage - 1) * pagination.limit + 1}–
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pagination.total}
                </span>{" "}
                assignments
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronRight size={14} className="rotate-180" />
                </Button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === pagination.pages ||
                      Math.abs(p - currentPage) <= 1
                  )
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span
                        key={`d-${i}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          currentPage === p
                            ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal shadow-sm"
                            : "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="h-8 w-8 p-0 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submissions Modal */}
      {submissionsTarget && (
        <SubmissionsModal
          assignment={submissionsTarget}
          onClose={() => setSubmissionsTarget(null)}
        />
      )}
    </AdminLayout>
  );
};

export default Assignments;

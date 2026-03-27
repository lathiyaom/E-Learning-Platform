import React, { useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Upload,
  File as FileIcon,
  FileVideo,
  FileText,
  Trash2,
  Loader2,
  Download,
  BookOpen,
  FolderOpen,
  Search,
  X,
  ChevronDown,
  FilePlus2,
  Layers,
  ExternalLink,
  Film,
} from "lucide-react";
// import AdminLayout from "../../../utils/AdminlayouteNew";
import AdminLayout from "../../../utils/Adminlayoute";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import { useGetAllCoursesQuery } from "../../../redux";
import {
  useGetCourseMaterialsQuery,
  useUploadMaterialMutation,
  useDeleteMaterialMutation,
} from "../../../redux/Apis/materialApi";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../../components/Breadcrumb";

/* ─── Design tokens (same as Admin Dashboard + Assignments) ─── */
const CARD =
  "bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm";
const LABEL =
  "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";
const INPUT =
  "w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-deep-charcoal border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 focus:border-studprimary dark:focus:border-premium-gold/50 transition-all";

/* ─── File-type helpers ─── */
const FILE_META = {
  video: {
    icon: FileVideo,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    label: "Video",
  },
  pdf: {
    icon: FileText,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    label: "PDF",
  },
  document: {
    icon: FileIcon,
    color: "text-studprimary dark:text-premium-gold",
    bg: "bg-studprimary/10 dark:bg-premium-gold/10",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    label: "Document",
  },
};
const getMeta = (type) => FILE_META[type] || FILE_META.document;

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/* ═══════════════════════ STAT CARD ═══════════════════════ */
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div
    className={`${CARD} p-5 flex items-start gap-4 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: accent + "18" }}
    >
      <Icon size={20} style={{ color: accent }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  </div>
);

/* ═══════════════════════ MATERIAL CARD ═══════════════════════ */
const MaterialCard = ({ mat, onDelete, isDeleting }) => {
  const meta = getMeta(mat.type);
  const Icon = meta.icon;
  return (
    <div
      className={`${CARD} p-5 flex flex-col group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
    >
      {/* top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={meta.color} />
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.badge}`}
          >
            {meta.label}
          </span>
          <button
            onClick={() => onDelete(mat._id)}
            disabled={isDeleting}
            aria-label="Delete material"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* title + description */}
      <h3 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1 mb-1">
        {mat.title}
      </h3>
      {mat.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
          {mat.description}
        </p>
      )}

      {/* footer */}
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {formatSize(mat.file_size)} •{" "}
          {new Date(mat.createdAt).toLocaleDateString()}
        </span>
        <a
          href={mat.file_url}
          target="_blank"
          rel="noreferrer"
          aria-label="View or download"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-studprimary dark:text-premium-gold hover:text-studprimary/80 dark:hover:text-premium-gold/80 transition-colors"
        >
          <Download size={12} />
          View / DL
        </a>
      </div>
    </div>
  );
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const TeacherMaterials = () => {
  const { user } = useSelector((state) => state.auth || {});
  const teacherId = String(user?._id || user?.id || "");

  /* state */
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [materialForm, setMaterialForm] = useState({ title: "", description: "" });
  const fileInputRef = useRef(null);

  /* RTK queries */
  const { data: coursesData } = useGetAllCoursesQuery();
  const {
    data: materialsData,
    isLoading: isLoadingMaterials,
    refetch,
  } = useGetCourseMaterialsQuery(selectedCourseId, { skip: !selectedCourseId });
  const [uploadMaterial] = useUploadMaterialMutation();
  const [deleteMaterial, { isLoading: isDeleting }] = useDeleteMaterialMutation();

  /* derived */
  const myCourses =
    coursesData?.data?.filter(
      (c) =>
        String(c?.createdBy?._id || c?.createdBy || "") === teacherId ||
        String(c?.teacher_id?._id || c?.teacher_id || "") === teacherId
    ) || [];

  const allMaterials = materialsData?.data || [];
  const filteredMaterials = allMaterials.filter((m) =>
    m.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const videoCount = allMaterials.filter((m) => m.type === "video").length;
  const docCount = allMaterials.filter((m) => m.type !== "video").length;
  const selectedCourse = myCourses.find(
    (c) => (c._id || c.id) === selectedCourseId
  );

  /* drag & drop */
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFileToUpload(f);
  }, []);

  /* upload */
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return ErrorToster("Please select a course first");
    if (!fileToUpload) return ErrorToster("Please choose a file to upload");

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append("file", fileToUpload);
      fd.append("course_id", selectedCourseId);
      fd.append("title", materialForm.title || fileToUpload.name);
      fd.append("description", materialForm.description);

      const mime = fileToUpload.type;
      let type = "document";
      if (mime.startsWith("video/")) type = "video";
      else if (mime.includes("pdf")) type = "pdf";
      fd.append("type", type);
      fd.append("is_downloadable", true);

      await uploadMaterial(fd).unwrap();
      SuccessToster("Material uploaded successfully");
      setFileToUpload(null);
      setMaterialForm({ title: "", description: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      refetch();
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to upload material");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material? This cannot be undone.")) return;
    try {
      await deleteMaterial({ id, course_id: selectedCourseId }).unwrap();
      SuccessToster("Material deleted");
    } catch (err) {
      ErrorToster(err?.data?.message || "Failed to delete material");
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6 min-h-full bg-background-light dark:bg-transparent">

        {/* ── Breadcrumb ── */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/teacher/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Materials</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ── Page Header ── */}
        <div className={`${CARD} p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0">
              <Layers size={22} className="text-studprimary dark:text-premium-gold" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                Course Materials
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage and upload resources for your students
              </p>
            </div>
          </div>

          {/* Course selector */}
          <div className="relative md:w-72">
            <BookOpen
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={selectedCourseId}
              onChange={(e) => { setSelectedCourseId(e.target.value); setSearchTerm(""); }}
              className={`${INPUT} pl-9 pr-9 appearance-none cursor-pointer`}
            >
              <option value="" disabled>
                Select a course…
              </option>
              {myCourses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* ── If no course selected ── */}
        {!selectedCourseId ? (
          <div className={`${CARD} p-12 md:p-20 flex flex-col items-center text-center gap-4`}>
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <FolderOpen size={30} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-600 dark:text-slate-300">
                No course selected
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                Select one of your courses above to view and upload learning materials.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Layers} label="Total Materials" value={allMaterials.length} accent="#b48c4c" />
              <StatCard icon={Film} label="Videos" value={videoCount} accent="#3b82f6" />
              <StatCard icon={FileText} label="Documents" value={docCount} accent="#ef4444" />
              <StatCard icon={BookOpen} label="Course" value={selectedCourse?.title?.split(" ")[0] || "—"} accent="#10b981" />
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* ── Upload Panel ── */}
              <div className={`${CARD} p-5 md:p-6 space-y-5`}>
                {/* header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center">
                    <FilePlus2 size={16} className="text-studprimary dark:text-premium-gold" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    Upload New Material
                  </h2>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className={LABEL}>Material Title</label>
                    <input
                      type="text"
                      value={materialForm.title}
                      onChange={(e) =>
                        setMaterialForm({ ...materialForm, title: e.target.value })
                      }
                      placeholder="E.g. Lecture 1 — Introduction"
                      className={INPUT}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={LABEL}>Description (Optional)</label>
                    <textarea
                      value={materialForm.description}
                      onChange={(e) =>
                        setMaterialForm({ ...materialForm, description: e.target.value })
                      }
                      placeholder="Brief summary of this material…"
                      rows={3}
                      className={INPUT}
                    />
                  </div>

                  {/* Drop zone */}
                  <div>
                    <label className={LABEL}>File</label>
                    <input
                      ref={fileInputRef}
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,image/*"
                      onChange={(e) =>
                        e.target.files?.[0] && setFileToUpload(e.target.files[0])
                      }
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? "border-studprimary dark:border-premium-gold bg-studprimary/5 dark:bg-premium-gold/5 scale-[1.01]"
                          : "border-slate-200 dark:border-white/10 hover:border-studprimary/50 dark:hover:border-premium-gold/40 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isDragging
                            ? "bg-studprimary/15 dark:bg-premium-gold/15"
                            : "bg-studprimary/10 dark:bg-white/5"
                        }`}
                      >
                        {isUploading ? (
                          <div className="w-5 h-5 rounded-full border-2 border-studprimary/30 border-t-studprimary dark:border-premium-gold/30 dark:border-t-premium-gold animate-spin" />
                        ) : (
                          <Upload size={20} className="text-studprimary dark:text-premium-gold" />
                        )}
                      </div>
                      <div className="text-center pointer-events-none">
                        {fileToUpload ? (
                          <>
                            <p className="text-sm font-semibold text-studprimary dark:text-premium-gold truncate max-w-[180px]">
                              {fileToUpload.name}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {formatSize(fileToUpload.size)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {isDragging ? "Drop file here" : "Click or drag & drop"}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              Video, PDF, DOCX, PPTX (max 100 MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Clear file */}
                    {fileToUpload && !isUploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setFileToUpload(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={12} /> Clear file
                      </button>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isUploading || !fileToUpload}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-studprimary dark:bg-premium-gold dark:text-deep-charcoal hover:brightness-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        Upload Material
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* ── Materials List ── */}
              <div className="lg:col-span-2 space-y-4">

                {/* Search bar */}
                {allMaterials.length > 0 && (
                  <div className={`${CARD} p-3`}>
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search materials…"
                        className={`${INPUT} pl-9 ${searchTerm ? "pr-9" : ""}`}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                {isLoadingMaterials ? (
                  <div className={`${CARD} flex items-center justify-center py-20`}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-studprimary/20 border-t-studprimary dark:border-premium-gold/20 dark:border-t-premium-gold animate-spin" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Loading materials…</p>
                    </div>
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMaterials.map((mat) => (
                      <MaterialCard
                        key={mat._id}
                        mat={mat}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={`${CARD} flex flex-col items-center text-center gap-4 py-16 px-6`}>
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      {searchTerm ? (
                        <Search size={26} className="text-slate-300 dark:text-slate-600" />
                      ) : (
                        <FileIcon size={26} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {searchTerm ? `No results for "${searchTerm}"` : "No materials yet"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                        {searchTerm
                          ? "Try a different search term."
                          : "Use the upload panel to add your first material for this course."}
                      </p>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-xs font-semibold text-studprimary dark:text-premium-gold hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}

                {/* Count footer */}
                {filteredMaterials.length > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 px-1">
                    Showing{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {filteredMaterials.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {allMaterials.length}
                    </span>{" "}
                    materials
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherMaterials;

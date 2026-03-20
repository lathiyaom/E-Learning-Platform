import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Upload, File as FileIcon, FileVideo, FileText, Trash2, Edit2, PlayCircle, Loader2, Download } from "lucide-react";
import AdminLayout from "../../../utils/AdminlayouteNew";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import { useGetAllCoursesQuery } from "../../../redux";
import { 
  useGetCourseMaterialsQuery, 
  useUploadMaterialMutation, 
  useDeleteMaterialMutation 
} from "../../../redux/Apis/materialApi";

const TeacherMaterials = () => {
  const { user } = useSelector((state) => state.auth || {});
  const teacherId = String(user?._id || user?.id || "");
  
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
  });

  // Queries & Mutations
  const { data: coursesData, isLoading: isLoadingCourses } = useGetAllCoursesQuery();
  const { data: materialsData, isLoading: isLoadingMaterials, refetch } = useGetCourseMaterialsQuery(selectedCourseId, {
    skip: !selectedCourseId
  });
  const [uploadMaterial] = useUploadMaterialMutation();
  const [deleteMaterial, { isLoading: isDeleting }] = useDeleteMaterialMutation();

  // Filter courses created by this teacher
  const myCourses = coursesData?.data?.filter(
    (course) =>
      String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
      String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
  ) || [];

  const materials = materialsData?.data || [];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      ErrorToster("Please select a course first");
      return;
    }
    if (!fileToUpload) {
      ErrorToster("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("course_id", selectedCourseId);
      formData.append("title", materialForm.title || fileToUpload.name);
      formData.append("description", materialForm.description);
      
      // Determine type
      const mime = fileToUpload.type;
      let type = "document";
      if (mime.startsWith("video/")) type = "video";
      else if (mime.includes("pdf")) type = "pdf";
      
      formData.append("type", type);
      formData.append("is_downloadable", true);

      await uploadMaterial(formData).unwrap();
      
      SuccessToster("Material uploaded successfully");
      setFileToUpload(null);
      setMaterialForm({ title: "", description: "" });
      if (document.getElementById("file-upload-input")) {
         document.getElementById("file-upload-input").value = "";
      }
      refetch();
    } catch (err) {
      console.error(err);
      ErrorToster(err?.data?.message || err?.message || "Failed to upload material");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteMaterial({ id: materialId, course_id: selectedCourseId }).unwrap();
        SuccessToster("Material deleted");
      } catch (err) {
        ErrorToster(err?.data?.message || "Failed to delete material");
      }
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "Materials", href: "/teacher/materials", isCurrent: true },
  ];

  return (
    <AdminLayout breadcrumbItems={breadcrumbItems}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Course Materials
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and upload resources for your courses.
            </p>
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-auto">
             <select
               value={selectedCourseId}
               onChange={(e) => setSelectedCourseId(e.target.value)}
               className="w-full md:w-64 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#b48c4c]/20 outline-none"
             >
               <option value="" disabled>Select a course...</option>
               {myCourses.map((course) => (
                 <option key={course._id || course.id} value={course._id || course.id}>
                   {course.title}
                 </option>
               ))}
             </select>
          </div>
        </div>

        {selectedCourseId ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upload Area */}
            <div className="col-span-1 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col h-max">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Upload New Material</h2>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Material Title
                  </label>
                  <input
                    type="text"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#b48c4c]/20"
                    placeholder="E.g. Lecture 1 Notes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#b48c4c]/20"
                    placeholder="Brief description of the content..."
                    rows={3}
                  />
                </div>
                
                <div className="pt-2">
                  <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <Upload className="w-8 h-8 text-[#b48c4c] mb-2" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                      {fileToUpload ? fileToUpload.name : "Click to select a file"}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Video, PDF, DOCX (Max 100MB)
                    </span>
                  </label>
                  <input 
                    id="file-upload-input"
                    type="file" 
                    onChange={handleFileChange} 
                    className="hidden"
                    accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,image/*"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !fileToUpload}
                  className="w-full mt-4 flex justify-center items-center py-3 px-4 rounded-xl bg-[#b48c4c] hover:bg-[#a37c40] text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Material"
                  )}
                </button>
              </form>
            </div>

            {/* List Area */}
            <div className="col-span-1 lg:col-span-2 space-y-4">
               {isLoadingMaterials ? (
                 <div className="flex justify-center py-20">
                   <Loader2 className="w-8 h-8 text-[#b48c4c] animate-spin" />
                 </div>
               ) : materials.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {materials.map((mat) => (
                     <div key={mat._id} className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                       <div className="flex items-start justify-between mb-4">
                         <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                           {mat.type === "video" ? (
                             <FileVideo className="w-6 h-6 text-blue-500" />
                           ) : mat.type === "pdf" ? (
                             <FileText className="w-6 h-6 text-red-500" />
                           ) : (
                             <FileIcon className="w-6 h-6 text-gray-500" />
                           )}
                         </div>
                         <button 
                           onClick={() => handleDelete(mat._id)}
                           className="text-slate-400 hover:text-red-500 transition p-1"
                           title="Delete Material"
                           disabled={isDeleting}
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                       <h3 className="font-semibold text-slate-800 dark:text-white mb-1 line-clamp-1">
                         {mat.title}
                       </h3>
                       {mat.description && (
                         <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                           {mat.description}
                         </p>
                       )}
                       <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                         <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                           {(mat.file_size / (1024 * 1024)).toFixed(2)} MB • {new Date(mat.createdAt).toLocaleDateString()}
                         </span>
                         <a 
                           href={mat.file_url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="text-[#b48c4c] hover:text-[#a37c40] transition flex items-center text-sm font-semibold"
                         >
                           <Download className="w-4 h-4 mr-1" /> View/DL
                         </a>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl text-center">
                   <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-4">
                     <FileIcon className="w-8 h-8 text-slate-400" />
                   </div>
                   <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                     No Materials Found
                   </h3>
                   <p className="text-sm text-slate-500 max-w-sm">
                     You haven't uploaded any materials for this course yet. Use the form to your left to add your first material.
                   </p>
                 </div>
               )}
            </div>
            
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
              Please select a course to view or upload materials.
            </h3>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherMaterials;

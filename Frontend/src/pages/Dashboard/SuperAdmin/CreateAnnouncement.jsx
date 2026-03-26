import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Megaphone, 
  Send, 
  Users, 
  ShieldAlert, 
  GraduationCap, 
  UserRound, 
  Building,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowLeft
} from "lucide-react";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import { useCreateAnnouncementMutation, useGetAllTenantsQuery } from "../../../redux/Apis/superAdminApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";
import { motion, AnimatePresence } from "framer-motion";

const AudienceCard = ({ id, label, icon: Icon, description, isActive, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(id)}
    className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 gap-3 group
      ${isActive 
        ? "border-superadminprimary bg-superadminprimary/5 shadow-lg shadow-superadminprimary/10" 
        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-superadminprimary/30"
      }
    `}
  >
    <div className={`p-3 rounded-xl transition-all duration-300 
      ${isActive ? "bg-superadminprimary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-superadminprimary"}
    `}>
      <Icon className="h-6 w-6" />
    </div>
    <div className="text-center">
      <h3 className={`text-sm font-bold ${isActive ? "text-superadminprimary" : "text-slate-600 dark:text-slate-300"}`}>
        {label}
      </h3>
      <p className="text-[11px] text-slate-400 mt-1 leading-tight">{description}</p>
    </div>
    {isActive && (
      <div className="absolute top-3 right-3">
        <CheckCircle2 className="h-4 w-4 text-superadminprimary" />
      </div>
    )}
  </button>
);

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const { data: tenantsData } = useGetAllTenantsQuery();
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "all",
    tenantId: "",
    priority: "medium"
  });

  const audiences = [
    { id: "all", label: "Everyone", icon: Users, description: "All users on the platform" },
    { id: "admins", label: "Tenant Admins", icon: ShieldAlert, description: "Only institution administrators" },
    { id: "teachers", label: "Teachers", icon: UserRound, description: "All platform instructors" },
    { id: "students", label: "Students", icon: GraduationCap, description: "All enrolled students" },
    { id: "tenant", label: "Institution", icon: Building, description: "Specific organization only" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      ErrorToster("Please fill in all required fields", 2000);
      return;
    }

    if (formData.targetAudience === "tenant" && !formData.tenantId) {
      ErrorToster("Please select an institution", 2000);
      return;
    }

    try {
      await createAnnouncement(formData).unwrap();
      SuccessToster("Broadcasting successful", 2000);
      navigate("/superadmin/dashboard");
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to send announcement", 2500);
    }
  };

  return (
    <SuperAdminLayout
      pageTitle="Create Announcement"
      breadcrumbItems={breadcrumbPaths.SUPERADMIN_ANNOUNCEMENTS}
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Broadcast Announcement</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Send a platform-wide notification to your users</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-500 rounded-lg text-xs font-medium border border-yellow-100 dark:border-yellow-900/20">
            <AlertCircle className="h-3.5 w-3.5" />
            This action cannot be undone
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Target Audience Section */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4 text-superadminprimary" />
                Target Audience
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {audiences.map((audience) => (
                  <AudienceCard
                    key={audience.id}
                    {...audience}
                    isActive={formData.targetAudience === audience.id}
                    onClick={(id) => setFormData({ ...formData, targetAudience: id, tenantId: "" })}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {formData.targetAudience === "tenant" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Institution</label>
                  <select
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-superadminprimary/20 outline-none transition-all"
                  >
                    <option value="">Select an organization...</option>
                    {tenantsData?.data?.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message Title</label>
                <input
                  type="text"
                  placeholder="e.g., Scheduled Maintenance"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-superadminprimary/20 outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notification Message</label>
                <textarea
                  rows={5}
                  placeholder="Write your announcement message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-superadminprimary/20 outline-none transition-all placeholder:text-slate-400 resize-none"
                  required
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                  <div className="flex gap-2">
                    {["low", "medium", "high"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p })}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                          ${formData.priority === p 
                            ? p === "high" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : 
                              p === "medium" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : 
                              "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }
                        `}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Publish Mode</label>
                  <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 opacity-60">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Instant Broadcast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              * This will create a push notification and system record for all targeted users.
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-superadminprimary text-white text-sm font-bold hover:shadow-lg hover:shadow-superadminprimary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    Post Announcement
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default CreateAnnouncement;

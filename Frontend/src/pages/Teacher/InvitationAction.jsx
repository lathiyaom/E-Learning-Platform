import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const InvitationAction = () => {
  const { token, action } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !action || !["accept", "reject"].includes(action)) {
      navigate("/teacher/invitation-result?status=invalid", { replace: true });
      return;
    }

    const apiBase = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
    window.location.href = `${apiBase}/SuperAdmin/TeacherInvitation/${token}/${action}`; // Fixed path
  }, [token, action, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="h-10 w-10 rounded-full border-b-2 border-blue-600 animate-spin mx-auto" />
        <p className="mt-4 text-slate-700 dark:text-slate-300">Processing invitation...</p>
      </div>
    </div>
  );
};

export default InvitationAction;

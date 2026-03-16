import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const InvitationResult = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const org = searchParams.get("org");

  const accepted = status === "accepted";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${accepted ? "bg-emerald-100" : "bg-amber-100"}`}>
          {accepted ? "✓" : "!"}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
          {accepted ? "Invitation Accepted" : "Invitation Declined"}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-3">
          {accepted
            ? `You are now assigned to ${org || "the organization"}.`
            : "You declined this organization invitation."}
        </p>

        <div className="mt-6">
          <Link
            to="/Login"
            className="inline-flex px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvitationResult;

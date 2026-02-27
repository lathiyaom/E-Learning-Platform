import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-navy-charcoal dark:to-deep-charcoal flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-500" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-500 mb-4">
            403
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-slate-500 dark:text-slate-500">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-premium-gold dark:to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-left">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">
            Common Reasons:
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>You're not logged in with the correct account type</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Your account doesn't have the required permissions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>This page is restricted to specific user roles</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

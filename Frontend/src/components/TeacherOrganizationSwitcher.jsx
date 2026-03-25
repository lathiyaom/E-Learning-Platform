import React, { useState } from "react";
import {
  useGetMyOrganizationsQuery,
  useSwitchOrganizationMutation,
} from "../redux/Apis/teacherOrganizationApi";
import { Building, ChevronDown, Check } from "lucide-react";
import { SuccessToster, ErrorToster } from "./toster";

const TeacherOrganizationSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data, isLoading } = useGetMyOrganizationsQuery();
  const [switchOrg, { isLoading: switching }] = useSwitchOrganizationMutation();

  const organizations = data?.data?.organizations || [];
  const currentOrgId = data?.data?.currentOrganization;
  
  const currentOrg = organizations.find(org => org._id === currentOrgId);

  const handleSwitch = async (organizationId) => {
    if (organizationId === currentOrgId) {
      setIsOpen(false);
      return;
    }

    try {
      const result = await switchOrg({ organizationId }).unwrap();
      SuccessToster(result.message || "Organization switched successfully");
      setIsOpen(false);
      // Reload page to refresh all data
      window.location.reload();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to switch organization");
    }
  };

  if (isLoading || organizations.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all"
      >
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Building className="h-5 w-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400">Organization</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {currentOrg?.name || "Select Organization"}
          </p>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Your Organizations ({organizations.length})
              </p>
              {organizations.map((org) => (
                <button
                  key={org._id}
                  onClick={() => handleSwitch(org._id)}
                  disabled={switching}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    org._id === currentOrgId
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      org._id === currentOrgId
                        ? "bg-blue-100 dark:bg-blue-900/40"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}>
                      <Building className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{org.email}</p>
                    </div>
                  </div>
                  {org._id === currentOrgId && (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherOrganizationSwitcher;

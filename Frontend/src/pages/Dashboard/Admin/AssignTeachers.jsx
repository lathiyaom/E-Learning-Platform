import React, { useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  useGetUnassignedTeachersQuery,
  useGetOrganizationTeachersQuery,
  useAssignTeachersToOrganizationMutation,
  useRemoveTeacherFromOrganizationMutation,
} from "../../../redux/Apis/teacherOrganizationApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import { UserPlus, UserMinus, Users, Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import { SuccessToster, ErrorToster } from "../../../components/toster";

const AssignTeachers = () => {
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useSelector(selectCurrentUser);
  // For admin/superadmin, user.id is the tenant/organization id
  const tenantId = currentUser?.id || null;

  const { data: unassignedData, isLoading: loadingUnassigned } = useGetUnassignedTeachersQuery();
  const { data: assignedData, isLoading: loadingAssigned, refetch } = useGetOrganizationTeachersQuery(tenantId, {
    skip: !tenantId,
  });
  
  const [assignTeachers, { isLoading: assigning }] = useAssignTeachersToOrganizationMutation();
  const [removeTeacher, { isLoading: removing }] = useRemoveTeacherFromOrganizationMutation();

  const unassignedTeachers = unassignedData?.data || [];
  const assignedTeachers = assignedData?.data || [];

  const filteredUnassigned = unassignedTeachers.filter(
    (teacher) =>
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTeacher = (teacherId) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleAssignTeachers = async () => {
    if (selectedTeachers.length === 0) {
      ErrorToster("Please select at least one teacher");
      return;
    }

    try {
      const result = await assignTeachers({ teacherIds: selectedTeachers }).unwrap();
      SuccessToster(result.message || "Teachers assigned successfully");
      setSelectedTeachers([]);
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to assign teachers");
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!window.confirm("Are you sure you want to remove this teacher from your organization?")) {
      return;
    }

    try {
      const result = await removeTeacher(teacherId).unwrap();
      SuccessToster(result.message || "Teacher removed successfully");
      refetch();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to remove teacher");
    }
  };

  if (loadingUnassigned || loadingAssigned) {
    return (
      <AdminLayout pageTitle="Assign Teachers">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Assign Teachers">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Teacher Management</h2>
          <p className="text-blue-100">
            Assign teachers to your organization and manage their access
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unassigned Teachers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Available Teachers
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {unassignedTeachers.length} teachers available
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-4"
            />

            {/* Teacher List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUnassigned.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No unassigned teachers found
                </div>
              ) : (
                filteredUnassigned.map((teacher) => (
                  <div
                    key={teacher._id}
                    onClick={() => handleSelectTeacher(teacher._id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTeachers.includes(teacher._id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {teacher.firstName} {teacher.lastName}
                          </h4>
                          {selectedTeachers.includes(teacher._id) && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                          <Mail className="h-4 w-4" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="h-4 w-4" />
                          {teacher.phoneNo}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Assign Button */}
            {selectedTeachers.length > 0 && (
              <button
                onClick={handleAssignTeachers}
                disabled={assigning}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                {assigning ? "Assigning..." : `Assign ${selectedTeachers.length} Teacher(s)`}
              </button>
            )}
          </div>

          {/* Assigned Teachers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Assigned Teachers
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {assignedTeachers.length} teachers in your organization
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Teacher List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignedTeachers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No teachers assigned yet
                </div>
              ) : (
                assignedTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                          {teacher.firstName} {teacher.lastName}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                          <Mail className="h-4 w-4" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="h-4 w-4" />
                          {teacher.phoneNo}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeacher(teacher._id)}
                        disabled={removing}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove teacher"
                      >
                        <UserMinus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignTeachers;

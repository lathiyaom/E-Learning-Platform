import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import {
  useGetAllHolidaysQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} from "../../../redux/Apis/holidayApi";
import { SuccessToster, ErrorToster } from "../../../components/toster";

const AdminHolidaysManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    type: "national",
    isRecurring: false,
  });

  const { data: holidaysData, isLoading } = useGetAllHolidaysQuery();
  const [createHoliday, { isLoading: creating }] = useCreateHolidayMutation();
  const [updateHoliday, { isLoading: updating }] = useUpdateHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const holidays = holidaysData?.data || [];

  const handleOpenModal = (holiday = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        startDate: holiday.startDate?.split("T")[0],
        endDate: holiday.endDate?.split("T")[0],
        description: holiday.description || "",
        type: holiday.type,
        isRecurring: holiday.isRecurring || false,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        type: "national",
        isRecurring: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHoliday(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingHoliday) {
        await updateHoliday({ id: editingHoliday._id, ...formData }).unwrap();
        SuccessToster("Holiday updated successfully!", 3000);
      } else {
        await createHoliday(formData).unwrap();
        SuccessToster("Holiday created successfully!", 3000);
      }
      handleCloseModal();
    } catch (error) {
      ErrorToster(error?.data?.message || "Failed to save holiday", 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        await deleteHoliday(id).unwrap();
        SuccessToster("Holiday deleted successfully!", 3000);
      } catch (error) {
        ErrorToster(error?.data?.message || "Failed to delete holiday", 3000);
      }
    }
  };

  const filteredHolidays = holidays.filter((holiday) =>
    holiday.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type) {
      case "national":
        return "bg-red-100 text-red-800";
      case "religious":
        return "bg-purple-100 text-purple-800";
      case "institutional":
        return "bg-blue-100 text-blue-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Holidays Management</h1>
        <p className="text-slate-600">Manage platform and organization-specific holidays</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search holidays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Add Holiday
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredHolidays.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No holidays found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date Range</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Recurring</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHolidays.map((holiday) => (
                  <tr key={holiday._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-slate-900">
                      <div>
                        <p className="font-medium">{holiday.name}</p>
                        <p className="text-sm text-slate-500 truncate">{holiday.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(holiday.startDate).toLocaleDateString()} -{" "}
                          {new Date(holiday.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(holiday.type)}`}>
                        {holiday.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {holiday.isRecurring ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Yearly</span>
                      ) : (
                        <span className="text-slate-400">One-time</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(holiday)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday._id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                {editingHoliday ? "Edit" : "Add"} Holiday
              </h2>
              <button onClick={handleCloseModal} className="text-slate-600 hover:text-slate-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Holiday Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Christmas, Diwali, New Year"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="national">National</option>
                  <option value="religious">Religious</option>
                  <option value="institutional">Institutional</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  id="isRecurring"
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isRecurring" className="cursor-pointer text-slate-700 font-medium">
                  Recurring Holiday (Yearly)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {creating || updating ? "Saving..." : editingHoliday ? "Update" : "Create"} Holiday
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHolidaysManagement;

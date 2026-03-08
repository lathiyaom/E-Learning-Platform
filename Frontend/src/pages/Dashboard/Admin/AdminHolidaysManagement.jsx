import React, { useEffect, useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import { holidayApi } from "../../../api/holidayApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";

const initialForm = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  type: "organization",
  isRecurring: false,
};

const AdminHolidaysManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await holidayApi.getAllHolidays();
      setHolidays(res?.data?.data || []);
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to load holidays", 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEdit = (holiday) => {
    setEditing(holiday);
    setForm({
      title: holiday.title || "",
      description: holiday.description || "",
      date: holiday.date ? new Date(holiday.date).toISOString().slice(0, 10) : "",
      endDate: holiday.endDate ? new Date(holiday.endDate).toISOString().slice(0, 10) : "",
      type: holiday.type || "organization",
      isRecurring: Boolean(holiday.isRecurring),
    });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await holidayApi.updateHoliday(editing._id, form);
        SuccessToster("Holiday updated", 2500);
      } else {
        await holidayApi.createHoliday(form);
        SuccessToster("Holiday created", 2500);
      }
      setShowForm(false);
      setForm(initialForm);
      fetchHolidays();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to save holiday", 3000);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await holidayApi.deleteHoliday(id);
      SuccessToster("Holiday deleted", 2500);
      fetchHolidays();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to delete holiday", 3000);
    }
  };

  return (
    <AdminLayout showSearch={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Holidays Management</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Holiday
          </button>
        </div>

        {showForm && (
          <form onSubmit={onSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-3 py-2 rounded border" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select className="px-3 py-2 rounded border" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="platform">Platform</option>
              <option value="organization">Organization</option>
              <option value="national">National</option>
              <option value="regional">Regional</option>
              <option value="religious">Religious</option>
            </select>
            <input className="px-3 py-2 rounded border" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <input className="px-3 py-2 rounded border" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            <textarea className="md:col-span-2 px-3 py-2 rounded border" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
              Recurring Holiday
            </label>
            <div className="md:col-span-2 flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" type="submit">
                {editing ? "Update" : "Create"}
              </button>
              <button className="px-4 py-2 rounded-lg border" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading holidays...</div>
          ) : holidays.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No holidays found.</div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {holidays.map((holiday) => (
                <div key={holiday._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{holiday.title}</h3>
                    <p className="text-sm text-slate-500">
                      {holiday.date ? new Date(holiday.date).toLocaleDateString() : ""}
                      {holiday.endDate ? ` - ${new Date(holiday.endDate).toLocaleDateString()}` : ""}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{holiday.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(holiday)} className="px-3 py-2 rounded border">Edit</button>
                    <button onClick={() => onDelete(holiday._id)} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHolidaysManagement;

import React, { useEffect, useState } from "react";
import AdminLayout from "../../../utils/Adminlayoute";
import { eventApi } from "../../../api/eventApi";
import { ErrorToster, SuccessToster } from "../../../components/toster";

const initialForm = {
  title: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  location: "",
  type: "workshop",
  registrationRequired: false,
  maxParticipants: "",
};

const AdminEventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getAllEvents();
      setEvents(res?.data?.data || []);
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to load events", 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 10) : "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || "",
      type: event.type || "workshop",
      registrationRequired: Boolean(event.registrationRequired),
      maxParticipants: event.maxParticipants || "",
    });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      };

      if (editing) {
        await eventApi.updateEvent(editing._id, payload);
        SuccessToster("Event updated", 2500);
      } else {
        await eventApi.createEvent(payload);
        SuccessToster("Event created", 2500);
      }

      setShowForm(false);
      setForm(initialForm);
      fetchEvents();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to save event", 3000);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await eventApi.deleteEvent(id);
      SuccessToster("Event deleted", 2500);
      fetchEvents();
    } catch (error) {
      ErrorToster(error?.response?.data?.message || "Failed to delete event", 3000);
    }
  };

  return (
    <AdminLayout showSearch={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events Management</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Event
          </button>
        </div>

        {showForm && (
          <form onSubmit={onSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-3 py-2 rounded border" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="px-3 py-2 rounded border" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
            <input className="px-3 py-2 rounded border" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <input className="px-3 py-2 rounded border" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <input className="px-3 py-2 rounded border" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <select className="px-3 py-2 rounded border" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="webinar">Webinar</option>
              <option value="competition">Competition</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="conference">Conference</option>
              <option value="other">Other</option>
            </select>
            <textarea className="md:col-span-2 px-3 py-2 rounded border" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.registrationRequired} onChange={(e) => setForm({ ...form, registrationRequired: e.target.checked })} />
              Registration Required
            </label>
            <input className="px-3 py-2 rounded border" type="number" min="1" placeholder="Max participants" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
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
            <div className="p-8 text-center">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No events found.</div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {events.map((event) => (
                <div key={event._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-slate-500">
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"} {event.startTime ? `| ${event.startTime}` : ""}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(event)} className="px-3 py-2 rounded border">Edit</button>
                    <button onClick={() => onDelete(event._id)} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
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

export default AdminEventsManagement;

import React, { useState } from "react";

const Events = () => {
  const [events] = useState([
    {
      id: 1,
      title: "Midterm Exams",
      date: "2026-03-15",
      type: "exam",
      description: "Midterm examinations for all courses",
    },
    {
      id: 2,
      title: "Guest Lecture",
      date: "2026-03-20",
      type: "lecture",
      description: "Industry expert talk on AI trends",
    },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                {event.type}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{event.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              📅 {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                Edit
              </button>
              <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;

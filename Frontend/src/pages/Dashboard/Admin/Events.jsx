import React, { useState } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Events Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition-colors">
          Add Event
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <motion.div 
            key={event.id} 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-white/10"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{event.title}</h3>
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-medium font-medium">
                {event.type}
              </span>
            </div>
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">{event.description}</p>
            <div className="text-sm text-gray-500 dark:text-slate-500 mb-4">
              📅 {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                Edit
              </button>
              <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Events;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import AdminLayout from "../../../utils/Adminlayoute";
import { eventApi } from "../../../api/eventApi";
import { holidayApi } from "../../../api/holidayApi";

const formatDateRange = (startVal, endVal) => {
  if (!startVal) return "Date TBD";
  const startStr = new Date(startVal).toLocaleDateString();
  if (!endVal) return startStr;
  const endStr = new Date(endVal).toLocaleDateString();
  return (startStr === endStr || endStr === "Invalid Date") ? startStr : `${startStr} - ${endStr}`;
};

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const { data: coursesData } = useGetAllCoursesQuery();
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const teacherId = String(user?._id || user?.id || "");

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [eventRes, holidayRes] = await Promise.all([
          eventApi.getUpcomingEvents({ limit: 5 }),
          holidayApi.getUpcomingHolidays({ limit: 5 }),
        ]);
        setEvents(eventRes?.data?.data || []);
        setHolidays(holidayRes?.data?.data || []);
      } catch (error) {
        setEvents([]);
        setHolidays([]);
      }
    };
    loadMeta();
  }, []);

  const courses = coursesData?.data || [];
  const myCourses = courses.filter((course) => {
    const createdById = String(course?.createdBy?._id || course?.createdBy || "");
    const teacherOwnerId = String(course?.teacher_id?._id || course?.teacher_id || "");
    return createdById === teacherId || teacherOwnerId === teacherId;
  });
  const totalStudents = myCourses.reduce(
    (sum, c) => sum + Number(c.totalStudents || c.studentCount || c.enrollmentCount || 0),
    0
  );
  const ratings = myCourses
    .map((c) => Number(c.rating || 0))
    .filter((value) => value > 0);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)
    : "0.0";

  return (
    <AdminLayout showSearch={false} className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600">Teacher Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">My Courses</h3>
          <p className="text-3xl font-bold mt-2">{myCourses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold mt-2">{totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Avg Rating</h3>
          <p className="text-3xl font-bold mt-2">{avgRating}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">My Courses</h2>
        {myCourses.length === 0 ? (
          <p className="text-gray-500">No courses assigned or created yet.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCourses.map((course) => (
            <div key={course._id} className="border rounded-lg p-4">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.category}</p>
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming events.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event._id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateRange(event.start_date || event.eventDate || event.startDate, event.end_date || event.endDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Holidays</h2>
          {holidays.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming holidays.</p>
          ) : (
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div key={holiday._id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">{holiday.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateRange(holiday.date || holiday.startDate || holiday.start_date, holiday.endDate || holiday.end_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherDashboard;

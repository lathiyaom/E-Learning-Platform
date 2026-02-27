import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// Admin Dashboard Pages
import AdminLecturesManagement from "./Admin/AdminLecturesManagement";
import AdminEventsManagement from "./Admin/AdminEventsManagement";
import AdminHolidaysManagement from "./Admin/AdminHolidaysManagement";
import AdminAnalyticsDashboard from "./Admin/AdminAnalyticsDashboard";

// Teacher Dashboard Pages
import TeacherLectureManagement from "./Teacher/TeacherLectureManagement";
import TeacherTimetableView from "./Teacher/TeacherTimetableView";
import TeacherAnalyticsDashboard from "./Teacher/TeacherAnalyticsDashboard";

// Student Dashboard Pages
import StudentCalendarView from "./Student/StudentCalendarView";
import StudentCourseDetails from "./Student/StudentCourseDetails";
import StudentFeedbackSystem from "./Student/StudentFeedbackSystem";

// Dashboard Home/Layout
import DashboardHome from "./DashboardHome";

const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth || { user: null });
  const userRole = user?.userType || "student"; // admin, teacher, student

  return (
    <Routes>
      {/* Dashboard Home */}
      <Route path="/" element={<DashboardHome />} />

      {/* Admin Routes */}
      {(userRole === "admin" || userRole === "superadmin") && (
        <>
          <Route path="/admin/lectures" element={<AdminLecturesManagement />} />
          <Route path="/admin/events" element={<AdminEventsManagement />} />
          <Route path="/admin/holidays" element={<AdminHolidaysManagement />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsDashboard />} />
        </>
      )}

      {/* Teacher Routes */}
      {(userRole === "teacher" || userRole === "admin") && (
        <>
          <Route path="/teacher/lectures" element={<TeacherLectureManagement />} />
          <Route path="/teacher/timetable" element={<TeacherTimetableView />} />
          <Route path="/teacher/analytics" element={<TeacherAnalyticsDashboard />} />
        </>
      )}

      {/* Student Routes */}
      {(userRole === "student" || userRole === "admin") && (
        <>
          <Route path="/student/calendar" element={<StudentCalendarView />} />
          <Route path="/student/course/:courseId" element={<StudentCourseDetails />} />
          <Route path="/student/feedback" element={<StudentFeedbackSystem />} />
        </>
      )}
    </Routes>
  );
};

export default DashboardRouter;
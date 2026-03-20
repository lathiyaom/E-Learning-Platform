import React, { useEffect } from "react";
import "./App.css";
import Home from "./pages/Home";
import HomeNew from "./pages/HomeNew";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import About from "./pages/About2/index";
import ContactUs from "./pages/CountectUs/index";
import Index from "./pages/Courses2/index";
import Login from "./pages/Login/index.jsx";
import ForgotPassword from "./pages/ForgotPassword/index.jsx";
import ResetPassword from "./pages/ResetPassword/index.jsx";
import SignUp from "./pages/Sign-Up/index.jsx";
import OrganizationRegister from "./pages/Register/OrganizationRegister.jsx";
import CardDetail from "./pages/Courses/Videocard.jsx";
import AddCourse from "./pages/Profile/Admin/AddCourse.jsx";
// import ActiveUsers from "./pages/Profile/Admin/ActiveUsers.jsx";
import UserUpdateForm from "./pages/Profile/Admin/UserUpdateForm.jsx";
// import Settings from "./pages/Profile/Admin/settings.jsx";
import AdminSetting from "./pages/Dashboard/Admin/AdminSetting.jsx";
// import UserComments from "./pages/Profile/Admin/UserComments.jsx";
import ManageUsers from "./pages/Dashboard/Admin/Users.jsx";
import ManageCourses from "./pages/Dashboard/Admin/Courses.jsx";
import AssignTeachers from "./pages/Dashboard/Admin/AssignTeachers.jsx";
import Attendance from "./pages/Dashboard/Admin/Attendance.jsx";
import AdminLecturesManagement from "./pages/Dashboard/Admin/AdminLecturesManagement.jsx";
import AdminEventsManagement from "./pages/Dashboard/Admin/AdminEventsManagement.jsx";
import AdminHolidaysManagement from "./pages/Dashboard/Admin/AdminHolidaysManagement.jsx";
import Subjects from "./pages/Dashboard/Admin/Subjects.jsx";

import TeacherMarketplace from "./pages/Admin/TeacherMarketplace/index.jsx";
import Resources from "./pages/resources/index.jsx";
import Schedule from "./pages/schedule/index.jsx";
import Help from "./pages/help/index.jsx";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";
import Dashboard from "./pages/Dashboard/student/index";
import ExploreCourses from "./pages/Dashboard/student/exploreCourses/index.jsx";
import Userprofile from "./pages/Dashboard/student/userprofile/index.jsx";
import MyLearning from "./pages/Dashboard/student/Mylearning/index.jsx";
import ChatInterface from "./pages/Chat/index.jsx";
import TenantManagement from "./pages/Dashboard/SuperAdmin/TenantManagement.jsx";
import UserManagement from "./pages/Dashboard/SuperAdmin/UserManagement.jsx";
import TenantDetail from "./pages/Dashboard/SuperAdmin/TenantDetail.jsx";
import TeacherManagement from "./pages/Dashboard/SuperAdmin/TeacherManagement.jsx";
import AdminDashboard from "./pages/Dashboard/Admin/AdminDashboard.jsx";
import TeacherDashboard from "./pages/Dashboard/Teacher/TeacherDashboard.jsx";
import MyCourses from "./pages/Dashboard/Teacher/MyCourses.jsx";
import TeacherAttendance from "./pages/Dashboard/Teacher/Attendance.jsx";
import TeacherAssignments from "./pages/Dashboard/Teacher/Assignments.jsx";

import TeacherStudents from "./pages/Dashboard/Teacher/Students.jsx";
import TeacherLectureManagement from "./pages/Dashboard/Teacher/TeacherLectureManagement.jsx";
import TeacherAnalyticsDashboard from "./pages/Dashboard/Teacher/TeacherAnalyticsDashboard.jsx";
import CourseForm from "./pages/Dashboard/Teacher/CourseForm.jsx";
import Enrollments from "./pages/Dashboard/student/Enrollments.jsx";
import StudentAttendance from "./pages/Dashboard/student/StudentAttendance.jsx";
import StudentConductedLectures from "./pages/Dashboard/student/StudentConductedLectures.jsx";
import StudentUpcomingLectures from "./pages/Dashboard/student/StudentUpcomingLectures.jsx";
import StudentAssignments from "./pages/Dashboard/student/StudentAssignments.jsx";

import RateCourse from "./pages/Dashboard/student/RateCourse.jsx";
import StudentFeedbackSystem from "./pages/Dashboard/student/StudentFeedbackSystem.jsx";
import InvitationResult from "./pages/Teacher/InvitationResult.jsx";
import InvitationAction from "./pages/Teacher/InvitationAction.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFound from "./pages/NotFound.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import DashboardRouter from "./pages/Dashboard/DashboardRouter.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useLazyGetCurrentUserQuery } from "./redux";
import { logout, selectIsAuthenticated } from "./redux/slice/authSlice";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [validateToken, { isLoading: isValidating }] = useLazyGetCurrentUserQuery();

  // ✅ Validate token when app loads
  useEffect(() => {
    const validateAuthOnMount = async () => {
      if (isAuthenticated) {
        try {
          await validateToken().unwrap();
          console.log("✅ Token valid");
        } catch (error) {
          console.warn("Token validation failed, logging out");
          dispatch(logout());
        }
      }
    };

    validateAuthOnMount();
  }, []); // Run once on mount

  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <DarkModeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeNew />} />
            <Route path="/home-classic" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/Sign-Up" element={<SignUp />} />
            <Route path="/register-organization" element={<OrganizationRegister />} />
            <Route path="/courses" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/card/:id" element={<CardDetail />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/help" element={<Help />} />
            <Route path="/teacher/invitation-result" element={<InvitationResult />} />
            <Route path="/teacher/invitation/:token/:action" element={<InvitationAction />} />
            
            {/* SuperAdmin Routes - Protected */}
            <Route path="/superadmin" element={<Navigate to="/superadmin/tenants" replace />} />
            <Route path="/superadmin/dashboard" element={<Navigate to="/superadmin/tenants" replace />} />
            <Route path="/superadmin/tenants" element={<ProtectedRoute requiredRole="superadmin"><TenantManagement /></ProtectedRoute>} />
            <Route path="/superadmin/tenants/:id" element={<ProtectedRoute requiredRole="superadmin"><TenantDetail /></ProtectedRoute>} />
            <Route path="/superadmin/users" element={<ProtectedRoute requiredRole="superadmin"><UserManagement /></ProtectedRoute>} />
            <Route path="/superadmin/teachers" element={<ProtectedRoute requiredRole="superadmin"><TeacherManagement /></ProtectedRoute>} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/assign-teachers" element={<ProtectedRoute requiredRole="admin"><AssignTeachers /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><Attendance /></ProtectedRoute>} />
            <Route path="/admin/lectures" element={<ProtectedRoute requiredRole="admin"><AdminLecturesManagement /></ProtectedRoute>} />
            <Route path="/admin/lectures/:courseId" element={<ProtectedRoute requiredRole="admin"><AdminLecturesManagement /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute requiredRole="admin"><AdminEventsManagement /></ProtectedRoute>} />
            <Route path="/admin/holidays" element={<ProtectedRoute requiredRole="admin"><AdminHolidaysManagement /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute requiredRole="admin"><Subjects /></ProtectedRoute>} />
            <Route path="/admin/teacher-marketplace" element={<ProtectedRoute requiredRole="admin"><TeacherMarketplace /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><ManageUsers /></ProtectedRoute>} />
            {/* <Route path="/ActiveUsers" element={<ProtectedRoute requiredRole="admin"><ActiveUsers /></ProtectedRoute>} /> */}
            <Route path="/managecourses" element={<ProtectedRoute requiredRole="admin"><ManageCourses /></ProtectedRoute>} />
            <Route path="/AddCourse" element={<ProtectedRoute requiredRole="admin"><AddCourse /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><AdminSetting /></ProtectedRoute>} />
            <Route path="/updateForm" element={<ProtectedRoute requiredRole="admin"><UserUpdateForm /></ProtectedRoute>} />
            {/* <Route path="/Comments" element={<ProtectedRoute requiredRole="admin"><UserComments /></ProtectedRoute>} /> */}
            
            {/* Teacher Routes - Protected */}
            <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/dashboard" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/courses" element={<ProtectedRoute requiredRole="teacher"><MyCourses /></ProtectedRoute>} />
            <Route path="/teacher/attendance" element={<ProtectedRoute requiredRole="teacher"><TeacherAttendance /></ProtectedRoute>} />
            <Route path="/teacher/assignments" element={<ProtectedRoute requiredRole="teacher"><TeacherAssignments /></ProtectedRoute>} />

                        <Route path="/teacher/students" element={<ProtectedRoute requiredRole="teacher"><TeacherStudents /></ProtectedRoute>} />
            <Route path="/teacher/lectures" element={<ProtectedRoute requiredRole="teacher"><TeacherLectureManagement /></ProtectedRoute>} />
                        <Route path="/teacher/course-form" element={<ProtectedRoute requiredRole="teacher"><CourseForm /></ProtectedRoute>} />
            <Route path="/teacher/analytics" element={<ProtectedRoute requiredRole="teacher"><TeacherAnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/teacher/add-course" element={<ProtectedRoute requiredRole="teacher"><AddCourse /></ProtectedRoute>} />
            
            {/* Student Routes - Protected */}
            <Route path="/Dashboard" element={<ProtectedRoute requiredRole="student"><Dashboard /></ProtectedRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><Dashboard /></ProtectedRoute>} />
            <Route path="/Explorecourses" element={<ProtectedRoute requiredRole="student"><ExploreCourses /></ProtectedRoute>} />
            <Route path="/Mylearning" element={<ProtectedRoute requiredRole="student"><MyLearning /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requiredRole="student"><Userprofile /></ProtectedRoute>} />
            <Route path="/student/enrollments" element={<ProtectedRoute requiredRole="student"><Enrollments /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute requiredRole="student"><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/conducted-lectures" element={<ProtectedRoute requiredRole="student"><StudentConductedLectures /></ProtectedRoute>} />
            <Route path="/student/upcoming-lectures" element={<ProtectedRoute requiredRole="student"><StudentUpcomingLectures /></ProtectedRoute>} />
            <Route path="/student/assignments" element={<ProtectedRoute requiredRole="student"><StudentAssignments /></ProtectedRoute>} />

            <Route path="/student/rate-course" element={<ProtectedRoute requiredRole="student"><RateCourse /></ProtectedRoute>} />
            <Route path="/student/feedback" element={<ProtectedRoute requiredRole="student"><StudentFeedbackSystem /></ProtectedRoute>} />
                        <Route path="/Chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
            <Route path="/teacher/chat" element={<ProtectedRoute requiredRole="teacher"><ChatInterface /></ProtectedRoute>} />
            
            {/* NEW Unified Dashboard Router - All roles */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DarkModeProvider>
    </React.Fragment>
  );
}

export default App;

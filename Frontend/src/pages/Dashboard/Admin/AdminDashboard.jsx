import { Link } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Settings, 
  BarChart3,
  Building,
  GraduationCap,
  MessageSquare,
  CalendarDays,
  CalendarX2
} from "lucide-react";

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your organization</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, Admin!</h2>
              <p className="text-blue-100">
                Manage your organization's users, courses, and settings from here.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Manage Users */}
          <Link
            to="/ActiveUsers"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600">
              View and manage all users in your organization
            </p>
          </Link>

          {/* Add User */}
          <Link
            to="/Sign-Up"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add User</h3>
            <p className="text-sm text-gray-600">
              Create new student or teacher accounts
            </p>
          </Link>

          {/* Manage Courses */}
          <Link
            to="/managecourses"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Courses</h3>
            <p className="text-sm text-gray-600">
              View and manage all courses
            </p>
          </Link>

          {/* Add Course */}
          <Link
            to="/AddCourse"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add Course</h3>
            <p className="text-sm text-gray-600">
              Create new courses for your organization
            </p>
          </Link>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* View Comments */}
          <Link
            to="/Comments"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">User Comments</h3>
              <p className="text-sm text-gray-600">View feedback</p>
            </div>
          </Link>

          {/* Update User */}
          <Link
            to="/updateForm"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Update User</h3>
              <p className="text-sm text-gray-600">Edit user details</p>
            </div>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600">Configure options</p>
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Manage Events</h3>
              <p className="text-sm text-gray-600">Create notices and events</p>
            </div>
          </Link>

          <Link
            to="/admin/holidays"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <CalendarX2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Manage Holidays</h3>
              <p className="text-sm text-gray-600">Publish holiday calendar</p>
            </div>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Organization Admin</h3>
              <p className="text-sm text-blue-800">
                As an organization admin, you can manage users and courses within your organization. 
                You can create student and teacher accounts, manage courses, and view user feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

import React, { useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Book,
  BookOpen,
  Calendar,
  ClipboardList,
  HelpCircle,
  User,
  Users2,
  Menu,
  LogOut,
  MessageCircle,
  X,
  ChevronLeft,
  BookOpenText,
  LayoutDashboard,
  Compass,
  Clock,
  Bell,
  FileText,
} from "lucide-react";
import AvatarDropdown from "../components/Avatar";
import DarkModeToggle from "../components/DarkModeToggle";
import { useLogoutMutation } from "../redux";
import { ErrorToster, SuccessToster } from "../components/toster";
import SmartBreadcrumb from "../components/Breadcrumb";
import NotificationCenter from "../components/NotificationCenter";
import { logout } from "../redux/slice/authSlice";
import { useAuth } from "./users";
import logo from "../assets/imgs/logo.png";

// Constants for z-index layering
const Z_INDEX = {
  OVERLAY: 40,
  SIDEBAR: 50,
  HEADER: 40,
};

/**
 * AdminLayout Component
 * Main layout wrapper for authenticated admin/teacher/student pages
 * 
 * Features:
 * - Responsive sidebar with collapse functionality
 * - Mobile-friendly navigation drawer
 * - Role-based navigation items
 * - Breadcrumb navigation
 * - Dark mode support
 * - Accessibility compliant (ARIA labels, semantic HTML)
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {Array} props.customNavItems - Custom navigation items (optional)
 * @param {string} props.className - Additional CSS classes for main content
 * @param {Array} props.breadcrumbItems - Breadcrumb navigation items
 */
const AdminLayout = ({
  children,
  customNavItems = null,
  className = "",
  breadcrumbItems = null,
}) => {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Hooks
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [logoutMutation, { isLoading: isPending }] = useLogoutMutation();
  
  // Derived state
  const userRole = user?.userType?.toUpperCase();
  const email = user?.email;
  const displayName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || 
                      user?.email?.split("@")[0] || 
                      "User";
  const avatarInitial = user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U";
  const accountType = userRole === "TEACHER" ? "Instructor Account" : "Student Account";

  //Navigation items configuration
  const navItems = useMemo(() => {
    if (customNavItems) return customNavItems;

    const teacherNavItems = [
      {
        id: "dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        link: "/teacher/dashboard",
        breadcrumb: "Dashboard",
      },
      {
        id: "courses",
        icon: BookOpen,
        label: "My Courses",
        link: "/teacher/courses",
        breadcrumb: "My Courses",
      },
      {
        id: "lectures",
        icon: Book,
        label: "Lectures",
        link: "/teacher/lectures",
        breadcrumb: "Lectures",
      },
      {
        id: "attendance",
        icon: Calendar,
        label: "Attendance",
        link: "/teacher/attendance",
        breadcrumb: "Attendance",
      },
      {
        id: "students",
        icon: Users2,
        label: "Students",
        link: "/teacher/students",
        breadcrumb: "Students",
      },
      {
        id: "assignments",
        icon: ClipboardList,
        label: "Assignments",
        link: "/teacher/assignments",
        breadcrumb: "Assignments",
      },
      {
        id: "materials",
        icon: FileText,
        label: "Materials",
        link: "/teacher/materials",
        breadcrumb: "Materials",
      },
      {
        id: "analytics",
        icon: Compass,
        label: "Analytics",
        link: "/teacher/analytics",
        breadcrumb: "Analytics",
      },
      {
        id: "chat",
        icon: MessageCircle,
        label: "Chat",
        link: "/teacher/chat",
        breadcrumb: "Messages",
      },
      {
        id: "help",
        icon: HelpCircle,
        label: "Help Center",
        link: "/help",
        breadcrumb: "Help & Support",
      },
    ];

    const studentNavItems = [
      {
        id: "dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        link: "/student/dashboard",
        breadcrumb: "Dashboard",
      },
      {
        id: "explore",
        icon: Compass,
        label: "Explore Courses",
        link: "/Explorecourses",
        breadcrumb: "Explore Courses",
      },
      {
        id: "courses",
        icon: BookOpenText,
        label: "My Learning",
        link: "/Mylearning",
        breadcrumb: "My Learning",
      },
      {
        id: "lectures",
        icon: Book,
        label: "Today's Lectures",
        link: "/student/conducted-lectures",
        breadcrumb: "Today's Lectures",
      },
      {
        id: "upcoming-lectures",
        icon: Clock,
        label: "Upcoming Lectures",
        link: "/student/upcoming-lectures",
        breadcrumb: "Upcoming Lectures",
      },
      {
        id: "assignments",
        icon: ClipboardList,
        label: "Assignments",
        link: "/student/assignments",
        breadcrumb: "My Assignments",
      },
      {
        id: "chat",
        icon: MessageCircle,
        label: "Chat",
        link: "/Chat",
        breadcrumb: "Messages",
      },
      {
        id: "enrollments",
        icon: ClipboardList,
        label: "Enrollments",
        link: "/student/enrollments",
        breadcrumb: "My Enrollments",
      },
      {
        id: "attendance",
        icon: Calendar,
        label: "Attendance",
        link: "/student/attendance",
        breadcrumb: "Attendance",
      },
      {
        id: "feedback",
        icon: MessageCircle,
        label: "Feedback",
        link: "/student/feedback",
        breadcrumb: "Feedback",
      },
      {
        id: "profile",
        icon: User,
        label: "Profile",
        link: "/profile",
        breadcrumb: "My Profile",
      },
      {
        id: "resources",
        icon: Book,
        label: "Resources",
        link: "/resources",
        breadcrumb: "Learning Resources",
      },
      {
        id: "help",
        icon: HelpCircle,
        label: "Help Center",
        link: "/help",
        breadcrumb: "Help & Support",
      },
    ];

    return userRole === "TEACHER" ? teacherNavItems : studentNavItems;
  }, [userRole, customNavItems]);

  // Event handlers
  const toggleMobileSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const isActiveLink = useCallback(
    (link) => location.pathname === link,
    [location.pathname]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await logoutMutation({ email }).unwrap();
      SuccessToster("Successfully signed out", 2500);
      dispatch(logout());
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      ErrorToster(error?.data?.message || "Logout failed", 2500);
      console.error("Logout error:", error);
    }
  }, [email, logoutMutation, dispatch]);

  const handleSidebarWheelCapture = useCallback((event) => {
    event.stopPropagation();
  }, []);

  // Navigation Item Component
  const NavItem = useCallback(
    ({ item, collapsed = false }) => {
      const IconComponent = item.icon;
      const isActive = isActiveLink(item.link);

      return (
        <Link
          to={item.link}
          onClick={closeMobileSidebar}
          aria-label={item.label}
          aria-current={isActive ? "page" : undefined}
          title={collapsed ? item.label : undefined}
          className={`
            group flex items-center gap-3 rounded-xl px-4 py-3 
            text-sm font-semibold transition-all duration-200
            ${collapsed ? "justify-center px-2" : ""}
            ${
              isActive
                ? "bg-[#b48c4c]/10 text-[#b48c4c] dark:bg-premium-gold/10 dark:text-premium-gold dark:border-r-2 dark:border-premium-gold dark:shadow-[0_0_15px_rgba(176,141,87,0.1)]"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }
          `.trim()}
        >
          <IconComponent
            className={`
              shrink-0 h-5 w-5 transition-all duration-200
              ${
                isActive
                  ? "text-[#b48c4c] dark:text-premium-gold"
                  : "text-slate-400 group-hover:text-[#b48c4c] dark:group-hover:text-premium-gold"
              }
            `.trim()}
            aria-hidden="true"
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
      );
    },
    [isActiveLink, closeMobileSidebar]
  );

  // Sidebar Content Component
  const SidebarContent = useCallback(
    ({ collapsed = false }) => (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Logo Section */}
        <div className="p-6 flex-shrink-0">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
            <Link 
              to="/" 
              className="rounded-xl flex items-center justify-center flex-shrink-0"
              aria-label="Go to home page"
            >
              <img
                src={logo}
                alt="EduVerse Logo"
                className="w-12 h-12 object-contain"
              />
            </Link>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-xl tracking-tight leading-none text-slate-900 dark:text-white">
                  EduVerse
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-premium-gold font-bold uppercase tracking-widest mt-1">
                  {userRole === "TEACHER" ? "Teach & Grow" : "Premium Edition"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-[85%] h-[1px] bg-slate-200 dark:bg-slate-700 mx-auto flex-shrink-0" />

        {/* Navigation */}
        <nav 
          className="flex-1 min-h-0 px-4 pr-2 space-y-1 mt-4 overflow-y-auto overflow-x-hidden overscroll-contain sidebar-scroll-hover"
          style={{ WebkitOverflowScrolling: "touch" }}
          onWheelCapture={handleSidebarWheelCapture}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))}

          {!collapsed && (
            <div className="pt-8 pb-2 px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Account
            </div>
          )}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex-shrink-0">
          <button
            onClick={handleSignOut}
            disabled={isPending}
            aria-label="Sign out from your account"
            className={`
              flex w-full items-center gap-3 rounded-xl px-4 py-3 
              text-sm font-medium text-red-500 dark:text-red-400 
              transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${collapsed ? "justify-center px-2" : ""}
            `.trim()}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>{isPending ? "Signing out..." : "Logout"}</span>}
          </button>
        </div>
      </div>
    ),
    [navItems, NavItem, handleSignOut, isPending, userRole, handleSidebarWheelCapture]
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-deep-charcoal transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          style={{ zIndex: Z_INDEX.OVERLAY }}
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 flex flex-col 
          bg-white dark:bg-navy-charcoal 
          border-r border-slate-200 dark:border-white/5 
          shadow-xl transition-transform duration-300 ease-in-out 
          lg:hidden overflow-hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `.trim()}
        style={{ zIndex: Z_INDEX.SIDEBAR }}
        aria-label="Mobile navigation"
      >
        <button
          onClick={closeMobileSidebar}
          aria-label="Close mobile menu"
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:flex lg:flex-col 
          bg-white dark:bg-navy-charcoal 
          border-r border-slate-200 dark:border-white/5
          transition-all duration-300 ease-in-out overflow-visible
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `.trim()}
        style={{ zIndex: Z_INDEX.SIDEBAR }}
        aria-label="Desktop navigation"
      >
        <button
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft
            className={`h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Main Content Area */}
      <main
        className={`
          min-h-screen transition-all duration-300 dark:bg-deep-charcoal
          ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `.trim()}
      >
        {/* Header */}
        <header 
          className="sticky top-0 bg-[#f9fafb]/80 dark:bg-navy-charcoal/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-none dark:shadow-gold transition-all duration-300"
          style={{ zIndex: Z_INDEX.HEADER }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            
            {/* Left Section - Menu & Breadcrumbs */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <button
                onClick={toggleMobileSidebar}
                aria-label="Open mobile menu"
                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <Menu className="h-6 w-6" />
              </button>

              {breadcrumbItems && (
                <SmartBreadcrumb
                  items={breadcrumbItems}
                  className="dark:text-[#b48c4c]"
                />
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3 md:gap-6">
              
              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Divider */}
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block" aria-hidden="true" />

              {/* Notification Button */}
              <NotificationCenter />

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {accountType}
                  </p>
                </div>
                <AvatarDropdown
                  placeholder={avatarInitial}
                  size="md"
                  bgColor="bg-[#b48c4c]"
                  textColor="text-white"
                  borderColor="ring-2 ring-[#b48c4c]/20"
                  showdropdown={false}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={`p-6 space-y-8 ${className} dark:bg-deep-charcoal`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

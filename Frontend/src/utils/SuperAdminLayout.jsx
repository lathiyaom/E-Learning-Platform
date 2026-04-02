import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Shield,
  LayoutDashboard,
  Building,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Bell,
  Search,
  Settings,
  Lock,
  Wallet,
  BookOpen,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLogoutMutation } from "../redux";
import { logout } from "../redux/slice/authSlice";
import { ErrorToster, SuccessToster } from "../components/toster";
import DarkModeToggle from "../components/DarkModeToggle";
import AvatarDropdown from "../components/Avatar";
import { getAuth } from "./users";
import SmartBreadcrumb from "../components/Breadcrumb";
import NotificationCenter from "../components/NotificationCenter";
import logo from "../assets/imgs/logo.png";

const SidebarItem = ({ item, isCollapsed, isActive, onClick }) => {
  const Icon = item.icon;
  
  return (
    <Link
      to={item.link}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group
        ${isActive 
          ? "bg-superadminprimary text-white shadow-lg shadow-superadminprimary/25" 
          : "text-slate-400 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <div className={`shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
        <Icon className="h-5 w-5" />
      </div>
      
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
};

const SuperAdminLayout = ({
  children,
  pageTitle = "Admin Dashboard",
  className = "",
  breadcrumbItems = null,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = getAuth();
  const [logoutMutation, { isLoading: isPending }] = useLogoutMutation();

  const navItems = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, link: "/superadmin/dashboard" },
    { id: "tenants", label: "Organizations", icon: Building, link: "/superadmin/tenants" },
    { id: "users", label: "Manage Users", icon: Users, link: "/superadmin/users" },
    { id: "teachers", label: "Teachers", icon: Users, link: "/superadmin/teachers" },
    { id: "students", label: "Students", icon: Users, link: "/superadmin/students" },
    { id: "analytics", label: "Analytics", icon: BarChart3, link: "/superadmin/analytics" },
  ], []);

  const systemItems = useMemo(() => [
    { id: "settings", label: "Site Settings", icon: Settings, link: "/settings" },
    { id: "security", label: "Logs & Security", icon: Lock, link: "/superadmin/security" },
  ], []);

  const handleSignOut = async () => {
    try {
      await logoutMutation({ email: user?.email }).unwrap();
      dispatch(logout());
      SuccessToster("Successfully Signed out", 2000);
      setTimeout(() => {
        window.location.href = "/Login";
      }, 300);
    } catch (error) {
      ErrorToster(error?.data?.message || "Logout failed", 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-deep-charcoal text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-sa-sidebar dark:bg-sa-sidebar-dark border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-[260px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-20 flex items-center px-6 gap-3 shrink-0">
          <Link 
            to="/" 
            className="w-12 h-12 flex items-center justify-center shrink-0"
          >
            <img
              src={logo}
              alt="EduVerse Logo"
              className="w-full h-full object-contain"
            />
          </Link>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <h1 className="text-white font-bold text-xl leading-tight truncate">EduVerse</h1>
                <p className="text-slate-400 text-[10px] tracking-wider uppercase font-extrabold mt-1 text-nowrap">Super Admin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide space-y-6">
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                isActive={location.pathname === item.link}
                onClick={() => setIsMobileOpen(false)}
              />
            ))}
          </nav>

          {/* <div className="space-y-4 pt-4 border-t border-white/5">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-2"
                >
                  System
                </motion.p>
              )}
            </AnimatePresence>
            <nav className="space-y-1.5">
              {systemItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                  isActive={location.pathname === item.link}
                  onClick={() => setIsMobileOpen(false)}
                />
              ))}
            </nav>
          </div> */}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          
          {!isCollapsed && (
            <div className="text-[10px] text-slate-500 text-center uppercase tracking-tight opacity-50">
              © 2026 EduVerse Platform
            </div>
          )}
        </div>

        {/* Vertical Center Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center shadow-md hover:scale-110 transition-all z-10"
        >
          <ChevronLeft className={`h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? "lg:ml-20" : "lg:ml-[260px]"}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-white/80 dark:bg-deep-charcoal/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-6 w-6" />
            </button>

            {breadcrumbItems ? (
              <SmartBreadcrumb items={breadcrumbItems} showHome={false} className="text-superadminprimary" />
            ) : (
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none whitespace-nowrap">{pageTitle}</h2>
            )}
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-superadminprimary transition-colors" />
              <input
                type="text"
                placeholder="Global search..."
                className="w-full bg-slate-100 dark:bg-white/5 border-transparent focus:border-superadminprimary/30 focus:bg-white dark:focus:bg-transparent rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-0 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            
            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

            <NotificationCenter />
            
            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Super Admin</p>
                <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-tight mt-1">Owner</p>
              </div>
              <AvatarDropdown
                placeholder={user?.email || "SA"}
                size="md"
                bgColor="bg-superadminprimary"
                textColor="text-white"
                showdropdown={false}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`p-6 min-h-[calc(100vh-80px)] ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;


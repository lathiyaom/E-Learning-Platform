import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useLogoutMutation } from "../redux";
import { logout } from "../redux/slice/authSlice";
import { ErrorToster, SuccessToster } from "../components/toster";
import DarkModeToggle from "../components/DarkModeToggle";
import AvatarDropdown from "../components/Avatar";
import { getAuth } from "./users";

const SuperAdminLayout = ({
  children,
  pageTitle = "Super Admin",
  subheader = "",
  showSearch = false,
  className = "",
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = getAuth();
  const [logoutMutation, { isLoading: isPending }] = useLogoutMutation();

  const navItems = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        link: "/superadmin/dashboard",
      },
      {
        id: "tenants",
        label: "Organizations",
        icon: Building,
        link: "/superadmin/tenants",
      },
      {
        id: "users",
        label: "Users",
        icon: Users,
        link: "/superadmin/users",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        link: "/superadmin/analytics",
      },
    ],
    []
  );

  const handleSignOut = async () => {
    try {
      await logoutMutation({ email: user?.email }).unwrap();
      dispatch(logout());
      SuccessToster("Signed out", 2000);
      setTimeout(() => {
        window.location.href = "/Login";
      }, 300);
    } catch (error) {
      ErrorToster(error?.data?.message || "Logout failed", 2500);
    }
  };

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${
        mobile ? "w-72" : isCollapsed ? "w-20" : "w-64"
      } h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col`}
    >
      <div className="px-4 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className={`flex items-center ${isCollapsed && !mobile ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          {(!isCollapsed || mobile) && (
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">EduVerse</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Platform Owner</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const ActiveIcon = item.icon;
          const active = location.pathname === item.link;
          return (
            <Link
              key={item.id}
              to={item.link}
              onClick={() => setIsMobileOpen(false)}
              title={item.label}
              className={`flex items-center ${
                isCollapsed && !mobile ? "justify-center px-2" : "gap-3 px-3"
              } py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ActiveIcon className="h-5 w-5" />
              {(!isCollapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className={`w-full flex items-center ${
            isCollapsed && !mobile ? "justify-center px-2" : "gap-3 px-3"
          } py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
        >
          <LogOut className="h-5 w-5" />
          {(!isCollapsed || mobile) && <span>{isPending ? "Signing out..." : "Logout"}</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <div className="fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300">
        <div className={`${isMobileOpen ? "translate-x-0" : "-translate-x-full"} h-full`}>
          <div className="absolute right-3 top-3">
            <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-lg bg-white/90">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Sidebar mobile />
        </div>
      </div>

      <div className={`hidden lg:flex fixed inset-y-0 left-0 z-30`}>
        <Sidebar />
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className={`${isCollapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300`}>
        <header className="sticky top-0 z-20 px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{pageTitle}</h1>
                {subheader ? <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{subheader}</p> : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500">
                <Bell className="h-4 w-4" />
              </button>
              <AvatarDropdown
                placeholder={user?.email?.charAt(0)?.toUpperCase() || "S"}
                size="md"
                bgColor="bg-blue-600"
                textColor="text-white"
                showdropdown={false}
              />
            </div>
          </div>
        </header>

        <main className={`p-4 md:p-6 ${className}`}>{children}</main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

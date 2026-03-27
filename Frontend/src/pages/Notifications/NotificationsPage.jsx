import React, { useEffect } from "react";
import { 
  Bell, 
  Search, 
  Trash2, 
  CheckCheck, 
  Filter,
  Megaphone,
  Info,
  Check,
  ShieldAlert,
  Loader2,
  Inbox,
  Clock,
  ExternalLink
} from "lucide-react";
// import AdminLayout from "../../utils/AdminlayouteNew";
import AdminLayout from "../../utils/Adminlayoute";
import SuperAdminLayout from "../../utils/SuperAdminLayout";
import { useAuth, getAuth } from "../../utils/users";
import { 
  useGetUserNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation 
} from "../../redux/Apis/notificationApi";
import { motion, AnimatePresence } from "framer-motion";
import { connectSocket } from "../../utils/socket";

const NotificationsPage = () => {
  const { user } = getAuth();
  const isSuperAdmin = user?.userType === "superadmin";
  const Layout = isSuperAdmin ? SuperAdminLayout : AdminLayout;

  const { 
    data: response, 
    isLoading, 
    refetch 
  } = useGetUserNotificationsQuery({ limit: 100 });
  
  const notifications = response?.data || [];
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  useEffect(() => {
    const socket = connectSocket();
    if (socket) {
      socket.on("new_notification", refetch);
      return () => {
        socket.off("new_notification", refetch);
      };
    }
  }, [refetch]);

  const getIcon = (type) => {
    switch (type) {
      case "announcement": return <Megaphone className="h-6 w-6 text-superadminprimary" />;
      case "assignment": return <Info className="h-6 w-6 text-blue-500" />;
      case "grade": return <Check className="h-6 w-6 text-emerald-500" />;
      case "system": return <ShieldAlert className="h-6 w-6 text-slate-500" />;
      default: return <Bell className="h-6 w-6 text-slate-400" />;
    }
  };

  const getTimeLabel = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout pageTitle="Notifications">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Bell className="h-8 w-8 text-superadminprimary" />
              Notifications Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage all your platform updates and system announcements</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-superadminprimary dark:bg-navy-charcoal border border-slate-200 dark:border-slate-700 text-sm font-bold text-white dark:text-superadminprimary hover:bg-superadminprimary/80 dark:hover:bg-navy-charcoal/80 transition-all shadow-sm dark:hover:text-white"
            >
              <CheckCheck className="h-4 w-4 text-white/80" />
              Mark all read
            </button>
          </div>
        </div>

        {/* Filters & Search (Mock for now) */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-deep-charcoal border-none text-sm "
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-deep-charcoal rounded-xl text-xs font-bold text-slate-500">
              <Filter className="h-3 w-3" />
              Filter
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-superadminprimary animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Syncing your notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div 
                  key={notification._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`group relative p-6 rounded-2xl transition-all duration-300 border
                    ${notification.isRead 
                      ? "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50" 
                      : "bg-white dark:bg-slate-900 border-superadminprimary/20 shadow-lg shadow-superadminprimary/5 ring-1 ring-superadminprimary/10"
                    }
                  `}
                >
                  <div className="flex gap-5">
                    <div className={`shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${notification.isRead ? "bg-slate-50 dark:bg-slate-800" : "bg-superadminprimary/10 text-superadminprimary"}
                    `}>
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg font-bold leading-tight ${notification.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="px-2 py-0.5 rounded-full bg-superadminprimary text-white text-[10px] font-black uppercase tracking-widest">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Clock className="h-3 w-3" />
                            {getTimeLabel(notification.createdAt)}
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button 
                              onClick={() => markAsRead(notification._id)}
                              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                              title="Mark as read"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notification._id)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className={`mt-3 text-sm leading-relaxed ${notification.isRead ? "text-slate-500 dark:text-slate-500" : "text-slate-600 dark:text-slate-300"}`}>
                        {notification.message}
                      </p>

                      {notification.link && (
                        <a 
                          href={notification.link} 
                          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-superadminprimary hover:underline group/link"
                        >
                          View Details
                          <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="h-24 w-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                <Inbox className="h-10 w-10 text-slate-200 dark:text-superadminprimary/85" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Clear!</h2>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">You don't have any notifications at the moment. We'll let you know when something important happens.</p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  Megaphone,
  User,
  Clock,
  ChevronRight
} from "lucide-react";
import { 
  useGetUserNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation,
  useGetUnreadCountQuery 
} from "../redux/Apis/notificationApi";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket, connectSocket } from "../utils/socket";

const NotificationItem = ({ notification, onMarkAsRead, isLast }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "announcement": return <Megaphone className="h-4 w-4 text-superadminprimary" />;
      case "assignment": return <Info className="h-4 w-4 text-blue-500" />;
      case "grade": return <Check className="h-4 w-4 text-emerald-500" />;
      case "system": return <ShieldAlert className="h-4 w-4 text-slate-500" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div 
      className={`p-4 transition-colors relative group
        ${notification.isRead ? "opacity-60" : "bg-blue-50/30 dark:bg-superadminprimary/5"}
        ${!isLast && "border-b border-slate-100 dark:border-slate-800"}
      `}
    >
      <div className="flex gap-3">
        <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300
          ${notification.isRead ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-slate-900 shadow-sm"}
        `}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-bold truncate ${notification.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-superadminprimary animate-pulse shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimeAgo(notification.createdAt)}
            </span>
            {!notification.isRead && (
              <button 
                onClick={() => onMarkAsRead(notification._id)}
                className="text-[10px] text-superadminprimary font-bold hover:underline"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { 
    data: notificationsData, 
    isLoading, 
    refetch: refetchNotifications 
  } = useGetUserNotificationsQuery({ limit: 5 });
  
  const { 
    data: unreadData, 
    refetch: refetchUnread 
  } = useGetUnreadCountQuery();

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadData?.data?.count || 0;

  useEffect(() => {
    // Only connect if user is authenticated
    const socket = connectSocket();
    
    if (socket) {
      const handleNewNotification = () => {
        // Refetch RTK Query data on arrival
        refetchNotifications();
        refetchUnread();
      };

      socket.on("new_notification", handleNewNotification);

      return () => {
        socket.off("new_notification", handleNewNotification);
      };
    }
  }, [refetchNotifications, refetchUnread]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 group
          ${isOpen ? "bg-superadminprimary text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-lavender-dark"}
        `}
      >
        <Bell className={`h-5 w-5 ${isOpen ? "animate-none" : "group-hover:rotate-12"}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-premium-border ring-2 ring-red-500/20">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-deep-charcoal rounded-2xl shadow-2xl border border-slate-200 dark:border-premium-border overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-charcoal">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-superadminprimary/10 text-superadminprimary text-[10px] font-bold">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs font-bold text-superadminprimary hover:text-superadminprimary/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <div className="animate-spin h-6 w-6 border-2 border-superadminprimary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs font-medium uppercase tracking-widest">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n, idx) => (
                  <NotificationItem 
                    key={n._id} 
                    notification={n} 
                    onMarkAsRead={markAsRead}
                    isLast={idx === notifications.length - 1} 
                  />
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 dark:text-slate-600">
                  <div className="h-16 w-16 bg-slate-50 dark:bg-navy-charcoal rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 opacity-80 dark:text-superadminprimary" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-300">No Notifications</h4>
                  <p className="text-xs mt-1">You're all caught up!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-superadminprimary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
            >
              See all notifications
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;

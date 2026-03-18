import React from "react";
import { Mail, Phone, ShieldCheck, X } from "lucide-react";

const ChatProfile = ({ selectedChat, showProfile, setShowProfile }) => {
  const displayName = selectedChat?.name || "Unknown";
  const displayRole = selectedChat?.roleLabel || "Contact";

  return (
    <>
      {/* Overlay for mobile/tablet when profile is open */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowProfile(false)}
        />
      )}

      <aside
        className={`${
          showProfile ? "translate-x-0" : "translate-x-full"
        } fixed right-0 top-0 h-full z-50 lg:static lg:z-auto transition-transform duration-300 ease-in-out w-[86vw] max-w-[340px] lg:w-[320px] xl:w-[360px] shrink-0 border-l border-slate-100 dark:border-white/5 flex flex-col bg-slate-50/30 dark:bg-navy-charcoal/50`}
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Profile Info
          </span>
          <button
            onClick={() => setShowProfile(false)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="size-28 rounded-full bg-lavender-light dark:bg-premium-gold/10 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-1 ring-slate-100 dark:ring-white/5 flex items-center justify-center">
              {selectedChat?.avatar ? (
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat?.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-studprimary dark:text-premium-gold">
                  {selectedChat?.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"}
                </span>
              )}
            </div>
            {selectedChat?.online && (
              <div className="absolute bottom-1 right-1 size-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full shadow-md"></div>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {displayName}
          </h3>
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            {displayRole}
          </p>

          <div className="flex gap-2 mt-8">
            {[Mail, Phone, ShieldCheck].map((Icon, i) => (
              <button
                key={i}
                className="p-3 rounded-2xl bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-studprimary dark:hover:bg-premium-gold hover:text-white dark:hover:text-deep-charcoal transition-all shadow-sm border border-slate-200 dark:border-white/5"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar space-y-8 overflow-scroll-smooth">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Professional Overview
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Name
                </span>
                <span className="text-slate-900 dark:text-white">
                  {displayName}
                </span>
              </div>
              {selectedChat?.email && (
                <div className="flex justify-between items-center text-xs font-bold gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Email
                  </span>
                  <span className="text-slate-900 dark:text-white truncate">
                    {selectedChat.email}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] border uppercase tracking-tight ${
                    selectedChat?.online
                      ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-100 dark:border-green-500/20"
                      : "bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
                  }`}
                >
                  {selectedChat?.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Admin Notes
            </p>
            <textarea
              placeholder="Add a private staff note..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-24 p-4 outline-none focus:ring-2 focus:ring-studprimary dark:focus:ring-premium-gold transition-all dark:text-white shadow-inner resize-none custom-scrollbar scroll-smooth"
            ></textarea>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatProfile;

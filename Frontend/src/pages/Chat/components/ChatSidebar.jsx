import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Users,
  X,
  MessageSquarePlus,
  Loader2,
  Signal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../../components/Tabs";

const roleLabelMap = {
  student: "Student",
  teacher: "Teacher",
  admin: "Organization Admin",
  superadmin: "Super Admin",
};

const normalizeContactName = (contact) => {
  const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  return fullName || contact.name || "Unknown";
};

const ChatSidebar = ({
  chatsData,
  selectedChat,
  setSelectedChat,
  contacts = [],
  onStartConversation,
  showNewChatModal,
  setShowNewChatModal,
  loading,
  searchQuery,
  setSearchQuery,
  isSocketConnected = true,
  isMobileHidden = false,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedContact, setSelectedContact] = useState("");
  const [subject, setSubject] = useState("");

  const filteredChats = chatsData.filter((chat) => {
    let matchesTab = true;
    if (activeTab === "unread") matchesTab = chat.unread > 0;
    if (activeTab === "staff") matchesTab = chat.isStaff === true;

    let matchesSearch = true;
    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        chat.name?.toLowerCase().includes(q) ||
        chat.lastMessage?.toLowerCase().includes(q);
    }

    return matchesTab && matchesSearch;
  });

  const handleStartChat = (event) => {
    event.preventDefault();
    if (!selectedContact || !onStartConversation) return;

    const contact = contacts.find((entry) => (entry._id || entry.id) === selectedContact);
    if (!contact) return;

    onStartConversation(
      {
        id: contact._id || contact.id,
        model: contact.model || "User",
        role: contact.role || contact.userType,
        name: normalizeContactName(contact),
      },
      subject,
    );

    setSelectedContact("");
    setSubject("");
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`${isMobileHidden ? "hidden sm:flex" : "flex"} w-full sm:w-[320px] xl:w-[360px] border-r border-slate-100 dark:border-white/5 flex-col h-full bg-slate-50/40 dark:bg-navy-charcoal/60`}
    >
      <div className="p-5 border-b border-slate-100 dark:border-white/5 mb-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-studprimary dark:bg-premium-gold flex items-center justify-center text-white dark:text-deep-charcoal shadow-lg">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                EduVers
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Chat Portal
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
              isSocketConnected ? "text-green-600" : "text-amber-600"
            }`}
          >
            <Signal size={12} /> {isSocketConnected ? "Live" : "Reconnecting"}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={() => setShowNewChatModal && setShowNewChatModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal text-sm font-bold shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 hover:brightness-110 transition-all active:scale-[0.98]"
        >
          <MessageSquarePlus size={18} />
          <span>New Conversation</span>
        </button>

        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-studprimary dark:hover:text-premium-gold hover:bg-slate-100 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-studprimary/10 dark:hover:border-premium-gold/10"
        >
          <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Go to Dashboard</span>
        </Link>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            placeholder="Search conversations..."
            value={searchQuery || ""}
            onChange={(event) => setSearchQuery && setSearchQuery(event.target.value)}
            className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 text-xs focus:ring-2 focus:ring-studprimary dark:focus:ring-premium-gold outline-none transition-all dark:text-white"
          />
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList variant="line" className="w-full border-none p-0 bg-transparent gap-6">
            <TabsTrigger
              value="all"
              className="px-0 pb-1 text-xs font-bold text-slate-400 dark:text-slate-500 data-[state=active]:text-studprimary dark:data-[state=active]:text-premium-gold bg-transparent border-none shadow-none rounded-none border-b-2 data-[state=active]:border-studprimary dark:data-[state=active]:border-premium-gold transition-all"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="px-0 pb-1 text-xs font-bold text-slate-400 dark:text-slate-500 data-[state=active]:text-studprimary dark:data-[state=active]:text-premium-gold bg-transparent border-none shadow-none rounded-none border-b-2 data-[state=active]:border-studprimary dark:data-[state=active]:border-premium-gold transition-all"
            >
              Unread
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="px-0 pb-1 text-xs font-bold text-slate-400 dark:text-slate-500 data-[state=active]:text-studprimary dark:data-[state=active]:text-premium-gold bg-transparent border-none shadow-none rounded-none border-b-2 data-[state=active]:border-studprimary dark:data-[state=active]:border-premium-gold transition-all"
            >
              Staff
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Loader2 size={24} className="animate-spin mb-2" />
            <p className="text-xs font-bold">Loading conversations...</p>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`relative group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
                selectedChat?.id === chat.id
                  ? "bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-slate-100 dark:border-white/5"
                  : "hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {selectedChat?.id === chat.id && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-studprimary dark:bg-premium-gold rounded-full"></div>
              )}

              <div className="relative shrink-0">
                {chat.avatar ? (
                  <img
                    src={chat.avatar}
                    className="size-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                    alt={chat.name}
                  />
                ) : (
                  <div className="size-11 rounded-2xl bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center text-studprimary dark:text-premium-gold border border-studprimary/10 text-sm font-bold">
                    {chat.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "?"}
                  </div>
                )}
                {chat.online === true && (
                  <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5 gap-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {chat.name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <p className="truncate flex-1">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="ml-2 size-5 bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <p className="text-xs font-bold">No conversations found</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Start a new conversation to begin chatting
            </p>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-charcoal rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-white/10">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Conversation</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-400"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStartChat} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Select Contact
                </label>
                <select
                  value={selectedContact}
                  onChange={(event) => setSelectedContact(event.target.value)}
                  required
                  className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm focus:ring-2 focus:ring-studprimary dark:focus:ring-premium-gold outline-none transition-all dark:text-white"
                >
                  <option value="">Choose contact...</option>
                  {contacts.map((contact) => {
                    const id = contact._id || contact.id;
                    const role = contact.role || contact.userType;
                    return (
                      <option key={id} value={id}>
                        {normalizeContactName(contact)}
                        {role ? ` (${roleLabelMap[role] || role})` : ""}
                        {contact.email ? ` - ${contact.email}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="What would you like to discuss?"
                  className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm focus:ring-2 focus:ring-studprimary dark:focus:ring-premium-gold outline-none transition-all dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedContact}
                  className="flex-1 h-12 rounded-2xl bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal text-sm font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ChatSidebar;

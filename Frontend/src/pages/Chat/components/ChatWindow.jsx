import React, { useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Megaphone,
  Lock,
  User,
  Loader2,
} from "lucide-react";

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getDateDivider = (dateString) => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "Today";

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMessage = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const dayDiff = Math.round((startToday - startMessage) / (1000 * 60 * 60 * 24));

  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const groupMessagesByDate = (messages) => {
  const groups = [];
  let previousDay = "";

  messages.forEach((message) => {
    const createdAt = message.createdAt || message.created_at || message.timeRaw;
    const currentDay = getDateDivider(createdAt);

    if (currentDay !== previousDay) {
      groups.push({ type: "divider", label: currentDay, id: `divider-${currentDay}-${message.id}` });
      previousDay = currentDay;
    }

    groups.push({ type: "message", message, id: `message-${message.id}` });
  });

  return groups;
};

export const ChatHeader = ({
  selectedChat,
  showProfile,
  setShowProfile,
  onBackMobile,
  isSocketConnected,
}) => (
  <header className="h-20 shrink-0 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-4 md:px-6 bg-white/95 dark:bg-navy-charcoal/95 backdrop-blur-md z-10">
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onBackMobile}
        className="sm:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
        aria-label="Back to conversations"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="size-11 rounded-2xl bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center text-studprimary dark:text-premium-gold border border-studprimary/10 text-sm font-bold">
        {selectedChat?.name
          ?.split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || <User size={20} />}
      </div>
      <div
        onClick={() => setShowProfile(!showProfile)}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {selectedChat?.name}
          </h2>
        </div>
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span
            className={`size-1.5 rounded-full ${
              isSocketConnected && selectedChat?.online ? "bg-green-500" : "bg-slate-300"
            }`}
          ></span>
          {isSocketConnected ? (selectedChat?.online ? "Active Now" : "Offline") : "Connecting"} • Academic Hub
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button className="p-2.5 rounded-xl text-slate-400 hover:text-studprimary dark:hover:text-premium-gold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
        <Search size={20} />
      </button>
      <button className="p-2.5 rounded-xl text-slate-400 hover:text-studprimary dark:hover:text-premium-gold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
        <Video size={20} />
      </button>
      <button className="p-2.5 rounded-xl text-slate-400 hover:text-studprimary dark:hover:text-premium-gold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
        <MoreVertical size={20} />
      </button>
    </div>
  </header>
);

export const MessageList = ({ messagesData, typingUsers, conversationId }) => {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messagesData]);

  const isTyping = typingUsers && typingUsers[conversationId];
  const groupedItems = groupMessagesByDate(messagesData || []);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent scroll-smooth"
    >
      {messagesData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <div className="size-16 rounded-3xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center mb-4">
            <Megaphone
              size={28}
              className="text-studprimary dark:text-premium-gold"
            />
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            No messages yet
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Send the first message to start the conversation!
          </p>
        </div>
      ) : (
        <>
          {groupedItems.map((item) => {
            if (item.type === "divider") {
              return (
                <div key={item.id} className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-navy-charcoal px-3">
                    {item.label}
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
                </div>
              );
            }

            const msg = item.message;

            return (
              <div
                key={item.id}
                className={`flex flex-col animate-message ${
                  msg.type === "broadcast"
                    ? "items-center translate-y-2"
                    : msg.isMe
                      ? "items-end"
                      : "items-start"
                }`}
              >
                {msg.type === "broadcast" ? (
                  <div className="bg-studprimary/5 dark:bg-premium-gold/5 border border-studprimary/10 dark:border-premium-gold/10 rounded-3xl p-6 w-full max-w-lg text-center shadow-sm">
                    <div className="size-12 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center text-studprimary dark:text-premium-gold mx-auto mb-4">
                      <Megaphone size={24} />
                    </div>
                    <p className="text-[10px] font-extrabold text-studprimary dark:text-premium-gold uppercase tracking-tighter mb-2">
                      SYSTEM BROADCAST
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 italic px-4 leading-relaxed">
                      "{msg.content}"
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-4">
                      {formatMessageTime(msg.createdAt || msg.created_at || msg.timeRaw)}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`flex gap-3 max-w-[92%] md:max-w-[74%] ${
                      msg.isMe ? "flex-row-reverse" : ""
                    }`}
                  >
                    {!msg.isMe && (
                      <div className="size-9 rounded-full shrink-0 border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        {msg.avatar ? (
                          <img
                            src={msg.avatar}
                            className="w-full h-full object-cover"
                            alt={msg.sender}
                          />
                        ) : (
                          <span className="text-xs font-bold text-studprimary dark:text-premium-gold">
                            {msg.sender
                              ?.split(" ")
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "?"}
                          </span>
                        )}
                      </div>
                    )}
                    <div className={`flex flex-col ${msg.isMe ? "items-end" : ""}`}>
                      <div className="flex items-baseline gap-2 mb-1.5 px-1">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200">
                          {msg.isMe ? "You" : msg.sender}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                          {formatMessageTime(msg.createdAt || msg.created_at || msg.timeRaw)}
                        </span>
                      </div>
                      <div
                        className={`p-4 rounded-3xl shadow-sm ${
                          msg.isMe
                            ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal rounded-tr-none"
                            : "bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none"
                        } ${msg.isOptimistic ? "opacity-75" : "opacity-100"}`}
                      >
                        <p className="text-sm leading-relaxed font-medium break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 animate-message">
              <div className="size-9 rounded-full shrink-0 border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
              <div className="bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 rounded-3xl rounded-tl-none px-5 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span
                    className="size-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="size-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="size-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export const MessageInput = ({ message, setMessage, onSend, sending }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <footer className="p-4 md:p-6 chat-input-safe shrink-0 bg-white dark:bg-navy-charcoal border-t border-slate-100 dark:border-white/5">
      <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-3 border border-slate-200 dark:border-white/5 shadow-inner">
        <div className="flex gap-4 px-3 py-2 border-b border-slate-200 dark:border-white/5 mb-2">
          <button className="text-slate-400 hover:text-studprimary dark:hover:text-premium-gold transition-colors">
            <Paperclip size={18} />
          </button>
          <button className="text-slate-400 hover:text-studprimary dark:hover:text-premium-gold transition-colors">
            <Smile size={18} />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 my-auto"></div>
          <button className="text-[10px] font-extrabold text-slate-400 hover:text-studprimary transition-colors">
            B
          </button>
          <button className="text-[10px] font-extrabold italic text-slate-400 hover:text-studprimary transition-colors">
            I
          </button>
        </div>
        <div className="flex gap-3 items-center px-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-sm resize-none h-11 md:h-12 dark:text-white transition-all custom-scrollbar py-2"
          />
          <button
            onClick={onSend}
            disabled={!message?.trim() || sending}
            className="shrink-0 size-11 bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal rounded-2xl flex items-center justify-center shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};

const ChatWindow = ({
  selectedChat,
  messagesData,
  message,
  setMessage,
  showProfile,
  setShowProfile,
  onSendMessage,
  onBackMobile,
  sending,
  typingUsers,
  conversationId,
  isSocketConnected = true, // Connection status for UI feedback
}) => {
  return (
    <main className="flex-1 flex flex-col h-full bg-white dark:bg-navy-charcoal overflow-hidden relative">
      <ChatHeader
        selectedChat={selectedChat}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        onBackMobile={onBackMobile}
        isSocketConnected={isSocketConnected}
      />
      <MessageList
        messagesData={messagesData}
        typingUsers={typingUsers}
        conversationId={conversationId}
      />
      <MessageInput
        message={message}
        setMessage={setMessage}
        onSend={onSendMessage}
        sending={sending}
      />
    </main>
  );
};

export default ChatWindow;

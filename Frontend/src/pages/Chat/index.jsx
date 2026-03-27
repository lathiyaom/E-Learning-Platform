import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../../redux/slice/authSlice";
import { chatApi } from "../../api";
import {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendTyping,
  sendStopTyping,
  emitUserOnline,
} from "../../utils/socket";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import ChatProfile from "./components/ChatProfile";
import "./chat.css";

const getCurrentUserId = (user) => String(user?._id || user?.id || "");
const normalizeRole = (role) => String(role || "").toLowerCase();

const guessCurrentModel = (user) => {
  const role = normalizeRole(user?.userType);
  if (["admin", "superadmin"].includes(role)) {
    return "Tenant";
  }
  return user?.role === "tenant" ? "Tenant" : "User";
};

const safeDate = (dateString) => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatConversationTime = (dateString) => {
  const date = safeDate(dateString);
  if (!date) return "";

  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getParticipantName = (participant) => {
  if (!participant) return "Unknown";
  if (participant.name) return participant.name;
  const fullName = `${participant.firstName || ""} ${participant.lastName || ""}`.trim();
  return fullName || "Unknown";
};

const isRoleLikeFallbackName = (value) =>
  ["Teacher", "Student", "Organization Admin", "Super Admin", "Contact", "Unknown"].includes(
    String(value || "").trim(),
  );

const isSelfParticipant = (participant, currentUserId, currentUserModel) => {
  if (!participant) return false;
  const participantId = String(participant.id || participant._id || "");
  const participantModel = participant.model || participant.participant_model || "User";

  return participantId === currentUserId && participantModel === currentUserModel;
};

const roleLabelMap = {
  student: "Student",
  teacher: "Teacher",
  admin: "Organization Admin",
  superadmin: "Super Admin",
};

function ChatPage() {
  const user = useSelector(selectCurrentUser);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const [typingUsers, setTypingUsers] = useState({});
  const [onlineParticipantKeys, setOnlineParticipantKeys] = useState(new Set());

  const [isMobileConversationListOpen, setIsMobileConversationListOpen] = useState(true);

  const typingTimeoutRef = useRef(null);
  const activeConversationRef = useRef(null);
  const pendingOptimisticRef = useRef(new Set());

  const currentUserId = useMemo(() => getCurrentUserId(user), [user]);
  const currentUserModel = useMemo(() => guessCurrentModel(user), [user]);
  const markConversationUpdated = useCallback((conversationPayload) => {
    setConversations((prev) => {
      const existingIndex = prev.findIndex((entry) => entry._id === conversationPayload._id);
      if (existingIndex === -1) {
        return [conversationPayload, ...prev];
      }

      const updated = [...prev];
      updated[existingIndex] = { ...updated[existingIndex], ...conversationPayload };
      updated.sort((a, b) => {
        const aTime = new Date(a.last_message_at || 0).getTime();
        const bTime = new Date(b.last_message_at || 0).getTime();
        return bTime - aTime;
      });
      return updated;
    });
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatApi.getConversations();
      if (response?.data?.success) {
        setConversations(response.data.data || []);
      } else {
        throw new Error(response?.data?.message || "Failed to load conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await chatApi.getContacts();
      if (response?.data?.success) {
        setContacts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await chatApi.getMessages(conversationId);
      if (response?.data?.success) {
        setMessages(response.data.data || []);
        pendingOptimisticRef.current.clear();
      } else {
        throw new Error(response?.data?.message || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                isUnread: false,
                unreadCount: 0,
              }
            : conversation,
        ),
      );
    } catch (error) {
      console.warn("Failed to mark conversation as read:", error);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    fetchConversations();
    fetchContacts();
  }, [currentUserId, fetchConversations, fetchContacts]);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = connectSocket();
    if (!socket) return undefined;

    const onConnect = () => {
      setIsSocketConnected(true);
      emitUserOnline(currentUserId);
      if (activeConversationRef.current) {
        joinConversation(activeConversationRef.current);
      }
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const onConversationUpdated = ({ conversation: payload }) => {
      if (!payload?._id) return;
      markConversationUpdated(payload);

      if (activeConversationRef.current === payload._id && payload.isUnread) {
        fetchMessages(payload._id);
        markAsRead(payload._id);
      }
    };

    const onNewMessage = ({ conversationId, message: serverMessage }) => {
      if (!serverMessage?._id || !conversationId) return;

      const isActiveConversation = activeConversationRef.current === conversationId;
      const senderId = String(serverMessage?.sender_id?._id || serverMessage?.sender_id || "");
      const senderModel = serverMessage?.sender_model || "User";
      const isFromCurrentUser =
        senderId === currentUserId &&
        (senderModel === currentUserModel || ["User", "Tenant"].includes(senderModel));

      setMessages((prev) => {
        const exists = prev.some((entry) => entry._id === serverMessage._id);
        if (exists) return prev;

        if (isActiveConversation) {
          const withoutOptimistic = prev.filter((entry) => {
            if (!entry?.isOptimistic) return true;
            const sameText = String(entry?.message || "").trim() === String(serverMessage?.message || "").trim();
            const sameSender =
              String(entry?.sender_id?._id || entry?.sender_id || "") ===
              String(serverMessage?.sender_id?._id || serverMessage?.sender_id || "");
            return !(sameText && sameSender);
          });

          return [...withoutOptimistic, serverMessage];
        }

        return prev;
      });

      setConversations((prev) => {
        const next = prev.map((conversation) => {
          if (conversation._id !== conversationId) {
            return conversation;
          }

          const unreadCount = isActiveConversation || isFromCurrentUser
            ? 0
            : Number(conversation.unreadCount || 0) + 1;

          return {
            ...conversation,
            last_message: serverMessage.message,
            last_message_at: serverMessage.created_at || new Date().toISOString(),
            isUnread: !(isActiveConversation || isFromCurrentUser),
            unreadCount,
          };
        });

        next.sort((a, b) => {
          const aTime = new Date(a.last_message_at || 0).getTime();
          const bTime = new Date(b.last_message_at || 0).getTime();
          return bTime - aTime;
        });

        return next;
      });

      if (isActiveConversation && !isFromCurrentUser) {
        markAsRead(conversationId);
      }
    };

    const onTyping = ({ conversationId, participantKey, userId }) => {
      if (!conversationId) return;
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: participantKey || String(userId || ""),
      }));
    };

    const onStopTyping = ({ conversationId }) => {
      if (!conversationId) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    };

    const onUserStatus = ({ participantKey, userId, model, status }) => {
      const key = participantKey || `${model || "User"}:${String(userId || "")}`;
      if (!key || key.endsWith(":")) return;

      setOnlineParticipantKeys((prev) => {
        const next = new Set(prev);
        if (status === "online") {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("conversation_updated", onConversationUpdated);
    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onTyping);
    socket.on("user_stop_typing", onStopTyping);
    socket.on("user_status_change", onUserStatus);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("conversation_updated", onConversationUpdated);
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onTyping);
      socket.off("user_stop_typing", onStopTyping);
      socket.off("user_status_change", onUserStatus);
      disconnectSocket();
    };
  }, [currentUserId, currentUserModel, fetchMessages, markAsRead, markConversationUpdated]);

  useEffect(() => {
    activeConversationRef.current = selectedConversationId || null;

    if (!selectedConversationId) return undefined;

    joinConversation(selectedConversationId).catch(() => false);

    fetchMessages(selectedConversationId);
    markAsRead(selectedConversationId);

    return () => {
      leaveConversation(selectedConversationId);
    };
  }, [selectedConversationId, fetchMessages, markAsRead]);

  const selectedConversation = useMemo(
    () => conversations.find((entry) => entry._id === selectedConversationId) || null,
    [conversations, selectedConversationId],
  );

  const chatsData = useMemo(() => {
    const items = conversations.map((conversation) => {
        const payloadOtherParticipant =
          conversation.otherParticipant &&
          !isSelfParticipant(conversation.otherParticipant, currentUserId, currentUserModel)
            ? conversation.otherParticipant
            : null;

        const otherParticipant =
          payloadOtherParticipant ||
          (conversation.participants || []).find((entry) => {
            const entryId = String(entry.id || entry._id || "");
            const entryModel = entry.model || entry.participant_model || "User";
            return !(entryId === currentUserId && entryModel === currentUserModel);
          }) ||
          null;

        const otherName = getParticipantName(otherParticipant);
        const otherParticipantId = String(otherParticipant?.id || otherParticipant?._id || "");
        const matchingContact = contacts.find(
          (entry) => String(entry?._id || entry?.id || "") === otherParticipantId,
        );
        const contactName = matchingContact
          ? getParticipantName({
              name: matchingContact.name,
              firstName: matchingContact.firstName,
              lastName: matchingContact.lastName,
            })
          : "";
        const resolvedName =
          (!otherName || isRoleLikeFallbackName(otherName)) && contactName ? contactName : otherName;
        const otherRole = normalizeRole(otherParticipant?.role || otherParticipant?.userType);
        const participantKey =
          otherParticipant?.participantKey ||
          `${otherParticipant?.model || "User"}:${String(otherParticipant?.id || otherParticipant?._id || "")}`;

        return {
          id: conversation._id,
          _id: conversation._id,
          name: resolvedName || "Unknown",
          role: roleLabelMap[otherRole] || "Contact",
          roleLabel: roleLabelMap[otherRole] || "Contact",
          email: otherParticipant?.email || "",
          avatar: otherParticipant?.avatar || null,
          lastMessage: conversation.last_message || "No messages yet",
          time: formatConversationTime(conversation.last_message_at),
          unread: conversation.isUnread ? conversation.unreadCount || 1 : 0,
          online: onlineParticipantKeys.has(participantKey),
          isStaff: ["teacher", "admin", "superadmin"].includes(otherRole),
          participantKey,
          _raw: conversation,
        };
      });

    // Collapse duplicate threads that point to the same other participant.
    const byParticipant = new Map();
    items.forEach((item) => {
      const key = item.participantKey || item.id;
      const existing = byParticipant.get(key);
      if (!existing) {
        byParticipant.set(key, item);
        return;
      }

      const existingTime = new Date(existing?._raw?.last_message_at || 0).getTime();
      const currentTime = new Date(item?._raw?.last_message_at || 0).getTime();
      if (currentTime > existingTime) {
        byParticipant.set(key, item);
      }
    });

    return Array.from(byParticipant.values()).sort(
      (a, b) => new Date(b?._raw?.last_message_at || 0).getTime() - new Date(a?._raw?.last_message_at || 0).getTime(),
    );
  }, [conversations, contacts, currentUserId, currentUserModel, onlineParticipantKeys]);

  const selectedChatData = useMemo(
    () => chatsData.find((entry) => entry.id === selectedConversationId) || null,
    [chatsData, selectedConversationId],
  );

  const messagesData = useMemo(
    () =>
      messages.map((messageItem) => {
        const senderId = String(messageItem.sender_id?._id || messageItem.sender_id || "");
        const senderModel = messageItem.sender_model || "User";

        const isMe =
          senderId === currentUserId &&
          (senderModel === currentUserModel || ["User", "Tenant"].includes(senderModel));

        const senderName = messageItem.sender_id?.firstName
          ? `${messageItem.sender_id.firstName || ""} ${messageItem.sender_id.lastName || ""}`.trim()
          : messageItem.sender_id?.OrgOwnerName ||
            messageItem.sender_id?.name ||
            (isMe ? "You" : "Unknown");

        return {
          id: messageItem._id,
          _id: messageItem._id,
          content: messageItem.message,
          sender: senderName,
          senderModel,
          createdAt: messageItem.created_at || messageItem.createdAt,
          created_at: messageItem.created_at,
          timeRaw: messageItem.created_at || messageItem.createdAt,
          isMe,
          type: messageItem.message_type || "text",
          avatar: messageItem.sender_id?.avatar || null,
          isOptimistic: Boolean(messageItem.isOptimistic),
        };
      }),
    [messages, currentUserId, currentUserModel],
  );

  const handleSelectChat = useCallback((chatItem) => {
    if (!chatItem?.id) return;
    setSelectedConversationId(chatItem.id);
    setShowProfile(false);
    setIsMobileConversationListOpen(false);
  }, []);

  const handleMessageChange = useCallback(
    (value) => {
      setMessage(value);

      if (!selectedConversationId || !currentUserId) return;

      sendTyping(selectedConversationId, currentUserId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(selectedConversationId, currentUserId);
      }, 1500);
    },
    [selectedConversationId, currentUserId],
  );

  const handleStartConversation = useCallback(
    async (targetContact, subject) => {
      try {
        const payload = {
          target_id: targetContact.id,
          target_model: targetContact.model,
          target_role: targetContact.role,
          subject: subject || "General Discussion",
        };

        const response = await chatApi.startConversation(payload);
        if (!response?.data?.success) {
          throw new Error(response?.data?.message || "Failed to start conversation");
        }

        const conversation = response.data.data;
        markConversationUpdated(conversation);
        setSelectedConversationId(conversation._id);
        setShowNewChatModal(false);
        setIsMobileConversationListOpen(false);
        toast.success("Conversation ready");
      } catch (error) {
        console.error("Failed to start conversation:", error);
        toast.error(error?.response?.data?.message || error.message || "Failed to start conversation");
      }
    },
    [markConversationUpdated],
  );

  const handleSendMessage = useCallback(async () => {
    const text = message.trim();
    if (!text || !selectedConversationId || sending) return;

    const optimisticId = `optimistic-${selectedConversationId}-${Date.now()}`;
    const idempotencyKey = `${selectedConversationId}-${Date.now()}-${text.length}`;

    const optimisticMessage = {
      _id: optimisticId,
      message: text,
      sender_id: {
        _id: currentUserId,
        firstName: user?.firstName,
        lastName: user?.lastName,
        name: user?.name,
        OrgOwnerName: user?.OrgOwnerName,
        avatar: user?.avatar || null,
      },
      sender_model: currentUserModel,
      message_type: "text",
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessage("");
    setSending(true);
    pendingOptimisticRef.current.add(optimisticId);
    setMessages((prev) => [...prev, optimisticMessage]);

    sendStopTyping(selectedConversationId, currentUserId);

    try {
      const response = await chatApi.sendMessage({
        conversation_id: selectedConversationId,
        message: text,
        idempotencyKey,
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to send message");
      }

      const serverMessage = response.data.data;

      setMessages((prev) => {
        const hasServerAlready = prev.some((entry) => entry._id === serverMessage?._id);
        if (hasServerAlready) {
          return prev.filter((entry) => entry._id !== optimisticId);
        }

        return prev.map((entry) =>
          entry._id === optimisticId ? { ...serverMessage, isOptimistic: false } : entry,
        );
      });

      pendingOptimisticRef.current.delete(optimisticId);

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === selectedConversationId
            ? {
                ...conversation,
                last_message: text,
                last_message_at: new Date().toISOString(),
              }
            : conversation,
        ),
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      pendingOptimisticRef.current.delete(optimisticId);
      setMessages((prev) => prev.filter((entry) => entry._id !== optimisticId));
      setMessage(text);
      toast.error(error?.response?.data?.message || error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }, [
    currentUserId,
    currentUserModel,
    message,
    selectedConversationId,
    sending,
    user,
  ]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!user) return null;

  const showMainPane = Boolean(selectedConversationId);

  return (
    <div className="chat-shell flex w-full min-w-0 bg-white dark:bg-deep-charcoal overflow-hidden">
      <ChatSidebar
        chatsData={chatsData}
        selectedChat={selectedChatData}
        setSelectedChat={handleSelectChat}
        contacts={contacts}
        onStartConversation={handleStartConversation}
        showNewChatModal={showNewChatModal}
        setShowNewChatModal={setShowNewChatModal}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        isSocketConnected={isSocketConnected}
        isMobileHidden={showMainPane && !isMobileConversationListOpen}
        onCloseMobile={() => setIsMobileConversationListOpen(false)}
      />

      {showMainPane ? (
        <>
          <ChatWindow
            selectedChat={selectedChatData}
            messagesData={messagesData}
            message={message}
            setMessage={handleMessageChange}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            onSendMessage={handleSendMessage}
            onBackMobile={() => {
              setIsMobileConversationListOpen(true);
              setSelectedConversationId(null);
            }}
            sending={sending}
            typingUsers={typingUsers}
            conversationId={selectedConversationId}
            isSocketConnected={isSocketConnected}
          />
          <ChatProfile
            selectedChat={selectedChatData}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
          />
        </>
      ) : (
        <main className="hidden sm:flex flex-1 items-center justify-center bg-slate-50 dark:bg-navy-charcoal">
          <div className="text-center px-4">
            <div className="size-20 rounded-3xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-studprimary dark:text-premium-gold"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Welcome to EduVers Chat
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
              Select a conversation to start messaging
            </p>
          </div>
        </main>
      )}
    </div>
  );
}

export default ChatPage;

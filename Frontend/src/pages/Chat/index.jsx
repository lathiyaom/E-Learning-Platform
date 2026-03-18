import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../../redux/slice/authSlice";
import { chatApi } from "../../api";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
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

/**
 * ChatPage - Main chat component with improved state management
 * Features:
 * - Idempotent message handling (no duplicates)
 * - Proper socket.io token synchronization
 * - Error recovery and graceful degradation
 * - Responsive design
 * - React Query-like server state with optimistic updates
 */

/**
 * ChatPage - Main chat component with improved state management
 * Features:
 * - Idempotent message handling (no duplicates)
 * - Proper socket.io token synchronization
 * - Error recovery and graceful degradation
 * - Responsive design
 * - React Query-like server state with optimistic updates
 */
function ChatPage() {
  const user = useSelector(selectCurrentUser);

  // ========== STATE MANAGEMENT ==========
  // Server state (from API)
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  // UI state
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Real-time state
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Socket connection state
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // ========== REFS ==========
  const typingTimeoutRef = useRef(null);
  const prevConversationIdRef = useRef(null);
  const pendingMessagesRef = useRef(new Map()); // Track optimistic messages
  const socketRef = useRef(null);

  // ========== UTILITY: Generate idempotency key ==========
  const generateIdempotencyKey = useCallback(
    (conversationId, messageText, timestamp = Date.now()) => {
      return `${conversationId}-${timestamp}-${messageText.length}`;
    },
    [],
  );

  // ========== SOCKET.IO SETUP ==========
  useEffect(() => {
    if (!(user?._id || user?.id)) return;

    try {
      const socket = connectSocket();
      if (!socket) {
        console.warn("Failed to connect socket");
        return;
      }

      socketRef.current = socket;

      // Socket connect event
      const handleConnect = () => {
        setIsSocketConnected(true);
        emitUserOnline((user._id || user.id));
      };

      const handleDisconnect = () => {
        setIsSocketConnected(false);
      };

      // Message and event handlers
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("new_message", handleNewMessage);
      socket.on("conversation_updated", handleConversationUpdated);
      socket.on("user_typing", handleUserTyping);
      socket.on("user_stop_typing", handleUserStopTyping);
      socket.on("user_status_change", handleUserStatusChange);
      socket.on("message_delivered", handleMessageDelivered);

      // On initial connect
      if (socket.connected) {
        handleConnect();
      }

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("new_message", handleNewMessage);
        socket.off("conversation_updated", handleConversationUpdated);
        socket.off("user_typing", handleUserTyping);
        socket.off("user_stop_typing", handleUserStopTyping);
        socket.off("user_status_change", handleUserStatusChange);
        socket.off("message_delivered", handleMessageDelivered);
        disconnectSocket();
        socketRef.current = null;
      };
    } catch (error) {
      console.error("Socket setup error:", error);
      toast.error("Connection error - some features may not work");
    }
  }, [(user?._id || user?.id)]);

  // ========== SOCKET EVENT HANDLERS ==========

  /**
   * Handle new message from socket
   * Deduplicates based on message _id and sender
   */
  const handleNewMessage = useCallback(
    (data) => {
      try {
        const { conversationId, message: newMsg } = data;

        if (!newMsg?._id) {
          console.warn("Invalid message data from socket");
          return;
        }

        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m._id === newMsg._id);
          if (exists) return prev;

          // Only add if we're viewing this conversation
          if (selectedChat?._id === conversationId) {
            return [...prev, newMsg];
          }
          return prev;
        });

        // Remove from pending if it was optimistic
        pendingMessagesRef.current.delete(newMsg._id);
      } catch (error) {
        console.error("Error handling new message:", error);
      }
    },
    [selectedChat?._id],
  );

  /**
   * Handle message delivery confirmation
   * Replaces optimistic message with server confirmation
   */
  const handleMessageDelivered = useCallback((data) => {
    try {
      const { optimisticId, messageId } = data;

      if (optimisticId && messageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticId
              ? { ...msg, _id: messageId, isOptimistic: false }
              : msg,
          ),
        );

        pendingMessagesRef.current.delete(optimisticId);
      }
    } catch (error) {
      console.error("Error handling message delivered:", error);
    }
  }, []);

  const handleConversationUpdated = useCallback((data) => {
    try {
      const { conversation } = data;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === conversation._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...conversation };
          updated.sort(
            (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at),
          );
          return updated;
        }
        return [conversation, ...prev];
      });
    } catch (error) {
      console.error("Error handling conversation update:", error);
    }
  }, []);

  const handleUserTyping = useCallback((data) => {
    try {
      const { conversationId, userId } = data;
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: userId,
      }));
    } catch (error) {
      console.error("Error handling typing indicator:", error);
    }
  }, []);

  const handleUserStopTyping = useCallback((data) => {
    try {
      const { conversationId } = data;
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    } catch (error) {
      console.error("Error handling stop typing:", error);
    }
  }, []);

  const handleUserStatusChange = useCallback((data) => {
    try {
      const { userId, status } = data;
      setOnlineUserIds((prev) => {
        const updated = new Set(prev);
        if (status === "online") {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    } catch (error) {
      console.error("Error handling status change:", error);
    }
  }, []);

  // ========== DATA FETCHING ==========

  useEffect(() => {
    if (!(user?._id || user?.id)) return;
    fetchConversations();
    fetchContacts();
  }, [(user?._id || user?.id)]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getConversations();
      if (response.data.success) {
        setConversations(response.data.data || []);
      } else {
        throw new Error(
          response.data.message || "Failed to load conversations",
        );
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await chatApi.getContacts();
      if (response.data.success) {
        setContacts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      // Graceful degradation - don't show error to user
    }
  };

  // ========== CHAT SELECTION & MESSAGE LOADING ==========

  useEffect(() => {
    if (!selectedChat?._id) return;

    // Leave previous conversation room
    if (
      prevConversationIdRef.current &&
      prevConversationIdRef.current !== selectedChat._id
    ) {
      leaveConversation(prevConversationIdRef.current);
    }

    // Join new conversation room
    joinConversation(selectedChat._id);
    prevConversationIdRef.current = selectedChat._id;

    // Fetch messages
    fetchMessages(selectedChat._id);

    // Mark as read (fire and forget)
    markAsRead(selectedChat._id).catch((err) =>
      console.warn("Failed to mark as read:", err),
    );
  }, [selectedChat?._id]);

  const fetchMessages = async (conversationId) => {
    try {
      const response = await chatApi.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data || []);
        // Clear pending messages for this conversation
        pendingMessagesRef.current.clear();
      } else {
        throw new Error(response.data.message || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Show error but keep previously loaded messages (graceful degradation)
      toast.error("Failed to load messages - showing cached data if available");
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId);
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, unread_student: false, unread_teacher: false }
            : conv,
        ),
      );
    } catch (error) {
      console.warn("Error marking as read:", error);
    }
  };

  // ========== SEND MESSAGE WITH IDEMPOTENCY ==========

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat?._id || sending) return;

    const messageText = message.trim();
    const conversationId = selectedChat._id;
    const timestamp = Date.now();
    const idempotencyKey = generateIdempotencyKey(
      conversationId,
      messageText,
      timestamp,
    );

    // Clear input immediately
    setMessage("");

    try {
      setSending(true);

      // Create optimistic message for immediate UI feedback
      const optimisticMessage = {
        _id: `optimistic-${idempotencyKey}`,
        message: messageText,
        sender_id: user,
        created_at: new Date().toISOString(),
        isOptimistic: true,
        idempotencyKey,
      };

      // Add optimistic message to UI
      setMessages((prev) => [...prev, optimisticMessage]);
      pendingMessagesRef.current.set(optimisticMessage._id, optimisticMessage);

      // Stop typing indicator
      sendStopTyping(conversationId, (user._id || user.id));

      // Send to server
      const response = await chatApi.sendMessage({
        conversation_id: conversationId,
        message: messageText,
        idempotencyKey, // Send key for server-side deduplication
      });

      if (response.data.success) {
        const serverMessage = response.data.data;

        // Replace optimistic with server confirmation
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessage._id
              ? { ...serverMessage, isOptimistic: false }
              : msg,
          ),
        );

        pendingMessagesRef.current.delete(optimisticMessage._id);

        // Update conversation last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId
              ? {
                  ...conv,
                  last_message: messageText,
                  last_message_at: new Date().toISOString(),
                }
              : conv,
          ),
        );
      } else {
        // Server error - remove optimistic message and restore input
        toast.error(response.data.message || "Failed to send message");
        setMessages((prev) =>
          prev.filter((m) => m._id !== optimisticMessage._id),
        );
        setMessage(messageText);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove optimistic message and restore input
      setMessages((prev) => prev.filter((m) => !m.isOptimistic));
      setMessage(messageText);

      // Show user-friendly error
      if (error.response?.status === 401) {
        toast.error("Session expired - please login again");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to send message - check your connection",
        );
      }
    } finally {
      setSending(false);
    }
  };

  // ========== TYPING INDICATOR ==========

  const handleMessageChange = (value) => {
    setMessage(value);

    if (selectedChat?._id && (user?._id || user?.id)) {
      sendTyping(selectedChat._id, (user._id || user.id));

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(selectedChat._id, (user._id || user.id));
      }, 2000);
    }
  };

  // ========== START NEW CONVERSATION ==========

  const handleStartConversation = async (contactId, subject) => {
    try {
      const payload = {
        subject: subject || "General Inquiry",
      };

      if (user?.userType === "teacher") {
        payload.student_id = contactId;
      } else {
        payload.teacher_id = contactId;
      }

      const response = await chatApi.startConversation(payload);

      if (response.data.success) {
        const newConversation = response.data.data;

        setConversations((prev) => {
          const exists = prev.some((c) => c._id === newConversation._id);
          if (exists) return prev;
          return [newConversation, ...prev];
        });

        setSelectedChat(newConversation);
        setShowNewChatModal(false);
        toast.success("Conversation started!");
      } else {
        toast.error(response.data.message || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error(
        error.response?.data?.message || "Failed to start conversation",
      );
    }
  };

  // ========== DATA TRANSFORMATION ==========

  // Get the other participant
  const getOtherParticipant = useCallback(
    (conversation) => {
      if (!conversation) return null;
      if (user?.userType === "student") {
        return conversation.teacher_id;
      }
      return conversation.student_id;
    },
    [user?.userType],
  );

  // Format time elegantly
  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  // Transform conversations (memoized to prevent unnecessary re-renders)
  const chatsData = useMemo(
    () =>
      conversations.map((conv) => {
        const other = getOtherParticipant(conv);
        const isUnread =
          user?.userType === "student"
            ? conv.unread_student
            : conv.unread_teacher;
        const otherUserId = other?._id || other;

        return {
          id: conv._id,
          _id: conv._id,
          name: other
            ? `${other.firstName || ""} ${other.lastName || ""}`.trim()
            : "Unknown User",
          avatar: null,
          lastMessage: conv.last_message || "No messages yet",
          time: formatTime(conv.last_message_at),
          unread: isUnread ? 1 : 0,
          online: onlineUserIds.has(otherUserId),
          isStaff: false,
          _raw: conv,
        };
      }),
    [
      conversations,
      getOtherParticipant,
      onlineUserIds,
      formatTime,
      user?.userType,
    ],
  );

  // Transform messages (memoized)
  const messagesData = useMemo(
    () =>
      messages.map((msg) => {
        const senderId = msg.sender_id?._id || msg.sender_id;
        const isMe = senderId === (user?._id || user?.id);
        const senderName = msg.sender_id?.firstName
          ? `${msg.sender_id.firstName} ${msg.sender_id.lastName || ""}`
          : isMe
            ? "You"
            : "Unknown";

        return {
          id: msg._id,
          _id: msg._id,
          content: msg.message,
          sender: senderName,
          time: formatTime(msg.created_at || msg.createdAt),
          isMe,
          type: msg.message_type || "text",
          avatar: null,
          isOptimistic: msg.isOptimistic,
        };
      }),
    [messages, formatTime, (user?._id || user?.id)]
  );

  // Get selected chat data
  const selectedChatData = useMemo(
    () =>
      selectedChat
        ? chatsData.find((c) => c.id === selectedChat._id) || null
        : null,
    [selectedChat, chatsData],
  );

  // Handle chat selection
  const handleSelectChat = useCallback(
    (chatItem) => {
      const conv = conversations.find((c) => c._id === chatItem.id);
      if (conv) {
        setSelectedChat(conv);
      }
    },
    [conversations],
  );

  // ========== RENDER ==========

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-deep-charcoal overflow-hidden">
      {/* Sidebar - Responsive */}
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
      />

      {/* Main Chat Area - Responsive */}
      {selectedChatData ? (
        <>
          <ChatWindow
            selectedChat={selectedChatData}
            messagesData={messagesData}
            message={message}
            setMessage={handleMessageChange}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            onSendMessage={handleSendMessage}
            sending={sending}
            typingUsers={typingUsers}
            conversationId={selectedChat?._id}
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

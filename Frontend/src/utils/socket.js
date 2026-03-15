import { io } from "socket.io-client";
import { store } from "../redux/store/store";

const SOCKET_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

let socket = null;
let authUnsubscribe = null;
let prevToken = null;

export const getSocket = () => socket;

/**
 * Establish socket connection with auth token
 * Handles reconnection and token refresh
 */
export const connectSocket = () => {
  if (socket?.connected) return socket;

  const state = store.getState();
  const token = state.auth?.accessToken;

  if (!token) {
    console.warn("Socket: No auth token available");
    return null;
  }

  try {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Store successfully connected token
    prevToken = token;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      // If auth error, force disconnect and wait for token refresh
      if (err.message?.includes("auth") || err.message?.includes("401")) {
        console.warn("Socket auth failed - waiting for token refresh");
        socket?.disconnect();
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      // Indicate disconnection for graceful degradation
      if (reason === "io server disconnect" || reason === "io client namespace disconnect") {
        // Server explicitly disconnected - might need re-auth
      }
    });

    // Subscribe to auth state changes for token updates
    setupTokenRefreshListener();

    return socket;
  } catch (error) {
    console.error("Error creating socket connection:", error);
    return null;
  }
};

/**
 * Sets up listener for auth token changes
 * Automatically updates socket auth when token refreshes
 */
export const setupTokenRefreshListener = () => {
  // Clean up previous subscription
  if (authUnsubscribe) {
    authUnsubscribe();
  }

  // Subscribe to Redux auth changes
  authUnsubscribe = store.subscribe(() => {
    const state = store.getState();
    const currentToken = state.auth?.accessToken;

    // Check if token has changed
    if (currentToken && currentToken !== prevToken) {
      console.log("Socket: Token refreshed - updating auth");
      prevToken = currentToken;

      if (socket?.connected) {
        // Update socket auth for next connection
        socket.auth = { token: currentToken };
        
        // Disconnect and reconnect to use new token
        socket.disconnect();
        socket.connect();
      }
    }
  });
};

export const disconnectSocket = () => {
  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  prevToken = null;
};

// Join a conversation room
export const joinConversation = (conversationId) => {
  if (socket?.connected) {
    socket.emit("join_conversation", conversationId);
  }
};

// Leave a conversation room
export const leaveConversation = (conversationId) => {
  if (socket?.connected) {
    socket.emit("leave_conversation", conversationId);
  }
};

// Send typing indicator
export const sendTyping = (conversationId, userId) => {
  if (socket?.connected) {
    socket.emit("typing", { conversationId, userId });
  }
};

// Stop typing indicator
export const sendStopTyping = (conversationId, userId) => {
  if (socket?.connected) {
    socket.emit("stop_typing", { conversationId, userId });
  }
};

// Mark user as online
export const emitUserOnline = (userId) => {
  if (socket?.connected) {
    socket.emit("user_online", userId);
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendTyping,
  sendStopTyping,
  emitUserOnline,
};

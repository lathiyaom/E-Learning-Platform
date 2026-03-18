import { io } from "socket.io-client";
import { store } from "../redux/store/store";

const SOCKET_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

let socket = null;
let authUnsubscribe = null;
let activeToken = null;

export const getSocket = () => socket;

const getCurrentToken = () => store.getState().auth?.accessToken || null;

const ensureSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
    timeout: 12000,
  });

  socket.on("connect", () => {
    // no-op: handled by subscribers in page components
  });

  socket.on("connect_error", (error) => {
    const message = error?.message || "Unknown socket connection error";
    console.error("Socket connection error:", message);
  });

  socket.on("disconnect", () => {
    // no-op: handled by subscribers in page components
  });

  return socket;
};

const setupTokenRefreshListener = () => {
  if (authUnsubscribe) {
    authUnsubscribe();
  }

  authUnsubscribe = store.subscribe(() => {
    const nextToken = getCurrentToken();
    if (nextToken === activeToken) {
      return;
    }

    activeToken = nextToken;

    if (!socket) {
      return;
    }

    if (!nextToken) {
      socket.disconnect();
      return;
    }

    socket.auth = { token: nextToken };
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  });
};

export const connectSocket = () => {
  const token = getCurrentToken();

  if (!token) {
    console.warn("Socket connection skipped: missing access token");
    return null;
  }

  const instance = ensureSocket();
  if (!instance) return null;

  activeToken = token;
  instance.auth = { token };

  setupTokenRefreshListener();

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
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

  activeToken = null;
};

// Join a conversation room
export const joinConversation = (conversationId) =>
  new Promise((resolve) => {
    if (!socket?.connected || !conversationId) {
      resolve(false);
      return;
    }

    socket.timeout(5000).emit(
      "join_conversation",
      { conversationId },
      (error, response) => {
        if (error) {
          resolve(false);
          return;
        }

        resolve(Boolean(response?.ok));
      },
    );
  });

// Leave a conversation room
export const leaveConversation = (conversationId) => {
  if (socket?.connected && conversationId) {
    socket.emit("leave_conversation", { conversationId });
  }
};

// Send typing indicator
export const sendTyping = (conversationId, userId) => {
  if (socket?.connected && conversationId) {
    socket.emit("typing", { conversationId, userId });
  }
};

// Stop typing indicator
export const sendStopTyping = (conversationId, userId) => {
  if (socket?.connected && conversationId) {
    socket.emit("stop_typing", { conversationId, userId });
  }
};

// Mark user as online
export const emitUserOnline = (userId) => {
  if (socket?.connected) {
    socket.emit("user_online", { userId });
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

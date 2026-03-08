import API from "../utils/axiosintence";

export const chatApi = {
  // Get available contacts for new conversations
  getContacts: () => API.get("/Chat/contacts"),

  // Start or get conversation
  startConversation: (data) => API.post("/Chat/start-conversation", data),
  
  // Send message
  sendMessage: (data) => API.post("/Chat/send-message", data),
  
  // Get conversation messages
  getMessages: (conversationId, params = {}) => API.get(`/Chat/messages/${conversationId}`, { params }),
  
  // Get user's conversations
  getConversations: (params = {}) => API.get("/Chat/conversations", { params }),
  
  // Mark conversation as read
  markAsRead: (conversationId) => API.patch(`/Chat/conversations/${conversationId}/read`),
  
  // Archive conversation
  archiveConversation: (conversationId) => API.patch(`/Chat/conversations/${conversationId}/archive`),
};

export default chatApi;

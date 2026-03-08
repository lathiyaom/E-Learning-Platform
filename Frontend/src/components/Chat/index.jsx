import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { chatApi } from '../../api';
import './Chat.css';

const Chat = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user?.id || !user?.userType) return;
    fetchConversations();
    fetchTeachers();
  }, [user?.id, user?.userType]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch conversations');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await chatApi.getContacts();
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch chat contacts');
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await chatApi.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await chatApi.sendMessage({
        conversation_id: selectedConversation._id,
        message: newMessage.trim()
      });

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage('');
        
        // Update conversation last message
        setConversations(conversations.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, last_message: newMessage.trim(), last_message_at: new Date() }
            : conv
        ));
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = async (teacherId, subject) => {
    try {
      const response = await chatApi.startConversation({
        teacher_id: teacherId,
        subject: subject || 'General Inquiry'
      });

      if (response.data.success) {
        setConversations([response.data.data, ...conversations]);
        setSelectedConversation(response.data.data);
        setShowNewChatModal(false);
        toast.success('Conversation started successfully');
      } else {
        toast.error(response.data.message || 'Failed to start conversation');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation');
      console.error('Error starting conversation:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId);
      setConversations(conversations.map(conv => 
        conv._id === conversationId 
          ? { ...conv, unread_student: false, unread_teacher: false }
          : conv
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getOtherParticipant = (conversation) => {
    if (user.userType === 'student') {
      return conversation.teacher_id;
    } else {
      return conversation.student_id;
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Messages</h2>
        {user.userType === 'student' && (
          <button
            className="btn btn-primary"
            onClick={() => setShowNewChatModal(true)}
          >
            New Conversation
          </button>
        )}
      </div>

      <div className="chat-layout">
        <div className="conversations-panel">
          <div className="conversations-list">
            {conversations.length > 0 ? (
              conversations.map(conversation => {
                const otherParticipant = getOtherParticipant(conversation);
                const isUnread = user.userType === 'student' 
                  ? conversation.unread_student 
                  : conversation.unread_teacher;
                
                return (
                  <div
                    key={conversation._id}
                    className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      if (isUnread) {
                        markAsRead(conversation._id);
                      }
                    }}
                  >
                    <div className="conversation-avatar">
                      {otherParticipant?.firstName?.charAt(0)}{otherParticipant?.lastName?.charAt(0)}
                    </div>
                    <div className="conversation-info">
                      <h4>{otherParticipant?.firstName} {otherParticipant?.lastName}</h4>
                      <p className="last-message">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                    <div className="conversation-meta">
                      <span className="time">
                        {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
                      </span>
                      {isUnread && <div className="unread-indicator"></div>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-conversations">
                <h3>No conversations yet</h3>
                <p>
                  {user.userType === 'student' 
                    ? 'Start a conversation with your teachers'
                    : 'Students will appear here when they message you'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="messages-panel">
          {selectedConversation ? (
            <>
              <div className="messages-header">
                <div className="participant-info">
                  <div className="participant-avatar">
                    {getOtherParticipant(selectedConversation)?.firstName?.charAt(0)}
                    {getOtherParticipant(selectedConversation)?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4>
                      {getOtherParticipant(selectedConversation)?.firstName}{' '}
                      {getOtherParticipant(selectedConversation)?.lastName}
                    </h4>
                    <p>
                      {user.userType === 'teacher' ? 'Student' : 'Teacher'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div
                      key={message._id}
                      className={`message ${(message.sender_id?._id || message.sender_id) === user.id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{message.message}</p>
                        <span className="message-time">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                />
                <button
                  className="btn btn-primary send-btn"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {showNewChatModal && (
      <NewChatModal
        teachers={teachers}
        onClose={() => setShowNewChatModal(false)}
        onStartConversation={startNewConversation}
      />
      )}
    </div>
  );
};

const NewChatModal = ({ teachers, onClose, onStartConversation }) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTeacher) {
      onStartConversation(selectedTeacher, subject);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Start New Conversation</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              required
            >
              <option value="">Choose a teacher...</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.firstName} {teacher.lastName} - {teacher.specialization || 'No specialization'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Subject (Optional)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to discuss?"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!selectedTeacher}>
              Start Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;

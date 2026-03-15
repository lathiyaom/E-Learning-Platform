const express = require("express");
const router = express.Router();
const { Conversation, Message, User } = require("../models");
const { authenticate } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Get available chat contacts by role (student -> teachers, teacher -> students)
router.get("/contacts", authenticate, tenantScope, async (req, res) => {
  try {
    const organizationId = req.tenantId;
    const userType = req.user.userType;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization context is required",
      });
    }

    let query = {};
    if (userType === "student") {
      query = {
        userType: "teacher",
        $or: [{ organizations: organizationId }, { tenant_id: organizationId }],
        status: "active",
      };
    } else if (userType === "teacher") {
      query = {
        userType: "student",
        $or: [{ organizations: organizationId }, { tenant_id: organizationId }],
        status: "active",
      };
    } else {
      return res.status(403).json({
        success: false,
        message: "Only students and teachers can use chat contacts",
      });
    }

    const contacts = await User.find(query)
      .select("firstName lastName email userType currentOrganization organizations")
      .sort({ firstName: 1, lastName: 1 });

    return res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat contacts",
      error: error.message,
    });
  }
});

// Start or get conversation
router.post("/start-conversation", authenticate, tenantScope, async (req, res) => {
  try {
    const { teacher_id, student_id, subject, course_context } = req.body;
    const currentUserId = req.user.id;
    const currentUserType = req.user.userType;
    const organizationId = req.tenantId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization context is required to start conversation",
      });
    }

    let finalStudentId, finalTeacherId, contactId;

    if (currentUserType === "student") {
      // Student is starting conversation with a teacher
      contactId = teacher_id;
      if (!contactId) {
        return res.status(400).json({
          success: false,
          message: "teacher_id is required",
        });
      }
      const teacher = await User.findById(contactId);
      if (!teacher || teacher.userType !== "teacher") {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
      finalStudentId = currentUserId;
      finalTeacherId = contactId;

      // Check organization match
      const teacherOrgIds = (teacher.organizations || []).map((id) => id.toString());
      const teacherTenantId = teacher.tenant_id?.toString();
      const sameOrganization =
        teacherOrgIds.includes(organizationId.toString()) ||
        teacherTenantId === organizationId.toString();

      if (!sameOrganization) {
        return res.status(400).json({
          success: false,
          message: "Teacher is not available in your organization",
        });
      }
    } else if (currentUserType === "teacher") {
      // Teacher is starting conversation with a student
      contactId = student_id || teacher_id; // support both field names from frontend
      if (!contactId) {
        return res.status(400).json({
          success: false,
          message: "student_id is required",
        });
      }
      const student = await User.findById(contactId);
      if (!student || student.userType !== "student") {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }
      finalStudentId = contactId;
      finalTeacherId = currentUserId;

      // Check organization match
      const studentOrgIds = (student.organizations || []).map((id) => id.toString());
      const studentTenantId = student.tenant_id?.toString();
      const sameOrganization =
        studentOrgIds.includes(organizationId.toString()) ||
        studentTenantId === organizationId.toString();

      if (!sameOrganization) {
        return res.status(400).json({
          success: false,
          message: "Student is not available in your organization",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Only students and teachers can start conversations",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      student_id: finalStudentId,
      teacher_id: finalTeacherId
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        student_id: finalStudentId,
        teacher_id: finalTeacherId,
        organization_id: organizationId,
        subject: subject || "",
        course_context: course_context || null
      });
      await conversation.save();
    }

    // Populate conversation details
    await conversation.populate([
      { path: 'student_id', select: 'firstName lastName email' },
      { path: 'teacher_id', select: 'firstName lastName email' },
      { path: 'course_context', select: 'title' }
    ]);

    res.status(200).json({
      success: true,
      message: "Conversation started successfully",
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to start conversation",
      error: error.message
    });
  }
});

// Send message
router.post("/send-message", authenticate, tenantScope, async (req, res) => {
  try {
    const { conversation_id, message, message_type, reply_to } = req.body;
    const senderId = req.user.id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    // Check if user is participant
    if (!conversation.student_id.equals(senderId) && !conversation.teacher_id.equals(senderId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send message in this conversation"
      });
    }

    // Create message
    const newMessage = new Message({
      conversation_id,
      sender_id: senderId,
      message,
      message_type: message_type || "text",
      reply_to: reply_to || null
    });

    await newMessage.save();

    // Update conversation last message info
    conversation.last_message = message;
    conversation.last_message_at = new Date();
    
    // Update unread flags
    if (conversation.student_id.equals(senderId)) {
      conversation.unread_teacher = true;
      conversation.unread_student = false;
    } else {
      conversation.unread_student = true;
      conversation.unread_teacher = false;
    }
    
    await conversation.save();

    // Populate message details
    await newMessage.populate([
      { path: 'sender_id', select: 'firstName lastName email userType' },
      { path: 'reply_to', select: 'message sender_id' }
    ]);

    // Emit real-time Socket.IO event
    const io = req.app.get("io");
    if (io) {
      // Send message to the conversation room
      io.to(`conversation_${conversation_id}`).emit("new_message", {
        conversationId: conversation_id,
        message: newMessage,
      });

      // Notify conversation list update (for sidebar)
      const populatedConv = await Conversation.findById(conversation_id)
        .populate([
          { path: 'student_id', select: 'firstName lastName email' },
          { path: 'teacher_id', select: 'firstName lastName email' },
        ]);

      io.emit("conversation_updated", {
        conversation: populatedConv,
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
});

// Get conversation messages
router.get("/messages/:conversationId", authenticate, tenantScope, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    if (!conversation.student_id.equals(userId) && !conversation.teacher_id.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation"
      });
    }

    // Get messages
    const messages = await Message.find({
      conversation_id: conversationId,
      deleted: false
    })
    .populate('sender_id', 'firstName lastName email userType')
    .populate('reply_to', 'message sender_id')
    .sort({ created_at: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark messages as read for current user
    await Message.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        read_at: null
      },
      {
        read_at: new Date(),
        status: "read"
      }
    );

    // Update conversation unread flags
    if (conversation.student_id.equals(userId)) {
      conversation.unread_student = false;
    } else {
      conversation.unread_teacher = false;
    }
    await conversation.save();

    const total = await Message.countDocuments({
      conversation_id: conversationId,
      deleted: false
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message
    });
  }
});

// Get user's conversations
router.get("/conversations", authenticate, tenantScope, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { page = 1, limit = 20 } = req.query;

    let filter;
    if (userType === "student") {
      filter = { student_id: userId };
    } else if (userType === "teacher") {
      filter = { teacher_id: userId };
    } else {
      // Admins can see all conversations in their organization
      filter = { organization_id: req.tenantId };
    }

    const conversations = await Conversation.find(filter)
      .populate([
        { path: 'student_id', select: 'firstName lastName email' },
        { path: 'teacher_id', select: 'firstName lastName email' },
        { path: 'course_context', select: 'title' }
      ])
      .sort({ last_message_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Conversation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: conversations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message
    });
  }
});

// Mark conversation as read
router.patch("/conversations/:conversationId/read", authenticate, tenantScope, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    // Update unread flags
    if (conversation.student_id.equals(userId)) {
      conversation.unread_student = false;
    } else {
      conversation.unread_teacher = false;
    }

    await conversation.save();

    // Mark all messages as read for this user
    await Message.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        read_at: null
      },
      {
        read_at: new Date(),
        status: "read"
      }
    );

    res.status(200).json({
      success: true,
      message: "Conversation marked as read"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark conversation as read",
      error: error.message
    });
  }
});

// Archive conversation
router.patch("/conversations/:conversationId/archive", authenticate, tenantScope, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    if (!conversation.student_id.equals(userId) && !conversation.teacher_id.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to archive this conversation"
      });
    }

    conversation.status = "archived";
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Conversation archived successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to archive conversation",
      error: error.message
    });
  }
});

module.exports = router;

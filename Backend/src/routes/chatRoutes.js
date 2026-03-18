const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { Conversation, Message, User } = require("../models");
const Tenant = require("../models/Tenant.mongoose");
const { authenticate } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

const ALLOWED_ROLE_GRAPH = {
  student: new Set(["teacher"]),
  teacher: new Set(["student", "admin"]),
  admin: new Set(["teacher", "superadmin"]),
  superadmin: new Set(["admin"]),
};

const getIdString = (value) => String(value || "");

const normalizeRole = (value) => String(value || "").toLowerCase();

const buildParticipantKey = ({ model, id }) => `${model}:${getIdString(id)}`;

const buildSocketRoom = ({ model, id }) => `participant_${model}_${getIdString(id)}`;

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const canStartConversation = (fromRole, toRole) => {
  const allowed = ALLOWED_ROLE_GRAPH[fromRole];
  return Boolean(allowed && allowed.has(toRole));
};

const isUserInOrganization = (userDoc, organizationId) => {
  if (!userDoc || !organizationId) return false;
  const orgId = getIdString(organizationId);
  const userOrgIds = (userDoc.organizations || []).map((id) => getIdString(id));
  return (
    userOrgIds.includes(orgId) ||
    getIdString(userDoc.currentOrganization) === orgId ||
    getIdString(userDoc.tenant_id) === orgId
  );
};

const getRequester = (req) => {
  const role = normalizeRole(req.user.userType);
  const model = req.user.role === "tenant" ? "Tenant" : "User";
  return {
    id: req.user.id,
    role,
    model,
    key: buildParticipantKey({ model, id: req.user.id }),
    tenantId: req.tenantId ? getIdString(req.tenantId) : null,
  };
};

const ensureRequesterRoleAllowed = (requester) => {
  if (!["student", "teacher", "admin", "superadmin"].includes(requester.role)) {
    return "Unsupported role for chat.";
  }
  if (["admin", "superadmin"].includes(requester.role) && requester.model !== "Tenant") {
    return "Use the organization admin account to access admin chat.";
  }
  return null;
};

const buildHumanName = (doc, isTenant) => {
  if (!doc) return "";
  if (!isTenant) {
    const fullName = `${doc.firstName || ""} ${doc.lastName || ""}`.trim();
    if (fullName) return fullName;
  }
  if (doc.name) return doc.name;
  if (doc.OrgOwnerName) return doc.OrgOwnerName;
  if (doc.email && String(doc.email).includes("@")) {
    return String(doc.email).split("@")[0];
  }
  if (doc.OrgOwnerEmail && String(doc.OrgOwnerEmail).includes("@")) {
    return String(doc.OrgOwnerEmail).split("@")[0];
  }
  return "";
};

const mapPopulatedParticipant = (entry, rawConversation = {}) => {
  const isTenant = entry.participant_model === "Tenant";
  const rawDoc = entry.participant_id;
  const populatedDoc = rawDoc && typeof rawDoc === "object" && !Array.isArray(rawDoc) ? rawDoc : null;

  let fallbackLegacyDoc = null;
  if (!isTenant && entry.participant_role === "student" && rawConversation.student_id) {
    fallbackLegacyDoc = rawConversation.student_id;
  }
  if (!isTenant && entry.participant_role === "teacher" && rawConversation.teacher_id) {
    fallbackLegacyDoc = rawConversation.teacher_id;
  }

  const doc = populatedDoc || fallbackLegacyDoc;
  const fullName = buildHumanName(doc, isTenant);

  const roleLabel = entry.participant_role
    ? `${entry.participant_role.charAt(0).toUpperCase()}${entry.participant_role.slice(1)}`
    : "Contact";

  return {
    id: getIdString(doc?._id || entry.participant_id),
    model: entry.participant_model,
    role: entry.participant_role,
    name: fullName || doc?.name || roleLabel,
    email: doc?.email || doc?.OrgOwnerEmail || "",
    avatar: doc?.avatar || null,
    participantKey: buildParticipantKey({ model: entry.participant_model, id: doc?._id || entry.participant_id }),
  };
};

const buildPairKey = (a, b) => {
  const keys = [buildParticipantKey(a), buildParticipantKey(b)].sort();
  return keys.join("|");
};

const populateConversation = async (conversation) => {
  await conversation.populate([
    {
      path: "participants.participant_id",
      select: "firstName lastName email userType avatar name OrgOwnerName OrgOwnerEmail status",
    },
    { path: "student_id", select: "firstName lastName email userType avatar" },
    { path: "teacher_id", select: "firstName lastName email userType avatar" },
    { path: "course_context", select: "title" },
  ]);

  return conversation;
};

const normalizeConversation = (conversation, requester) => {
  const raw = conversation.toObject({ virtuals: false });
  const participants = Array.isArray(raw.participants) && raw.participants.length
    ? raw.participants.map((entry) => mapPopulatedParticipant(entry, raw))
    : [
        raw.student_id
          ? {
              id: getIdString(raw.student_id._id || raw.student_id),
              model: "User",
              role: "student",
              name: `${raw.student_id.firstName || ""} ${raw.student_id.lastName || ""}`.trim(),
              email: raw.student_id.email || "",
              avatar: raw.student_id.avatar || null,
              participantKey: buildParticipantKey({ model: "User", id: raw.student_id._id || raw.student_id }),
            }
          : null,
        raw.teacher_id
          ? {
              id: getIdString(raw.teacher_id._id || raw.teacher_id),
              model: "User",
              role: "teacher",
              name: `${raw.teacher_id.firstName || ""} ${raw.teacher_id.lastName || ""}`.trim(),
              email: raw.teacher_id.email || "",
              avatar: raw.teacher_id.avatar || null,
              participantKey: buildParticipantKey({ model: "User", id: raw.teacher_id._id || raw.teacher_id }),
            }
          : null,
      ].filter(Boolean);

  const me = participants.find((p) => p.participantKey === requester.key);
  const other = participants.find((p) => p.participantKey !== requester.key) || null;

  const unreadBy = Array.isArray(raw.unread_by) ? raw.unread_by : [];
  const legacyUnread =
    requester.role === "student"
      ? raw.unread_student
      : requester.role === "teacher"
        ? raw.unread_teacher
        : false;

  return {
    ...raw,
    participants,
    participant_pair_key: raw.participant_pair_key || "",
    me,
    otherParticipant: other,
    isUnread: unreadBy.includes(requester.key) || Boolean(legacyUnread),
    unreadCount: unreadBy.includes(requester.key) || Boolean(legacyUnread) ? 1 : 0,
  };
};

const isParticipantInConversation = (conversation, requester) => {
  if (Array.isArray(conversation.participants) && conversation.participants.length) {
    return conversation.participants.some(
      (p) =>
        getIdString(p.participant_id) === getIdString(requester.id) &&
        p.participant_model === requester.model,
    );
  }

  if (requester.model !== "User") {
    return false;
  }

  return (
    getIdString(conversation.student_id) === getIdString(requester.id) ||
    getIdString(conversation.teacher_id) === getIdString(requester.id)
  );
};

const markConversationUnreadForOthers = (conversation, senderKey) => {
  if (Array.isArray(conversation.participants) && conversation.participants.length) {
    conversation.unread_by = conversation.participants
      .map((p) => buildParticipantKey({ model: p.participant_model, id: p.participant_id }))
      .filter((key) => key !== senderKey);
  }
};

const markConversationReadForRequester = (conversation, requester) => {
  const requesterKey = requester.key;
  conversation.unread_by = (conversation.unread_by || []).filter((key) => key !== requesterKey);

  if (conversation.student_id && getIdString(conversation.student_id) === getIdString(requester.id)) {
    conversation.unread_student = false;
  }
  if (conversation.teacher_id && getIdString(conversation.teacher_id) === getIdString(requester.id)) {
    conversation.unread_teacher = false;
  }
};

const resolveContactFromPayload = async (payload) => {
  const {
    target_id,
    target_model,
    target_role,
    teacher_id,
    student_id,
    admin_id,
    super_admin_id,
  } = payload;

  if (target_id && target_model && target_role) {
    return {
      id: target_id,
      model: target_model,
      role: normalizeRole(target_role),
    };
  }

  if (teacher_id) return { id: teacher_id, model: "User", role: "teacher" };
  if (student_id) return { id: student_id, model: "User", role: "student" };
  if (admin_id) return { id: admin_id, model: "Tenant", role: "admin" };
  if (super_admin_id) return { id: super_admin_id, model: "Tenant", role: "superadmin" };

  return null;
};

const getUserContactsByRole = async (organizationId, role) => {
  return User.find({
    userType: role,
    status: "active",
    $or: [
      { currentOrganization: organizationId },
      { organizations: organizationId },
      { tenant_id: organizationId },
    ],
  }).select("firstName lastName email userType avatar currentOrganization organizations tenant_id");
};

const emitConversationUpdateToParticipants = (io, conversationPayload) => {
  if (!io || !conversationPayload?.participants) return;

  conversationPayload.participants.forEach((participant) => {
    io.to(buildSocketRoom({ model: participant.model, id: participant.id })).emit(
      "conversation_updated",
      { conversation: conversationPayload },
    );
  });
};

router.get("/contacts", authenticate, tenantScope, async (req, res) => {
  try {
    const requester = getRequester(req);
    const roleError = ensureRequesterRoleAllowed(requester);

    if (roleError) {
      return res.status(403).json({ success: false, message: roleError });
    }

    const organizationId = requester.role === "admin" ? requester.id : requester.tenantId;

    if (!organizationId && requester.role !== "superadmin") {
      return res.status(400).json({
        success: false,
        message: "Organization context is required",
      });
    }

    let contacts = [];

    if (requester.role === "student") {
      const teachers = await getUserContactsByRole(organizationId, "teacher");
      contacts = teachers.map((teacher) => ({
        _id: teacher._id,
        id: teacher._id,
        model: "User",
        role: "teacher",
        userType: "teacher",
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        avatar: teacher.avatar || null,
      }));
    }

    if (requester.role === "teacher") {
      const [students, adminOrg] = await Promise.all([
        getUserContactsByRole(organizationId, "student"),
        Tenant.findById(organizationId).select("name email userType OrgOwnerName status"),
      ]);

      contacts = [
        ...students.map((student) => ({
          _id: student._id,
          id: student._id,
          model: "User",
          role: "student",
          userType: "student",
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          avatar: student.avatar || null,
        })),
      ];

      if (adminOrg && normalizeRole(adminOrg.userType) === "admin" && adminOrg.status === "active") {
        contacts.push({
          _id: adminOrg._id,
          id: adminOrg._id,
          model: "Tenant",
          role: "admin",
          userType: "admin",
          firstName: adminOrg.OrgOwnerName || adminOrg.name,
          lastName: "",
          email: adminOrg.email,
          avatar: null,
        });
      }
    }

    if (requester.role === "admin") {
      const [teachers, superAdmins] = await Promise.all([
        getUserContactsByRole(requester.id, "teacher"),
        Tenant.find({ userType: "superadmin", status: "active" }).select("name email userType OrgOwnerName"),
      ]);

      contacts = [
        ...teachers.map((teacher) => ({
          _id: teacher._id,
          id: teacher._id,
          model: "User",
          role: "teacher",
          userType: "teacher",
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          avatar: teacher.avatar || null,
        })),
        ...superAdmins.map((superAdmin) => ({
          _id: superAdmin._id,
          id: superAdmin._id,
          model: "Tenant",
          role: "superadmin",
          userType: "superadmin",
          firstName: superAdmin.OrgOwnerName || superAdmin.name,
          lastName: "",
          email: superAdmin.email,
          avatar: null,
        })),
      ];
    }

    if (requester.role === "superadmin") {
      const admins = await Tenant.find({ userType: "admin", status: "active" }).select(
        "name email userType OrgOwnerName",
      );

      contacts = admins.map((adminOrg) => ({
        _id: adminOrg._id,
        id: adminOrg._id,
        model: "Tenant",
        role: "admin",
        userType: "admin",
        firstName: adminOrg.OrgOwnerName || adminOrg.name,
        lastName: "",
        email: adminOrg.email,
        avatar: null,
      }));
    }

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

router.post("/start-conversation", authenticate, tenantScope, async (req, res) => {
  try {
    const requester = getRequester(req);
    const roleError = ensureRequesterRoleAllowed(requester);

    if (roleError) {
      return res.status(403).json({ success: false, message: roleError });
    }

    const target = await resolveContactFromPayload(req.body);
    if (!target || !isObjectId(target.id)) {
      return res.status(400).json({
        success: false,
        message: "A valid target contact is required",
      });
    }

    if (!["User", "Tenant"].includes(target.model)) {
      return res.status(400).json({ success: false, message: "Invalid target model" });
    }

    if (!canStartConversation(requester.role, target.role)) {
      return res.status(403).json({
        success: false,
        message: "This role combination is not allowed for chat",
      });
    }

    let targetDoc;
    if (target.model === "User") {
      targetDoc = await User.findById(target.id).select(
        "firstName lastName email userType status avatar tenant_id organizations currentOrganization",
      );
    } else {
      targetDoc = await Tenant.findById(target.id).select("name email userType status OrgOwnerName");
    }

    if (!targetDoc || normalizeRole(targetDoc.userType) !== target.role || targetDoc.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Target contact not found or inactive",
      });
    }

    const requesterOrganizationId = requester.role === "admin" ? requester.id : requester.tenantId;

    let organizationId = requesterOrganizationId;
    if (target.role === "admin") {
      organizationId = getIdString(targetDoc._id);
    }

    if (requester.role === "superadmin" && target.role === "admin") {
      organizationId = getIdString(targetDoc._id);
    }

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Unable to resolve organization context",
      });
    }

    if (requester.model === "User") {
      const requesterDoc = await User.findById(requester.id).select(
        "tenant_id organizations currentOrganization",
      );
      if (!isUserInOrganization(requesterDoc, organizationId)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to chat in this organization",
        });
      }
    }

    if (target.model === "User" && !isUserInOrganization(targetDoc, organizationId)) {
      return res.status(403).json({
        success: false,
        message: "Target user does not belong to your organization",
      });
    }

    if (target.model === "Tenant" && target.role === "admin" && getIdString(targetDoc._id) !== getIdString(organizationId)) {
      return res.status(403).json({
        success: false,
        message: "Admin target does not match organization context",
      });
    }

    const requesterRef = { model: requester.model, id: requester.id, role: requester.role };
    const targetRef = { model: target.model, id: target.id, role: target.role };
    const pairKey = buildPairKey(requesterRef, targetRef);

    let conversation = await Conversation.findOne({
      organization_id: organizationId,
      participant_pair_key: pairKey,
      status: { $ne: "blocked" },
    });

    // Backward compatibility: reuse legacy student-teacher conversation rows that may not have pair keys yet.
    if (!conversation && requester.model === "User" && target.model === "User") {
      const requesterId = getIdString(requester.id);
      const targetId = getIdString(target.id);

      const studentId = requester.role === "student" ? requesterId : target.role === "student" ? targetId : null;
      const teacherId = requester.role === "teacher" ? requesterId : target.role === "teacher" ? targetId : null;

      if (studentId && teacherId) {
        conversation = await Conversation.findOne({
          organization_id: organizationId,
          student_id: studentId,
          teacher_id: teacherId,
          status: { $ne: "blocked" },
        });

        if (conversation) {
          await Conversation.updateOne(
            { _id: conversation._id },
            {
              $set: {
                participant_pair_key: pairKey,
                participants: [
                  {
                    participant_id: requester.id,
                    participant_model: requester.model,
                    participant_role: requester.role,
                  },
                  {
                    participant_id: target.id,
                    participant_model: target.model,
                    participant_role: target.role,
                  },
                ],
              },
            },
          );

          conversation.participant_pair_key = pairKey;
          conversation.participants = [
            {
              participant_id: requester.id,
              participant_model: requester.model,
              participant_role: requester.role,
            },
            {
              participant_id: target.id,
              participant_model: target.model,
              participant_role: target.role,
            },
          ];
        }
      }
    }

    if (!conversation) {
      conversation = await Conversation.create({
        organization_id: organizationId,
        participants: [
          {
            participant_id: requester.id,
            participant_model: requester.model,
            participant_role: requester.role,
          },
          {
            participant_id: target.id,
            participant_model: target.model,
            participant_role: target.role,
          },
        ],
        participant_pair_key: pairKey,
        subject: req.body.subject || "",
        course_context: req.body.course_context || null,
        unread_by: [],
        // Legacy compatibility for old clients.
        student_id:
          requester.role === "student"
            ? requester.id
            : target.role === "student"
              ? target.id
              : undefined,
        teacher_id:
          requester.role === "teacher"
            ? requester.id
            : target.role === "teacher"
              ? target.id
              : undefined,
      });
    }

    await populateConversation(conversation);

    const responseConversation = normalizeConversation(conversation, requester);

    return res.status(200).json({
      success: true,
      message: "Conversation ready",
      data: responseConversation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to start conversation",
      error: error.message,
    });
  }
});

router.post("/send-message", authenticate, tenantScope, async (req, res) => {
  try {
    const requester = getRequester(req);
    const { conversation_id, message, message_type, reply_to, idempotencyKey } = req.body;

    if (!conversation_id || !isObjectId(conversation_id)) {
      return res.status(400).json({ success: false, message: "Valid conversation_id is required" });
    }

    const text = String(message || "").trim();
    if (!text) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const conversation = await Conversation.findById(conversation_id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!isParticipantInConversation(conversation, requester)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send message in this conversation",
      });
    }

    if (idempotencyKey) {
      const existing = await Message.findOne({
        conversation_id,
        sender_id: requester.id,
        sender_model: requester.model,
        idempotency_key: idempotencyKey,
      }).populate("sender_id", "firstName lastName email userType avatar name OrgOwnerName");

      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Message already sent",
          data: existing,
          deduplicated: true,
        });
      }
    }

    const newMessage = await Message.create({
      conversation_id,
      sender_id: requester.id,
      sender_model: requester.model,
      sender_role: requester.role,
      message: text,
      message_type: message_type || "text",
      reply_to: reply_to || null,
      idempotency_key: idempotencyKey || null,
    });

    await newMessage.populate([
      { path: "sender_id", select: "firstName lastName email userType avatar name OrgOwnerName" },
      { path: "reply_to", select: "message sender_id sender_model" },
    ]);

    conversation.last_message = text;
    conversation.last_message_at = new Date();
    markConversationUnreadForOthers(conversation, requester.key);

    if (conversation.student_id && getIdString(conversation.student_id) === getIdString(requester.id)) {
      conversation.unread_teacher = true;
      conversation.unread_student = false;
    }
    if (conversation.teacher_id && getIdString(conversation.teacher_id) === getIdString(requester.id)) {
      conversation.unread_student = true;
      conversation.unread_teacher = false;
    }

    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $set: {
          last_message: conversation.last_message,
          last_message_at: conversation.last_message_at,
          unread_by: conversation.unread_by,
          unread_student: conversation.unread_student,
          unread_teacher: conversation.unread_teacher,
        },
      },
    );
    await populateConversation(conversation);

    const conversationPayload = normalizeConversation(conversation, requester);

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation_${conversation_id}`).emit("new_message", {
        conversationId: conversation_id,
        message: newMessage,
      });

      emitConversationUpdateToParticipants(io, conversationPayload);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

router.get("/messages/:conversationId", authenticate, tenantScope, async (req, res) => {
  try {
    const requester = getRequester(req);
    const { conversationId } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 50), 100);

    if (!isObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation id" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!isParticipantInConversation(conversation, requester)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await Message.find({
      conversation_id: conversationId,
      deleted: false,
    })
      .populate("sender_id", "firstName lastName email userType avatar name OrgOwnerName")
      .populate("reply_to", "message sender_id sender_model")
      .sort({ created_at: 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    await Message.updateMany(
      {
        conversation_id: conversationId,
        read_at: null,
        $nor: [{ sender_id: requester.id, sender_model: requester.model }],
      },
      { read_at: new Date(), status: "read" },
    );

    markConversationReadForRequester(conversation, requester);
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $set: {
          unread_by: conversation.unread_by,
          unread_student: conversation.unread_student,
          unread_teacher: conversation.unread_teacher,
        },
      },
    );

    const total = await Message.countDocuments({ conversation_id: conversationId, deleted: false });

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

router.get("/conversations", authenticate, tenantScope, async (req, res) => {
  try {
    const requester = getRequester(req);
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 100);

    const participantFilter = {
      participants: {
        $elemMatch: {
          participant_id: requester.id,
          participant_model: requester.model,
        },
      },
    };

    const legacyFilter =
      requester.model === "User"
        ? {
            $or: [{ student_id: requester.id }, { teacher_id: requester.id }],
          }
        : null;

    const queryFilter = legacyFilter ? { $or: [participantFilter, legacyFilter] } : participantFilter;

    const conversations = await Conversation.find(queryFilter)
      .populate([
        {
          path: "participants.participant_id",
          select: "firstName lastName email userType avatar name OrgOwnerName",
        },
        { path: "student_id", select: "firstName lastName email userType avatar" },
        { path: "teacher_id", select: "firstName lastName email userType avatar" },
        { path: "course_context", select: "title" },
      ])
      .sort({ last_message_at: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Conversation.countDocuments(queryFilter);
    const normalized = conversations.map((conversation) =>
      normalizeConversation(conversation, requester),
    );

    return res.status(200).json({
      success: true,
      data: normalized,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
});

router.patch("/conversations/:conversationId/read", authenticate, tenantScope, async (req, res) => {
  try {
    const requester = getRequester(req);
    const { conversationId } = req.params;

    if (!isObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation id" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!isParticipantInConversation(conversation, requester)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this conversation",
      });
    }

    markConversationReadForRequester(conversation, requester);
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $set: {
          unread_by: conversation.unread_by,
          unread_student: conversation.unread_student,
          unread_teacher: conversation.unread_teacher,
        },
      },
    );

    await Message.updateMany(
      {
        conversation_id: conversationId,
        read_at: null,
        $nor: [{ sender_id: requester.id, sender_model: requester.model }],
      },
      { read_at: new Date(), status: "read" },
    );

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark conversation as read",
      error: error.message,
    });
  }
});

router.patch("/conversations/:conversationId/archive", authenticate, tenantScope, async (req, res) => {
  try {
    const requester = getRequester(req);
    const { conversationId } = req.params;

    if (!isObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation id" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!isParticipantInConversation(conversation, requester)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to archive this conversation",
      });
    }

    conversation.status = "archived";
    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { status: "archived" } },
    );

    return res.status(200).json({
      success: true,
      message: "Conversation archived successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to archive conversation",
      error: error.message,
    });
  }
});

module.exports = router;

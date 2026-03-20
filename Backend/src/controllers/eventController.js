const { Event } = require("../models");

const CURRENT_EVENT_TYPES = [
  "holiday",
  "meeting",
  "workshop",
  "deadline",
  "celebration",
  "other",
];
const LEGACY_EVENT_TYPES = [
  "seminar",
  "workshop",
  "webinar",
  "competition",
  "cultural",
  "sports",
  "conference",
  "other",
];

const mapLegacyTypeToCurrent = (value) => {
  if (!value) return "other";
  const normalized = String(value).toLowerCase();
  if (CURRENT_EVENT_TYPES.includes(normalized)) return normalized;

  const mapping = {
    seminar: "meeting",
    webinar: "workshop",
    conference: "meeting",
    competition: "celebration",
    cultural: "celebration",
    sports: "celebration",
  };

  return mapping[normalized] || "other";
};

const mapTargetAudienceToRole = (targetAudience) => {
  if (!targetAudience) return "all";
  if (Array.isArray(targetAudience)) {
    if (targetAudience.includes("all")) return "all";
    if (targetAudience.includes("students")) return "student";
    if (targetAudience.includes("teachers")) return "teacher";
    if (targetAudience.includes("admins")) return "admin";
  }
  return "all";
};

const mapRoleToTargetAudience = (targetRole) => {
  if (!targetRole || targetRole === "all") return ["all"];
  const mapping = {
    student: "students",
    teacher: "teachers",
    admin: "admins",
  };
  return [mapping[targetRole] || targetRole];
};

const formatTime = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const combineDateAndTime = (dateValue, timeValue, useEndOfDay = false) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  if (timeValue) {
    const [hours, minutes] = String(timeValue).split(":").map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
  } else if (useEndOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

const normalizeEvent = (eventDoc) => {
  const event = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
  const startDate = event.start_date || event.eventDate;
  const endDate = event.end_date || event.eventDate || startDate;

  return {
    ...event,
    eventDate: startDate,
    startTime: event.startTime || formatTime(startDate),
    endTime: event.endTime || formatTime(endDate),
    type: event.type || event.event_type,
    createdBy: event.createdBy || event.created_by,
    tenantId: event.tenantId || event.organization_id,
    targetAudience:
      event.targetAudience ||
      mapRoleToTargetAudience(event.target_role || "all"),
    registrationRequired:
      event.registrationRequired ?? event.requires_registration ?? false,
    maxParticipants: event.maxParticipants ?? event.max_participants ?? null,
  };
};

const buildEventPayload = (body, req) => {
  const eventType = mapLegacyTypeToCurrent(body.event_type || body.type);
  const legacyType = LEGACY_EVENT_TYPES.includes(
    String(body.type || "").toLowerCase(),
  )
    ? String(body.type).toLowerCase()
    : "other";

  const startDate =
    body.start_date || combineDateAndTime(body.eventDate, body.startTime);
  const endDate =
    body.end_date ||
    combineDateAndTime(body.eventDate, body.endTime, true) ||
    startDate;

  return {
    organization_id: req.tenantId,
    tenantId: req.tenantId,
    title: body.title,
    description: body.description,
    event_type: eventType,
    type: legacyType,
    start_date: startDate,
    end_date: endDate,
    eventDate: startDate,
    startTime: body.startTime || formatTime(startDate),
    endTime: body.endTime || formatTime(endDate),
    location: body.location || "",
    target_role:
      body.target_role || mapTargetAudienceToRole(body.targetAudience),
    targetAudience:
      body.targetAudience || mapRoleToTargetAudience(body.target_role || "all"),
    is_recurring: body.is_recurring ?? body.isRecurring ?? false,
    recurring_pattern: body.recurring_pattern || null,
    recurring_end_date: body.recurring_end_date || null,
    is_public: body.is_public ?? true,
    requires_registration:
      body.requires_registration ?? body.registrationRequired ?? false,
    registrationRequired:
      body.registrationRequired ?? body.requires_registration ?? false,
    registration_deadline: body.registration_deadline || null,
    max_participants: body.max_participants ?? body.maxParticipants ?? null,
    maxParticipants: body.maxParticipants ?? body.max_participants ?? null,
    imageUrl: body.imageUrl || "",
    attachments: body.attachments || [],
    status: body.status || "published",
    created_by: req.user.id,
    createdBy: req.user.id,
    organizer: body.organizer || req.user.id,
    color: body.color || "#3B82F6",
    tags: Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string" && body.tags.trim()
        ? body.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
  };
};

const buildEventScopeQuery = (tenantId) => ({
  $or: [
    { organization_id: tenantId },
    { tenantId: tenantId },
    { tenantId: null },
    { organization_id: null },
  ],
});

const eventController = {
  createEvent: async (req, res) => {
    try {
      const role = String(req.user.userType || "").toLowerCase();
      if (!["admin", "superadmin"].includes(role)) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized to create event" });
      }

      const payload = buildEventPayload(req.body, req);
      if (
        !payload.title ||
        !payload.description ||
        !payload.start_date ||
        !payload.end_date
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: title, description, start_date, end_date",
        });
      }

      const event = await Event.create(payload);

      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: normalizeEvent(event),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAllEvents: async (req, res) => {
    try {
      const { type, status, page = 1, limit = 10, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const query = buildEventScopeQuery(req.tenantId);

      if (type) {
        query.$and = [
          { $or: [{ event_type: mapLegacyTypeToCurrent(type) }, { type }] },
        ];
      }
      if (status) {
        query.status = status;
      }
      if (search) {
        query.$and = [
          ...(query.$and || []),
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { tags: { $in: [new RegExp(search, "i")] } },
            ],
          },
        ];
      }

      const total = await Event.countDocuments(query);
      const events = await Event.find(query)
        .sort({ start_date: -1, eventDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        message: "Events retrieved successfully",
        data: events.map(normalizeEvent),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getEventById: async (req, res) => {
    try {
      const event = await Event.findOne({
        _id: req.params.id,
        ...buildEventScopeQuery(req.tenantId),
      });

      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Event retrieved successfully",
        data: normalizeEvent(event),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getUpcomingEvents: async (req, res) => {
    try {
      const { days = 30, page = 1, limit = 10 } = req.query;
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Number(days));
      const skip = (Number(page) - 1) * Number(limit);

      const query = {
        ...buildEventScopeQuery(req.tenantId),
        status: { $ne: "cancelled" },
        $and: [
          {
            $or: [
              { start_date: { $gte: startDate, $lte: endDate } },
              { eventDate: { $gte: startDate, $lte: endDate } },
              {
                $and: [
                  { start_date: { $lte: endDate } },
                  { end_date: { $gte: startDate } },
                ],
              },
            ],
          },
        ],
      };

      const total = await Event.countDocuments(query);
      const events = await Event.find(query)
        .sort({ start_date: 1, eventDate: 1 })
        .skip(skip)
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        message: "Upcoming events retrieved successfully",
        data: events.map(normalizeEvent),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  registerForEvent: async (req, res) => {
    try {
      const event = await Event.findOne({
        _id: req.params.id,
        ...buildEventScopeQuery(req.tenantId),
      });

      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      const registrations = event.registeredParticipants || [];
      if (!(event.registrationRequired ?? event.requires_registration)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Registration is not required for this event",
          });
      }
      if (
        registrations.some(
          (participantId) => String(participantId) === String(req.user.id),
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Already registered for this event",
          });
      }
      const maxParticipants = event.maxParticipants ?? event.max_participants;
      if (maxParticipants && registrations.length >= maxParticipants) {
        return res
          .status(400)
          .json({ success: false, message: "Event registration is full" });
      }

      event.registeredParticipants = [...registrations, req.user.id];
      await event.save();

      return res.status(200).json({
        success: true,
        message: "Registered for event successfully",
        data: normalizeEvent(event),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  unregisterFromEvent: async (req, res) => {
    try {
      const event = await Event.findOne({
        _id: req.params.id,
        ...buildEventScopeQuery(req.tenantId),
      });

      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      const registrations = (event.registeredParticipants || []).filter(
        (participantId) => String(participantId) !== String(req.user.id),
      );
      event.registeredParticipants = registrations;
      await event.save();

      return res.status(200).json({
        success: true,
        message: "Unregistered from event successfully",
        data: normalizeEvent(event),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const role = String(req.user.userType || "").toLowerCase();
      if (!["admin", "superadmin"].includes(role)) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      const event = await Event.findOne({
        _id: req.params.id,
        ...buildEventScopeQuery(req.tenantId),
      });
      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      const payload = buildEventPayload(
        { ...event.toObject(), ...req.body },
        req,
      );
      payload.created_by = event.created_by || payload.created_by;
      payload.createdBy = event.createdBy || payload.createdBy;

      Object.assign(event, payload);
      await event.save();

      return res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: normalizeEvent(event),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const role = String(req.user.userType || "").toLowerCase();
      if (!["admin", "superadmin"].includes(role)) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      const event = await Event.findOneAndDelete({
        _id: req.params.id,
        ...buildEventScopeQuery(req.tenantId),
      });

      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Event deleted successfully",
        data: normalizeEvent(event),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = eventController;

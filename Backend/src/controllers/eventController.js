const { Event, User } = require("../models");

const eventController = {
  /**
   * Create event
   * POST /Event/create
   */
  createEvent: async (req, res) => {
    try {
      const { title, description, eventDate, startTime, endTime, location, type, organizer, targetAudience, registrationRequired, maxParticipants, imageUrl, tags } = req.body;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      // Only admin can create events
      if (userType !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to create event",
        });
      }

      // Validate required fields
      if (!title || !eventDate || !startTime) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: title, eventDate, startTime",
        });
      }

      const event = await Event.create({
        tenantId,
        title,
        description,
        eventDate,
        startTime,
        endTime,
        location,
        type,
        organizer: organizer || req.user.id,
        targetAudience: targetAudience || ["all"],
        registrationRequired,
        maxParticipants,
        imageUrl,
        tags,
        createdBy: req.user.id,
      });

      const populatedEvent = await event.populate([
        { path: "organizer", select: "firstName lastName email" },
        { path: "createdBy", select: "firstName lastName" },
        { path: "registeredParticipants", select: "firstName lastName email" },
      ]);

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: populatedEvent,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get all events
   * GET /Event/all
   */
  getAllEvents: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { type, status, page = 1, limit = 10, search } = req.query;

      const query = { tenantId };
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const total = await Event.countDocuments(query);
      const skip = (page - 1) * limit;

      const events = await Event.find(query)
        .populate("organizer", "firstName lastName email")
        .populate("createdBy", "firstName lastName")
        .populate("registeredParticipants", "firstName lastName")
        .sort({ eventDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Events retrieved successfully",
        data: events,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get event by ID
   * GET /Event/:id
   */
  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;

      const event = await Event.findOne({ _id: id, tenantId })
        .populate("organizer", "firstName lastName email")
        .populate("createdBy", "firstName lastName")
        .populate("registeredParticipants", "firstName lastName email");

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Event retrieved successfully",
        data: event,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get upcoming events
   * GET /Event/upcoming
   */
  getUpcomingEvents: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { days = 30, page = 1, limit = 10 } = req.query;

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(days));

      const query = {
        tenantId,
        eventDate: { $gte: startDate, $lte: endDate },
        status: "upcoming",
      };

      const total = await Event.countDocuments(query);
      const skip = (page - 1) * limit;

      const events = await Event.find(query)
        .populate("organizer", "firstName lastName email")
        .populate("registeredParticipants", "firstName lastName")
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Upcoming events retrieved successfully",
        data: events,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Register for event
   * POST /Event/register/:id
   */
  registerForEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: id, tenantId });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      if (!event.registrationRequired) {
        return res.status(400).json({
          success: false,
          message: "Registration is not required for this event",
        });
      }

      // Check if already registered
      if (event.registeredParticipants.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "Already registered for this event",
        });
      }

      // Check max participants
      if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
        return res.status(400).json({
          success: false,
          message: "Event registration is full",
        });
      }

      event.registeredParticipants.push(userId);
      await event.save();

      res.status(200).json({
        success: true,
        message: "Registered for event successfully",
        data: event,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Unregister from event
   * POST /Event/unregister/:id
   */
  unregisterFromEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: id, tenantId });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const index = event.registeredParticipants.indexOf(userId);
      if (index === -1) {
        return res.status(400).json({
          success: false,
          message: "Not registered for this event",
        });
      }

      event.registeredParticipants.splice(index, 1);
      await event.save();

      res.status(200).json({
        success: true,
        message: "Unregistered from event successfully",
        data: event,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update event
   * PATCH /Event/update/:id
   */
  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      // Only admin can update events
      if (userType !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const event = await Event.findOne({ _id: id, tenantId });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const allowedFields = ["title", "description", "eventDate", "startTime", "endTime", "location", "type", "status", "imageUrl", "tags"];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true })
        .populate("organizer", "firstName lastName email")
        .populate("createdBy", "firstName lastName")
        .populate("registeredParticipants", "firstName lastName");

      res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: updatedEvent,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Delete event
   * DELETE /Event/delete/:id
   */
  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      // Only admin can delete events
      if (userType !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const event = await Event.findOneAndDelete({ _id: id, tenantId });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
        data: event,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = eventController;

const { Timetable, Course, User, Enrollment } = require("../models");
const timetableService = require("../services/timetableService");

const timetableController = {
  /**
   * Create timetable entry
   * POST /Timetable/create
   */
  createTimetable: async (req, res) => {
    try {
      const { courseId, dayOfWeek, startTime, endTime, room, type, conductedBy, recurrenceStart, recurrenceEnd } = req.body;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      // Only admin, teacher and student can create timetable entries
      if (!["admin", "teacher", "student"].includes(userType)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to create timetable entry",
        });
      }

      // Validate required fields
      if (!courseId || !dayOfWeek || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: courseId, dayOfWeek, startTime, endTime",
        });
      }

      const timetableData = {
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        room,
        type,
        conductedBy: conductedBy || req.user.id,
        recurrenceStart,
        recurrenceEnd,
      };

      const timetable = await timetableService.createTimetable(tenantId, timetableData);

      res.status(201).json({
        success: true,
        message: "Timetable entry created successfully",
        data: timetable,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get course timetable
   * GET /Timetable/course/:courseId
   */
  getCourseTimetable: async (req, res) => {
    try {
      const { courseId } = req.params;
      const tenantId = req.user.tenantId;

      const timetables = await timetableService.getCourseTimetable(tenantId, courseId);

      res.status(200).json({
        success: true,
        message: "Course timetable retrieved successfully",
        data: timetables,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get user's schedule
   */
  getMySchedule: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const schedule = await timetableService.getMySchedule(tenantId, userId, userType);

      res.status(200).json({
        success: true,
        message: "Schedule retrieved successfully",
        data: schedule,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get today's schedule
   * GET /Timetable/today
   */
  getTodaySchedule: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];

      const timetables = await timetableService.getTodaySchedule(tenantId, userId, userType, dayName);

      res.status(200).json({
        success: true,
        message: "Today's schedule retrieved successfully",
        data: timetables,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get this week's schedule
   * GET /Timetable/week
   */
  getWeekSchedule: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const schedule = await timetableService.getWeekSchedule(tenantId, userId, userType);

      res.status(200).json({
        success: true,
        message: "Week schedule retrieved successfully",
        data: schedule,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update timetable entry
   * PATCH /Timetable/update/:id
   */
  updateTimetable: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      const timetable = await Timetable.findOne({ _id: id, tenantId });
      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: "Timetable entry not found",
        });
      }

      // Only admin and conductor can update
      if (userType === "teacher" && timetable.conductedBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const allowedFields = ["dayOfWeek", "startTime", "endTime", "room", "type", "recurrenceStart", "recurrenceEnd", "isActive"];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      Object.assign(timetable, updates);
      await timetable.save();

      const updated = await timetable.populate([
        { path: "courseId", select: "title category" },
        { path: "conductedBy", select: "firstName lastName email" },
      ]);

      res.status(200).json({
        success: true,
        message: "Timetable updated successfully",
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Delete timetable entry
   * DELETE /Timetable/delete/:id
   */
  deleteTimetable: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      // Only admin can delete
      if (userType !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete timetable entry",
        });
      }

      const timetable = await Timetable.findOneAndDelete({ _id: id, tenantId });
      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: "Timetable entry not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Timetable entry deleted successfully",
        data: timetable,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = timetableController;

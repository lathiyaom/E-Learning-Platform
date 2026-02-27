const { Timetable, Course, User, Enrollment } = require("../models");

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

      // Only admin and teacher can create timetable entries
      if (!["admin", "teacher"].includes(userType)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to create timetable entry",
        });
      }

      // Validate required fields
      if (!courseId || !dayOfWeek || !startTime || !endTime || !conductedBy || !recurrenceStart || !recurrenceEnd) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Verify course exists
      const course = await Course.findOne({ _id: courseId, tenantId });
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const timetable = await Timetable.create({
        tenantId,
        courseId,
        dayOfWeek: dayOfWeek.toLowerCase(),
        startTime,
        endTime,
        room,
        type,
        conductedBy,
        recurrenceStart,
        recurrenceEnd,
      });

      const populatedTimetable = await timetable.populate([
        { path: "courseId", select: "title category" },
        { path: "conductedBy", select: "firstName lastName email" },
      ]);

      res.status(201).json({
        success: true,
        message: "Timetable entry created successfully",
        data: populatedTimetable,
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

      const timetables = await Timetable.find({ tenantId, courseId, isActive: true })
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ dayOfWeek: 1, startTime: 1 });

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
   * Get user's full schedule
   * GET /Timetable/my-schedule
   */
  getMySchedule: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      let query = { tenantId, isActive: true };

      if (userType === "teacher") {
        query.conductedBy = userId;
      } else if (userType === "student") {
        // Get enrolled courses
        const enrollments = await Enrollment.find({ studentId: userId });
        const courseIds = enrollments.map((e) => e.courseId);
        query.courseId = { $in: courseIds };
      }

      const timetables = await Timetable.find(query)
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ dayOfWeek: 1, startTime: 1 });

      // Group by day of week
      const schedule = {};
      timetables.forEach((t) => {
        if (!schedule[t.dayOfWeek]) {
          schedule[t.dayOfWeek] = [];
        }
        schedule[t.dayOfWeek].push(t);
      });

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

      let query = { tenantId, dayOfWeek: dayName, isActive: true };

      if (userType === "teacher") {
        query.conductedBy = userId;
      } else if (userType === "student") {
        const enrollments = await Enrollment.find({ studentId: userId });
        const courseIds = enrollments.map((e) => e.courseId);
        query.courseId = { $in: courseIds };
      }

      const timetables = await Timetable.find(query)
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ startTime: 1 });

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

      let query = { tenantId, isActive: true };

      if (userType === "teacher") {
        query.conductedBy = userId;
      } else if (userType === "student") {
        const enrollments = await Enrollment.find({ studentId: userId });
        const courseIds = enrollments.map((e) => e.courseId);
        query.courseId = { $in: courseIds };
      }

      const timetables = await Timetable.find(query)
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ dayOfWeek: 1, startTime: 1 });

      // Group by day
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const schedule = {};
      days.forEach((day) => {
        schedule[day] = timetables.filter((t) => t.dayOfWeek === day);
      });

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

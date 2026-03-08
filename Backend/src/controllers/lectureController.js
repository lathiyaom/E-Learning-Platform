const lectureService = require("../services/lectureService");
const { Lecture } = require("../models");

const lectureController = {
  /**
   * Create a new lecture
   * POST /Lecture/create
   */
  createLecture: async (req, res) => {
    try {
      const { courseId, title, description, lectureDate, startTime, endTime, room, type, videoUrl, conductedBy } = req.body;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;
      const resolvedConductedBy = conductedBy || (userType === "teacher" ? req.user.id : null);

      // Only admin and teacher can create lectures
      if (!["admin", "teacher"].includes(userType)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to create lecture",
        });
      }

      // Validate required fields
      if (!courseId || !title || !lectureDate || !startTime || !endTime || !resolvedConductedBy) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: courseId, title, lectureDate, startTime, endTime",
        });
      }

      const lectureData = {
        courseId,
        title,
        description,
        lectureDate,
        startTime,
        endTime,
        room,
        type,
        videoUrl,
        conductedBy: resolvedConductedBy,
      };

      const lecture = await lectureService.createLecture(tenantId, lectureData);

      res.status(201).json({
        success: true,
        message: "Lecture created successfully",
        data: lecture,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get lecture by ID
   * GET /Lecture/:id
   */
  getLectureById: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;

      const lecture = await lectureService.getLectureById(tenantId, id);

      res.status(200).json({
        success: true,
        message: "Lecture retrieved successfully",
        data: lecture,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get all lectures for a course
   * GET /Lecture/course/:courseId
   */
  getLecturesByCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
      const tenantId = req.user.tenantId;

      const filters = {};
      if (status) filters.status = status;
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }

      const lectures = await lectureService.getLecturesByCourse(tenantId, courseId, filters);

      // Pagination
      const skip = (page - 1) * limit;
      const paginatedLectures = lectures.slice(skip, skip + parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Lectures retrieved successfully",
        data: paginatedLectures,
        pagination: {
          total: lectures.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(lectures.length / limit),
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
   * Get today's lectures
   * GET /Lecture/today
   */
  getTodayLectures: async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const lectures = await lectureService.getTodayLectures(tenantId, userId, userType);

      res.status(200).json({
        success: true,
        message: "Today's lectures retrieved successfully",
        data: lectures,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get upcoming lectures
   * GET /Lecture/upcoming
   */
  getUpcomingLectures: async (req, res) => {
    try {
      const { days = 7, page = 1, limit = 10 } = req.query;
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(days));

      let query = {
        tenantId,
        lectureDate: { $gte: startDate, $lte: endDate },
        status: { $in: ["scheduled", "ongoing"] },
      };

      if (userType === "teacher") {
        query.conductedBy = userId;
      } else if (userType === "student") {
        // Get courses where student is enrolled
        const { Enrollment } = require("../models");
        const enrollments = await Enrollment.find({ studentId: userId });
        const courseIds = enrollments.map((e) => e.courseId);
        query.courseId = { $in: courseIds };
      }

      const lectures = await Lecture.find(query)
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ lectureDate: 1, startTime: 1 });

      const skip = (page - 1) * limit;
      const paginatedLectures = lectures.slice(skip, skip + parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Upcoming lectures retrieved successfully",
        data: paginatedLectures,
        pagination: {
          total: lectures.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(lectures.length / limit),
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
   * Update lecture
   * PATCH /Lecture/update/:id
   */
  updateLecture: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      // Verify lecture exists and user has permission
      const lecture = await Lecture.findOne({ _id: id, tenantId });
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      // Only admin and lecture conductor can update
      if (userType === "teacher" && lecture.conductedBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this lecture",
        });
      }

      const allowedFields = ["title", "description", "lectureDate", "startTime", "endTime", "room", "type", "videoUrl", "materials"];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const updatedLecture = await Lecture.findByIdAndUpdate(id, updates, { new: true })
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email");

      res.status(200).json({
        success: true,
        message: "Lecture updated successfully",
        data: updatedLecture,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Update lecture status
   * PATCH /Lecture/status/:id
   */
  updateLectureStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      if (!["scheduled", "ongoing", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      // Verify lecture exists
      const lecture = await Lecture.findOne({ _id: id, tenantId });
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      // Only admin and lecture conductor can update status
      if (userType === "teacher" && lecture.conductedBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      lecture.status = status;
      await lecture.save();

      res.status(200).json({
        success: true,
        message: "Lecture status updated successfully",
        data: lecture,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Delete lecture
   * DELETE /Lecture/delete/:id
   */
  deleteLecture: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      const userType = req.user.userType;

      const lecture = await Lecture.findOne({ _id: id, tenantId });
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      const canDelete =
        userType === "admin" ||
        (userType === "teacher" && lecture.conductedBy?.toString() === req.user.id);

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this lecture",
        });
      }

      await lecture.deleteOne();

      res.status(200).json({
        success: true,
        message: "Lecture deleted successfully",
        data: lecture,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Add lecture material
   * POST /Lecture/:id/materials
   */
  addLectureMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url, type } = req.body;
      const tenantId = req.user.tenantId;

      if (!name || !url) {
        return res.status(400).json({
          success: false,
          message: "Material name and URL are required",
        });
      }

      const lecture = await Lecture.findOneAndUpdate(
        { _id: id, tenantId },
        {
          $push: {
            materials: {
              name,
              url,
              type: type || "other",
            },
          },
        },
        { new: true }
      );

      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Material added successfully",
        data: lecture,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Remove lecture material
   * DELETE /Lecture/:id/materials/:materialIndex
   */
  removeLectureMaterial: async (req, res) => {
    try {
      const { id, materialIndex } = req.params;
      const tenantId = req.user.tenantId;

      const lecture = await Lecture.findOne({ _id: id, tenantId });
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      lecture.materials.splice(materialIndex, 1);
      await lecture.save();

      res.status(200).json({
        success: true,
        message: "Material removed successfully",
        data: lecture,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = lectureController;

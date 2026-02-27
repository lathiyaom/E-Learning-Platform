const { Lecture, Course, User } = require("../models");

const lectureService = {
  /**
   * Create a new lecture
   */
  createLecture: async (tenantId, lectureData) => {
    try {
      // Verify course exists and belongs to tenant
      const course = await Course.findOne({ _id: lectureData.courseId, tenantId });
      if (!course) {
        throw new Error("Course not found or access denied");
      }

      // Verify teacher exists
      const teacher = await User.findOne({ _id: lectureData.conductedBy, tenantId, userType: "teacher" });
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      const lecture = await Lecture.create({
        ...lectureData,
        tenantId,
      });

      return await lecture.populate([
        { path: "courseId", select: "title category" },
        { path: "conductedBy", select: "firstName lastName email" },
      ]);
    } catch (error) {
      throw new Error(`Failed to create lecture: ${error.message}`);
    }
  },

  /**
   * Get lecture by ID
   */
  getLectureById: async (tenantId, lectureId) => {
    try {
      const lecture = await Lecture.findOne({ _id: lectureId, tenantId })
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email");

      if (!lecture) {
        throw new Error("Lecture not found");
      }

      return lecture;
    } catch (error) {
      throw new Error(`Failed to get lecture: ${error.message}`);
    }
  },

  /**
   * Get all lectures for a course
   */
  getLecturesByCourse: async (tenantId, courseId, filters = {}) => {
    try {
      const query = { tenantId, courseId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate && filters.endDate) {
        query.lectureDate = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        };
      }

      const lectures = await Lecture.find(query)
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ lectureDate: 1, startTime: 1 });

      return lectures;
    } catch (error) {
      throw new Error(`Failed to get lectures: ${error.message}`);
    }
  },

  /**
   * Get today's lectures for a user
   */
  getTodayLectures: async (tenantId, userId, userType) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let query = {
        tenantId,
        lectureDate: { $gte: today, $lt: tomorrow },
        status: { $in: ["scheduled", "ongoing"] },
      };

      if (userType === "teacher") {
        query.conductedBy = userId;
      }

      const lectures = await Lecture.find(query)
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ startTime: 1 });

      return lectures;
    } catch (error) {
      throw new Error(`Failed to get today's lectures: ${error.message}`);
    }
  },

  /**
   * Get upcoming lectures
   */
  getUpcomingLectures: async (tenantId, userId, userType, days = 7) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);

      let query = {
        tenantId,
        lectureDate: { $gte: today, $lte: futureDate },
        status: { $in: ["scheduled", "ongoing"] },
      };

      if (userType === "teacher") {
        query.conductedBy = userId;
      }

      const lectures = await Lecture.find(query)
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ lectureDate: 1, startTime: 1 })
        .limit(50);

      return lectures;
    } catch (error) {
      throw new Error(`Failed to get upcoming lectures: ${error.message}`);
    }
  },

  /**
   * Update lecture
   */
  updateLecture: async (tenantId, lectureId, updateData) => {
    try {
      const lecture = await Lecture.findOneAndUpdate(
        { _id: lectureId, tenantId },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email");

      if (!lecture) {
        throw new Error("Lecture not found");
      }

      return lecture;
    } catch (error) {
      throw new Error(`Failed to update lecture: ${error.message}`);
    }
  },

  /**
   * Update lecture status
   */
  updateLectureStatus: async (tenantId, lectureId, status) => {
    try {
      const validStatuses = ["scheduled", "ongoing", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      const lecture = await Lecture.findOneAndUpdate(
        { _id: lectureId, tenantId },
        { $set: { status } },
        { new: true }
      )
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email");

      if (!lecture) {
        throw new Error("Lecture not found");
      }

      return lecture;
    } catch (error) {
      throw new Error(`Failed to update lecture status: ${error.message}`);
    }
  },

  /**
   * Add material to lecture
   */
  addMaterial: async (tenantId, lectureId, material) => {
    try {
      const lecture = await Lecture.findOneAndUpdate(
        { _id: lectureId, tenantId },
        { $push: { materials: material } },
        { new: true }
      );

      if (!lecture) {
        throw new Error("Lecture not found");
      }

      return lecture;
    } catch (error) {
      throw new Error(`Failed to add material: ${error.message}`);
    }
  },

  /**
   * Delete lecture
   */
  deleteLecture: async (tenantId, lectureId) => {
    try {
      const lecture = await Lecture.findOneAndDelete({ _id: lectureId, tenantId });

      if (!lecture) {
        throw new Error("Lecture not found");
      }

      return { message: "Lecture deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete lecture: ${error.message}`);
    }
  },
};

module.exports = lectureService;

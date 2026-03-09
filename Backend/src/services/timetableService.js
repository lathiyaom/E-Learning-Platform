const { Timetable, Course, User, Enrollment } = require("../models");

const timetableService = {
  /**
   * Create a new timetable entry
   */
  createTimetable: async (tenantId, timetableData) => {
    try {
      // Verify course exists and belongs to tenant
      const course = await Course.findOne({ _id: timetableData.courseId, $or: [{ tenantId }, { organization_id: tenantId }] });
      if (!course) {
        throw new Error("Course not found or access denied");
      }

      // Verify teacher exists
      const teacher = await User.findOne({ _id: timetableData.conductedBy, $or: [{ tenant_id: tenantId }, { tenantId }], userType: "teacher" });
      if (!teacher) {
        throw new Error("Teacher not found");
      }

      const recurrenceStart =
        timetableData.recurrenceStart ? new Date(timetableData.recurrenceStart) : new Date();
      const recurrenceEnd =
        timetableData.recurrenceEnd
          ? new Date(timetableData.recurrenceEnd)
          : new Date(new Date().setMonth(new Date().getMonth() + 4));

      const timetable = await Timetable.create({
        ...timetableData,
        recurrenceStart,
        recurrenceEnd,
        tenantId,
      });

      return await timetable.populate([
        { path: "courseId", select: "title category" },
        { path: "conductedBy", select: "firstName lastName email" },
      ]);
    } catch (error) {
      throw new Error(`Failed to create timetable: ${error.message}`);
    }
  },

  /**
   * Get course timetable
   */
  getCourseTimetable: async (tenantId, courseId) => {
    try {
      const timetableEntries = await Timetable.find({
        tenantId,
        courseId,
        isActive: true,
      })
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email")
        .sort({ dayOfWeek: 1, startTime: 1 });

      return timetableEntries;
    } catch (error) {
      throw new Error(`Failed to get course timetable: ${error.message}`);
    }
  },

  /**
   * Get user's schedule (teacher or student)
   */
  getMySchedule: async (tenantId, userId, userType) => {
    try {
      let timetableEntries;

      if (userType === "teacher") {
        // Get timetable entries for courses taught by this teacher
        timetableEntries = await Timetable.find({
          tenantId,
          conductedBy: userId,
          isActive: true,
        })
          .populate("courseId", "title category")
          .populate("conductedBy", "firstName lastName email")
          .sort({ dayOfWeek: 1, startTime: 1 });
      } else if (userType === "student") {
        // Get courses where student is enrolled
        const enrollments = await Enrollment.find({
          $and: [
            { $or: [{ studentId: userId }, { student_id: userId }] },
            { $or: [{ tenantId }, { organization_id: tenantId }] },
          ],
        });
        
        const courseIds = enrollments.map((e) => e.courseId || e.course_id);
        
        // Get timetable entries for enrolled courses
        timetableEntries = await Timetable.find({
          tenantId,
          courseId: { $in: courseIds },
          isActive: true,
        })
          .populate("courseId", "title category")
          .populate("conductedBy", "firstName lastName email")
          .sort({ dayOfWeek: 1, startTime: 1 });
      }

      // Group by day of week
      const schedule = {};
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      
      days.forEach(day => {
        schedule[day] = timetableEntries?.filter(entry => entry.dayOfWeek === day) || [];
      });

      return schedule;
    } catch (error) {
      throw new Error(`Failed to get schedule: ${error.message}`);
    }
  },

  /**
   * Get today's schedule
   */
  getTodaySchedule: async (tenantId, userId, userType) => {
    try {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      let timetableEntries;

      if (userType === "teacher") {
        timetableEntries = await Timetable.find({
          tenantId,
          conductedBy: userId,
          dayOfWeek,
          isActive: true,
        })
          .populate("courseId", "title category")
          .populate("conductedBy", "firstName lastName email")
          .sort({ startTime: 1 });
      } else if (userType === "student") {
        // Get courses where student is enrolled
        const enrollments = await Enrollment.find({
          $and: [
            { $or: [{ studentId: userId }, { student_id: userId }] },
            { $or: [{ tenantId }, { organization_id: tenantId }] },
          ],
        });
        
        const courseIds = enrollments.map((e) => e.courseId || e.course_id);
        
        timetableEntries = await Timetable.find({
          tenantId,
          courseId: { $in: courseIds },
          dayOfWeek,
          isActive: true,
        })
          .populate("courseId", "title category")
          .populate("conductedBy", "firstName lastName email")
          .sort({ startTime: 1 });
      }

      return timetableEntries;
    } catch (error) {
      throw new Error(`Failed to get today's schedule: ${error.message}`);
    }
  },

  /**
   * Get week schedule
   */
  getWeekSchedule: async (tenantId, userId, userType) => {
    try {
      let timetableEntries;

      if (userType === "teacher") {
        timetableEntries = await Timetable.find({
          tenantId,
          conductedBy: userId,
          isActive: true,
        })
          .populate("courseId", "title category")
          .populate("conductedBy", "firstName lastName email")
          .sort({ dayOfWeek: 1, startTime: 1 });
      } else if (userType === "student") {
        // Get courses where student is enrolled
        const enrollments = await Enrollment.find({
          $and: [
            { $or: [{ studentId: userId }, { student_id: userId }] },
            { $or: [{ tenantId }, { organization_id: tenantId }] },
          ],
        });
        
        const courseIds = enrollments.map((e) => e.courseId || e.course_id);
        
        timetableEntries = await Timetable.find({
          tenantId,
          courseId: { $in: courseIds },
          isActive: true,
        })
          .populate("courseId", "title category")
          .populate("conductedBy", "firstName lastName email")
          .sort({ dayOfWeek: 1, startTime: 1 });
      }

      return timetableEntries;
    } catch (error) {
      throw new Error(`Failed to get week schedule: ${error.message}`);
    }
  },

  /**
   * Update timetable
   */
  updateTimetable: async (tenantId, timetableId, updateData) => {
    try {
      const timetable = await Timetable.findOneAndUpdate(
        { _id: timetableId, tenantId },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("courseId", "title category")
        .populate("conductedBy", "firstName lastName email");

      if (!timetable) {
        throw new Error("Timetable entry not found");
      }

      return timetable;
    } catch (error) {
      throw new Error(`Failed to update timetable: ${error.message}`);
    }
  },

  /**
   * Delete timetable
   */
  deleteTimetable: async (tenantId, timetableId) => {
    try {
      const timetable = await Timetable.findOneAndDelete({ _id: timetableId, tenantId });

      if (!timetable) {
        throw new Error("Timetable entry not found");
      }

      return { message: "Timetable entry deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete timetable: ${error.message}`);
    }
  },
};

module.exports = timetableService;

const { Course, User, Enrollment, Attendance, Rating, Feedback } = require("../models");

const byTenant = (tenantId) => ({ $or: [{ tenantId }, { organization_id: tenantId }, { tenant_id: tenantId }] });

const analyticsService = {
  getAdminDashboard: async (tenantId) => {
    try {
      const totalUsers = await User.countDocuments(byTenant(tenantId));
      const totalStudents = await User.countDocuments({ ...byTenant(tenantId), userType: "student" });
      const totalTeachers = await User.countDocuments({ ...byTenant(tenantId), userType: "teacher" });
      const totalCourses = await Course.countDocuments({
        $or: [{ tenantId }, { organization_id: tenantId }],
      });
      const totalEnrollments = await Enrollment.countDocuments({
        $or: [{ tenantId }, { organization_id: tenantId }],
      });

      const enrollmentTrend = await Enrollment.aggregate([
        {
          $match: {
            $or: [{ tenantId }, { organization_id: tenantId }],
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const topCourses = await Enrollment.aggregate([
        {
          $match: {
            $or: [{ tenantId }, { organization_id: tenantId }],
          },
        },
        { $group: { _id: { $ifNull: ["$courseId", "$course_id"] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      ]);

      return {
        stats: { totalUsers, totalStudents, totalTeachers, totalCourses, totalEnrollments },
        trends: { enrollmentTrend },
        topCourses,
      };
    } catch (error) {
      throw new Error(`Failed to get admin dashboard: ${error.message}`);
    }
  },

  getTeacherDashboard: async (tenantId, teacherId) => {
    try {
      const myCourses = await Course.find({
        $and: [
          { $or: [{ tenantId }, { organization_id: tenantId }] },
          { $or: [{ createdBy: teacherId }, { teacher_id: teacherId }] },
        ],
      });
      const courseIds = myCourses.map((course) => course._id);

      const totalStudents = await Enrollment.countDocuments({
        $or: [{ courseId: { $in: courseIds } }, { course_id: { $in: courseIds } }],
      });

      const averageRating =
        myCourses.length > 0
          ? myCourses.reduce((sum, course) => sum + Number(course.rating || 0), 0) / myCourses.length
          : 0;

      return {
        totalCourses: myCourses.length,
        totalStudents,
        avgRating: Number(averageRating.toFixed(2)),
        avgAttendance: 0,
        attendanceTrend: [],
        studentProgress: [],
      };
    } catch (error) {
      throw new Error(`Failed to get teacher dashboard: ${error.message}`);
    }
  },

  getStudentDashboard: async (tenantId, studentId) => {
    try {
      const enrolledCourses = await Enrollment.find({
        $and: [
          { $or: [{ tenantId }, { organization_id: tenantId }] },
          { $or: [{ studentId }, { student_id: studentId }] },
        ],
      })
        .populate("courseId", "title")
        .populate("course_id", "title");

      const courseIds = enrolledCourses.map((enrollment) => enrollment.courseId?._id || enrollment.course_id?._id);

      const totalClasses = await Attendance.countDocuments({
        courseId: { $in: courseIds },
      });
      const attendedClasses = await Attendance.countDocuments({
        courseId: { $in: courseIds },
        "attendanceRecords.studentId": studentId,
      });

      
      const courseProgress = enrolledCourses.map((enrollment) => ({
        courseId: enrollment.courseId?._id || enrollment.course_id?._id,
        courseName: enrollment.courseId?.title || enrollment.course_id?.title,
        progress: enrollment.progressPercent ?? enrollment.progress ?? 0,
      }));

      return {
        enrolledCoursesCount: enrolledCourses.length,
        attendancePercentage: totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0,
                courseProgress,
      };
    } catch (error) {
      throw new Error(`Failed to get student dashboard: ${error.message}`);
    }
  },

  getCourseAnalytics: async (tenantId, courseId) => {
    try {
      const courseData = await Course.findOne({
        _id: courseId,
        $or: [{ tenantId }, { organization_id: tenantId }],
      });

      const enrollmentCount = await Enrollment.countDocuments({
        $or: [
          { tenantId, courseId },
          { organization_id: tenantId, course_id: courseId },
        ],
      });

      const attendanceInfo = await Attendance.aggregate([
        { $match: { courseId } },
        {
          $group: {
            _id: null,
            totalClasses: { $sum: 1 },
            averageAttendance: { $avg: { $size: "$attendanceRecords" } },
          },
        },
      ]);

      const ratingInfo = await Rating.aggregate([
        { $match: { courseId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
          },
        },
      ]);

      const feedbackCount = await Feedback.countDocuments({ courseId });

      return {
        course: courseData,
        enrollment: enrollmentCount,
        attendance: attendanceInfo[0] || { totalClasses: 0, averageAttendance: 0 },
        ratings: ratingInfo[0] || { averageRating: 0, totalRatings: 0 },
        feedbackCount,
      };
    } catch (error) {
      throw new Error(`Failed to get course analytics: ${error.message}`);
    }
  },

  getEnrollmentTrends: async (tenantId, days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Enrollment.aggregate([
        {
          $match: {
            $or: [{ tenantId }, { organization_id: tenantId }],
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      return trends;
    } catch (error) {
      throw new Error(`Failed to get enrollment trends: ${error.message}`);
    }
  },
};

module.exports = analyticsService;

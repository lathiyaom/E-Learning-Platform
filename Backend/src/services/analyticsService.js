const { Course, User, Enrollment, Attendance, Exam, ExamSubmission, Rating, Feedback } = require("../models");

const analyticsService = {
  /**
   * Get admin dashboard statistics
   */
  getAdminDashboard: async (tenantId) => {
    try {
      const totalUsers = await User.countDocuments({ tenantId });
      const totalStudents = await User.countDocuments({ tenantId, userType: "student" });
      const totalTeachers = await User.countDocuments({ tenantId, userType: "teacher" });
      const totalCourses = await Course.countDocuments({ tenantId });
      const totalEnrollments = await Enrollment.countDocuments({ tenantId });

      // Monthly enrollment trend
      const enrollmentTrend = await Enrollment.aggregate([
        { $match: { tenantId } },
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

      // Top courses by enrollment
      const topCourses = await Enrollment.aggregate([
        { $match: { tenantId } },
        { $group: { _id: "$courseId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      ]);

      return {
        stats: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalCourses,
          totalEnrollments,
        },
        trends: {
          enrollmentTrend,
        },
        topCourses,
      };
    } catch (error) {
      throw new Error(`Failed to get admin dashboard: ${error.message}`);
    }
  },

  /**
   * Get teacher dashboard statistics
   */
  getTeacherDashboard: async (tenantId, teacherId) => {
    try {
      // Courses taught
      const myCourses = await Course.find({ tenantId, instructors: teacherId });
      const courseIds = myCourses.map((c) => c._id);

      // Total students
      const totalStudents = await Enrollment.countDocuments({
        courseId: { $in: courseIds },
      });

      // Get average rating
      const averageRating = await Rating.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]);

      // Attendance summary
      const attendanceSummary = await Attendance.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        {
          $group: {
            _id: "$courseId",
            totalClasses: { $sum: 1 },
            averageAttendance: {
              $avg: {
                $multiply: [
                  {
                    $divide: [
                      { $size: "$attendanceRecords" },
                      { $add: [{ $size: "$attendanceRecords" }, 1] },
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      ]);

      // Recent feedback
      const recentFeedback = await Feedback.find({
        courseId: { $in: courseIds },
      })
        .limit(5)
        .sort({ createdAt: -1 });

      return {
        courseCount: myCourses.length,
        totalStudents,
        averageRating: averageRating[0]?.avgRating || 0,
        attendanceSummary,
        recentFeedback,
      };
    } catch (error) {
      throw new Error(`Failed to get teacher dashboard: ${error.message}`);
    }
  },

  /**
   * Get student dashboard statistics
   */
  getStudentDashboard: async (tenantId, studentId) => {
    try {
      // Courses enrolled
      const enrolledCourses = await Enrollment.find({
        tenantId,
        studentId,
      }).populate("courseId", "title instructor");

      const courseIds = enrolledCourses.map((e) => e.courseId._id);

      // Attendance percentage
      const attendanceData = await Attendance.aggregate([
        { $match: { courseId: { $in: courseIds }, "attendanceRecords.studentId": studentId } },
        {
          $group: {
            _id: "$courseId",
            attended: { $sum: 1 },
          },
        },
      ]);

      const totalClasses = await Attendance.countDocuments({
        courseId: { $in: courseIds },
      });

      // Exam performance
      const examResults = await ExamSubmission.aggregate([
        { $match: { studentId, courseId: { $in: courseIds } } },
        {
          $lookup: {
            from: "exams",
            localField: "examId",
            foreignField: "_id",
            as: "exam",
          },
        },
        {
          $group: {
            _id: "$courseId",
            averageScore: { $avg: "$score" },
            totalExams: { $sum: 1 },
          },
        },
      ]);

      // Course progress
      const courseProgress = enrolledCourses.map((e) => ({
        courseId: e.courseId._id,
        courseName: e.courseId.title,
        progress: e.progress || 0,
      }));

      return {
        enrolledCoursesCount: enrolledCourses.length,
        attendancePercentage: totalClasses > 0 ? (attendanceData.length / totalClasses) * 100 : 0,
        examResults,
        courseProgress,
      };
    } catch (error) {
      throw new Error(`Failed to get student dashboard: ${error.message}`);
    }
  },

  /**
   * Get course analytics
   */
  getCourseAnalytics: async (tenantId, courseId) => {
    try {
      const courseData = await Course.findOne({
        _id: courseId,
        tenantId,
      }).populate("instructors", "firstName lastName");

      const enrollmentCount = await Enrollment.countDocuments({ courseId });

      // Attendance
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

      // Ratings
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

      // Feedback
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

  /**
   * Get enrollment trends
   */
  getEnrollmentTrends: async (tenantId, days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Enrollment.aggregate([
        {
          $match: {
            tenantId,
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

const analyticsService = require("../services/analyticsService");

const analyticsController = {
  /**
   * Get admin dashboard
   * GET /Analytics/admin/dashboard
   */
  getAdminDashboard: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const userType = req.user.userType;

      if (userType !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const dashboard = await analyticsService.getAdminDashboard(tenantId);

      res.status(200).json({
        success: true,
        message: "Admin dashboard retrieved successfully",
        data: dashboard,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get teacher dashboard
   * GET /Analytics/teacher/dashboard
   */
  getTeacherDashboard: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      if (userType !== "teacher") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const dashboard = await analyticsService.getTeacherDashboard(tenantId, userId);

      res.status(200).json({
        success: true,
        message: "Teacher dashboard retrieved successfully",
        data: dashboard,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get student dashboard
   * GET /Analytics/student/dashboard
   */
  getStudentDashboard: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const userId = req.user.id;
      const userType = req.user.userType;

      if (userType !== "student") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const dashboard = await analyticsService.getStudentDashboard(tenantId, userId);

      res.status(200).json({
        success: true,
        message: "Student dashboard retrieved successfully",
        data: dashboard,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get course analytics
   * GET /Analytics/course/:courseId
   */
  getCourseAnalytics: async (req, res) => {
    try {
      const { courseId } = req.params;
      const tenantId = req.tenantId;

      const analytics = await analyticsService.getCourseAnalytics(tenantId, courseId);

      res.status(200).json({
        success: true,
        message: "Course analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Get enrollment trends
   * GET /Analytics/enrollment-trends
   */
  getEnrollmentTrends: async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const tenantId = req.tenantId;

      const trends = await analyticsService.getEnrollmentTrends(tenantId, parseInt(days));

      res.status(200).json({
        success: true,
        message: "Enrollment trends retrieved successfully",
        data: trends,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = analyticsController;

const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { authenticate } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// All analytics routes require authentication
router.use(authenticate);
router.use(tenantScope);

// Admin dashboard
router.get("/admin/dashboard", analyticsController.getAdminDashboard);

// Teacher dashboard
router.get("/teacher/dashboard", analyticsController.getTeacherDashboard);

// Student dashboard
router.get("/student/dashboard", analyticsController.getStudentDashboard);

// Course analytics
router.get("/course/:courseId", analyticsController.getCourseAnalytics);

// Enrollment trends
router.get("/enrollment-trends", analyticsController.getEnrollmentTrends);

module.exports = router;

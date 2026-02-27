const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { authenticate } = require("../middlewares/authMiddleware");

// All analytics routes require authentication
router.use(authenticate);

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

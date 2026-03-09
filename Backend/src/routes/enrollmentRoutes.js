const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");
const enrollmentController = require("../controllers/enrollmentController");

// Enroll in a course
router.post(
  "/enroll",
  authenticate,
  tenantScope,
  authorize("student", "admin"),
  enrollmentController.enrollStudent
);

// Get student enrollments
router.get(
  "/student/:studentId",
  authenticate,
  tenantScope,
  enrollmentController.getStudentEnrollments
);

// Get current student's enrollments
router.get(
  "/my-courses",
  authenticate,
  authorize("student"),
  enrollmentController.getMyEnrollments
);

// Get course enrollments (teacher/admin only)
router.get(
  "/course/:courseId",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  enrollmentController.getCourseEnrollments
);

// Update progress
router.patch(
  "/progress/:id",
  authenticate,
  tenantScope,
  enrollmentController.updateProgress
);

// Drop course
router.patch(
  "/drop/:id",
  authenticate,
  tenantScope,
  authorize("student"),
  enrollmentController.dropCourse
);

// Delete enrollment (admin only)
router.delete(
  "/:id",
  authenticate,
  tenantScope,
  authorize("admin"),
  enrollmentController.deleteEnrollment
);

module.exports = router;

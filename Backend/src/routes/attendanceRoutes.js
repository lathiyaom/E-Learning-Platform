const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");
const attendanceController = require("../controllers/attendanceController");

// Mark attendance
router.post(
  "/mark",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  attendanceController.markAttendance
);

// Update attendance
router.patch(
  "/:id",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  attendanceController.updateAttendance
);

// Get attendance report for a course
router.get(
  "/report/:courseId",
  authenticate,
  tenantScope,
  authorize("teacher", "admin", "student"),
  attendanceController.getAttendanceReport
);

// Get student attendance
router.get(
  "/student/:studentId/:courseId",
  authenticate,
  tenantScope,
  attendanceController.getStudentAttendance
);

// Delete attendance (admin only)
router.delete(
  "/:id",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  attendanceController.deleteAttendance
);

module.exports = router;

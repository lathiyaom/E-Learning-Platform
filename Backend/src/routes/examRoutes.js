const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");
const examController = require("../controllers/examController");

// Create exam
router.post(
  "/create",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  examController.createExam
);

// Get exams by course
router.get(
  "/course/:courseId",
  authenticate,
  tenantScope,
  examController.getExamsByCourse
);

// Get exam by ID
router.get(
  "/:id",
  authenticate,
  tenantScope,
  examController.getExamById
);

// Update exam
router.patch(
  "/:id",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  examController.updateExam
);

// Delete exam
router.delete(
  "/:id",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  examController.deleteExam
);

// Submit exam (student)
router.post(
  "/submit/:examId",
  authenticate,
  tenantScope,
  authorize("student"),
  examController.submitExam
);

// Grade submission (teacher/admin)
router.post(
  "/grade/:submissionId",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  examController.gradeSubmission
);

// Get student submissions
router.get(
  "/submissions/:studentId",
  authenticate,
  tenantScope,
  examController.getStudentSubmissions
);

module.exports = router;

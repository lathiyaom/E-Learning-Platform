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

// Get student upcoming exams - MUST come before /:id route
router.get(
  "/student/upcoming",
  authenticate,
  tenantScope,
  authorize("student"),
  examController.getStudentExams
);

// Get student submissions - MUST come before /:id route
router.get(
  "/submissions/:studentId",
  authenticate,
  tenantScope,
  examController.getStudentSubmissions
);

// Get exams by course
router.get(
  "/course/:courseId",
  authenticate,
  tenantScope,
  examController.getExamsByCourse
);

// Get exam by ID - MUST come after all other GET routes
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

// Grade submission (teacher/admin)
router.post(
  "/grade/:submissionId",
  authenticate,
  tenantScope,
  authorize("teacher", "admin"),
  examController.gradeSubmission
);

// Submit exam (student)
router.post(
  "/submit/:examId",
  authenticate,
  tenantScope,
  authorize("student"),
  examController.submitExam
);

module.exports = router;

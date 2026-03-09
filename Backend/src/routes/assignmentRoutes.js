const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getTeacherAssignments,
  getStudentAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
} = require("../controllers/assignmentController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { body } = require("express-validator");

// Middleware
const auth = authenticate;

// Validation middleware
const validateAssignmentCreation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("courseId").isMongoId().withMessage("Valid course ID is required"),
  body("assignmentType").isIn(["homework", "project", "quiz", "essay", "presentation", "lab", "other"]),
  body("maxPoints").isNumeric().withMessage("Max points must be a number"),
  body("dueDate").isISO8601().withMessage("Valid due date is required"),
  body("submissionType").isIn(["text", "file", "link", "multiple"]),
];

const validateSubmission = [
  body("submissionType").isIn(["text", "file", "link", "multiple"]),
  body("textContent").optional().isLength({ max: 10000 }),
];

const validateGrading = [
  body("grade").isNumeric().withMessage("Grade must be a number"),
  body("teacherFeedback").optional().isLength({ max: 2000 }),
];

// Teacher routes
router.post(
  "/",
  auth,
  authorize("teacher"),
  validateAssignmentCreation,
  createAssignment
);

router.get(
  "/teacher",
  auth,
  authorize("teacher"),
  getTeacherAssignments
);

router.get(
  "/student",
  auth,
  authorize("student"),
  getStudentAssignments
);

router.get(
  "/:id",
  auth,
  getAssignment
);

router.put(
  "/:id",
  auth,
  authorize("teacher"),
  updateAssignment
);

router.delete(
  "/:id",
  auth,
  authorize("teacher"),
  deleteAssignment
);

// Student routes
router.post(
  "/:id/submit",
  auth,
  authorize("student"),
  validateSubmission,
  submitAssignment
);

// Teacher grading routes
router.put(
  "/:submissionId/grade",
  auth,
  authorize("teacher"),
  validateGrading,
  gradeSubmission
);

router.get(
  "/:id/submissions",
  auth,
  authorize("teacher"),
  getAssignmentSubmissions
);

module.exports = router;

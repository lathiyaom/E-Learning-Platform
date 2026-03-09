/**
 * Teacher Multi-Organization Routes
 */

const express = require("express");
const router = express.Router();
const teacherOrganizationController = require("../controllers/teacherOrganizationController");
const examController = require("../controllers/examController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Admin/SuperAdmin routes - Manage teacher assignments
router.get(
  "/unassigned",
  authenticate,
  authorize("admin", "superadmin"),
  teacherOrganizationController.getUnassignedTeachers
);

router.get(
  "/organization/:tenantId",
  authenticate,
  authorize("admin", "superadmin"),
  teacherOrganizationController.getOrganizationTeachers
);

router.post(
  "/assign",
  authenticate,
  tenantScope,
  authorize("admin", "superadmin"),
  teacherOrganizationController.assignTeachersToOrganization
);

router.delete(
  "/remove/:teacherId",
  authenticate,
  tenantScope,
  authorize("admin", "superadmin"),
  teacherOrganizationController.removeTeacherFromOrganization
);

// Teacher routes - Manage own organizations
router.get(
  "/my-organizations",
  authenticate,
  authorize("teacher"),
  teacherOrganizationController.getMyOrganizations
);

router.post(
  "/switch-organization",
  authenticate,
  authorize("teacher"),
  teacherOrganizationController.switchOrganization
);

router.get(
  "/org-stats",
  authenticate,
  authorize("teacher"),
  teacherOrganizationController.getOrgStats
);

router.get(
  "/org-data/:dataType",
  authenticate,
  authorize("teacher"),
  teacherOrganizationController.getOrgData
);

// Exam management routes for teachers
router.post(
  "/exams-create",
  authenticate,
  tenantScope,
  authorize("teacher"),
  examController.createExam
);

router.get(
  "/exams/course/:courseId",
  authenticate,
  tenantScope,
  authorize("teacher"),
  examController.getExamsByCourse
);

router.get(
  "/exams/:id",
  authenticate,
  tenantScope,
  authorize("teacher"),
  examController.getExamById
);

router.patch(
  "/exams/:id",
  authenticate,
  tenantScope,
  authorize("teacher"),
  examController.updateExam
);

router.delete(
  "/exams/:id",
  authenticate,
  tenantScope,
  authorize("teacher"),
  examController.deleteExam
);

router.post(
  "/exams/grade/:submissionId",
  authenticate,
  tenantScope,
  authorize("teacher"),
  examController.gradeSubmission
);

module.exports = router;

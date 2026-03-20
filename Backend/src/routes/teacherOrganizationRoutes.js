/**
 * Teacher Multi-Organization Routes
 */

const express = require("express");
const router = express.Router();
const teacherOrganizationController = require("../controllers/teacherOrganizationController");
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
  authorize("admin"),
  teacherOrganizationController.assignTeachersToOrganization
);

router.delete(
  "/remove/:teacherId",
  authenticate,
  tenantScope,
  authorize("admin"),
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

module.exports = router;

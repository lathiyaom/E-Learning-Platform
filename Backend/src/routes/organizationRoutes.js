const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// ✅ Get all unassigned teachers - Admin only
router.get(
  "/teachers/unassigned",
  authenticate,
  authorize("admin", "superadmin"),
  organizationController.getUnassignedTeachers
);

// ✅ Get all teachers for organization (assigned + unassigned) - Tenant admin only
router.get(
  "/teachers/all",
  authenticate,
  authorize("admin", "superadmin"),
  organizationController.getAllTeachersForAdmin
);

// ✅ Assign multiple teachers to organization - Tenant admin only
router.post(
  "/teachers/assign",
  authenticate,
  authorize("admin", "superadmin"),
  organizationController.assignTeachersToOrganization
);

// ✅ Remove teacher from organization - Tenant admin only
router.post(
  "/teachers/remove",
  authenticate,
  authorize("admin", "superadmin"),
  organizationController.removeTeacherFromOrganization
);

// ✅ Get teacher's organizations - Teacher only
router.get(
  "/my-organizations",
  authenticate,
  authorize("teacher"),
  organizationController.getTeacherOrganizations
);

// ✅ Switch teacher's current organization - Teacher only
router.post(
  "/switch-organization",
  authenticate,
  authorize("teacher"),
  organizationController.switchTeacherOrganization
);

// ✅ Get organization's data (courses, students, events) - Teacher only
router.get(
  "/data/:organizationId",
  authenticate,
  authorize("teacher"),
  organizationController.getOrganizationData
);

// ✅ Teacher Application Management Routes

// ✅ Get pending applications for organization - Tenant admin only
router.get(
  "/applications/pending",
  authenticate,
  tenantScope,
  authorize("admin"),
  organizationController.getPendingApplications
);

// ✅ Approve teacher application - Tenant admin only
router.post(
  "/applications/:application_id/approve",
  authenticate,
  tenantScope,
  authorize("admin"),
  organizationController.approveApplication
);

// ✅ Reject teacher application - Tenant admin only
router.post(
  "/applications/:application_id/reject",
  authenticate,
  tenantScope,
  authorize("admin"),
  organizationController.rejectApplication
);

// ✅ Invite teacher to organization - Tenant admin only
router.post(
  "/teachers/invite",
  authenticate,
  tenantScope,
  authorize("admin"),
  organizationController.inviteTeacher
);

// ✅ Search available teachers to invite - Tenant admin only
router.get(
  "/teachers/search",
  authenticate,
  tenantScope,
  authorize("admin"),
  organizationController.searchTeachers
);

module.exports = router;

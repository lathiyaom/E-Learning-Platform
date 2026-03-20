const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const { authenticate, authorize, isTenantOwner } = require("../middlewares/authMiddleware");

// Backward-compatible public invitation callbacks.
// Old emails may still point to /SuperAdmin/TeacherInvitation/:token/:action.
router.get("/TeacherInvitation/:token/accept", superAdminController.acceptTeacherInvitation);
router.get("/TeacherInvitation/:token/reject", superAdminController.rejectTeacherInvitation);

// All routes require: authenticated + from tenants table + superadmin role
router.use(authenticate, isTenantOwner, authorize("superadmin"));

// Teacher management (SuperAdmin)
router.get("/Teachers", superAdminController.getAllTeachers);
router.post("/InviteTeacher", superAdminController.inviteTeacherToOrg);

// Tenant management
router.get("/Tenants", superAdminController.getAllTenants);
router.get("/Tenant/:id", superAdminController.getTenantWithUsers);
router.patch("/Promote/:id", superAdminController.promoteTenant);
router.patch("/Demote/:id", superAdminController.demoteTenant);
router.patch("/Status/:id", superAdminController.changeTenantStatus);
router.delete("/Tenant/:id", superAdminController.deleteTenant);

// Platform-wide user view
router.get("/Users", superAdminController.getAllUsers);

// Dashboard stats
router.get("/Stats", superAdminController.getPlatformStats);

// Organizations overview (per-org teacher & student counts)
router.get("/Organizations", superAdminController.getOrganizationsOverview);

// Activity logs
router.get("/Logs", superAdminController.getActivityLogs);

module.exports = router;
// Teacher invitation callback routes (public - accessible without auth via redirect)
module.exports.invitationRouter = (() => {
	const invRouter = require("express").Router();
	invRouter.get("/:token/accept", superAdminController.acceptTeacherInvitation);
	invRouter.get("/:token/reject", superAdminController.rejectTeacherInvitation);
	return invRouter;
})();

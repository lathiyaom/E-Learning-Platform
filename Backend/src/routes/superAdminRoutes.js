const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const { authenticate, authorize, isTenantOwner } = require("../middlewares/authMiddleware");

// All routes require: authenticated + from tenants table + superadmin role
router.use(authenticate, isTenantOwner, authorize("superadmin"));

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

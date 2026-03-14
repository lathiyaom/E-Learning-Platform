const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const { authenticate, authorize, isTenantOwner } = require("../middlewares/authMiddleware");
const { validateTenantRegistration, validateIdParam } = require("../middlewares/validation.middleware");

// Public: list organization names for signup dropdown (no auth required)
router.get("/list", tenantController.getOrganizationList);

// Public: any organization can self-register
router.post("/Register", validateTenantRegistration, tenantController.createTenant);

router.get("/Details/:id", validateIdParam, authenticate, tenantController.getTenantDetails);
router.patch("/Update/:id", validateIdParam, authenticate, isTenantOwner, authorize("admin", "superadmin"), tenantController.updateTenant);

// Assign a teacher to an organization (by tenant owner or superadmin)
router.patch(
  "/AssignTeacher/:tenantId",
  validateIdParam,
  authenticate,
  tenantController.assignTeacherToTenant
);

module.exports = router;

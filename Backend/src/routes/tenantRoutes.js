const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const { Tenant } = require("../models");
const { authenticate, authorize, isTenantOwner } = require("../middlewares/authMiddleware");

/**
 * Smart Registration Middleware:
 *  - If 0 tenants exist → skip auth (bootstrap: creates first superadmin)
 *  - If tenants exist → require superadmin authentication
 */
const smartRegisterAuth = async (req, res, next) => {
  try {
    const count = await Tenant.countDocuments();
    if (count === 0) {
      // First ever registration — no auth needed (bootstrap superadmin)
      return next();
    }
    // Subsequent registrations require superadmin authentication
    authenticate(req, res, (err) => {
      if (err) return next(err);
      // If authenticate sent a response (401), don't continue
      if (res.headersSent) return;
      const authorizeSuperadmin = authorize("superadmin");
      authorizeSuperadmin(req, res, next);
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

router.post("/Register", smartRegisterAuth, tenantController.createTenant);

router.get("/Details/:id", authenticate, tenantController.getTenantDetails);
router.patch("/Update/:id", authenticate, isTenantOwner, authorize("admin", "superadmin"), tenantController.updateTenant);

// Assign a teacher to an organization (by tenant owner or superadmin)
router.patch(
  "/AssignTeacher/:tenantId",
  authenticate,
  tenantController.assignTeacherToTenant
);

module.exports = router;

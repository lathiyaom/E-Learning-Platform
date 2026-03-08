const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const { Tenant } = require("../models");
const { authenticate, authorize, isTenantOwner } = require("../middlewares/authMiddleware");
const { validateTenantRegistration, validateIdParam } = require("../middlewares/validation.middleware");

/**
 * Smart Registration Middleware:
 *  - If no tenants exist, allow bootstrap registration
 *  - If only default platform owner exists, allow public org registration
 *  - Otherwise require superadmin authentication
 */
const smartRegisterAuth = async (req, res, next) => {
  try {
    const count = await Tenant.countDocuments();

    if (count === 0) {
      console.log("Bootstrap mode: first tenant registration");
      return next();
    }

    if (count === 1) {
      const platformOwner = await Tenant.findOne({
        userType: "superadmin",
        email: process.env.SUPERADMIN_EMAIL || "superadmin@gmail.com",
      });

      if (platformOwner) {
        console.log("Platform owner only: allowing public organization registration");
        return next();
      }
    }

    // Subsequent registrations require superadmin authentication
    return authenticate(req, res, (err) => {
      if (err) return next(err);

      if (res.headersSent) {
        return;
      }

      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required. Only superadmin can create new organizations.",
          success: false,
          hint: "Please login as superadmin first.",
        });
      }

      const authorizeSuperadmin = authorize("superadmin");
      authorizeSuperadmin(req, res, next);
    });
  } catch (error) {
    console.error("Smart register auth error:", error);
    return res.status(500).json({
      message: "Internal server error during authentication check",
      success: false,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

router.post("/Register", validateTenantRegistration, smartRegisterAuth, tenantController.createTenant);

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

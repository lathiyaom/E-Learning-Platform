/**
 * Organization Context Middleware
 * 
 * For teachers: Uses currentOrganization from user profile
 * For admin/superadmin: Uses their tenantId (they are the tenant)
 * 
 * Sets req.organizationId for use in controllers/services
 */

const { User, Tenant } = require("../models");

const orgContext = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    let organizationId = null;

    if (req.user.userType === "teacher") {
      // For teachers, get their current organization
      const teacher = await User.findById(req.user.id).select("currentOrganization");
      organizationId = teacher?.currentOrganization;

      if (!organizationId) {
        return res.status(403).json({
          message: "Teacher not assigned to any organization. Please contact administrator.",
          success: false,
        });
      }
    } else if (req.user.userType === "admin" || req.user.userType === "superadmin") {
      // For admins, they ARE the tenant
      organizationId = req.user.id;
    }

    if (!organizationId) {
      return res.status(403).json({
        message: "Organization context not available",
        success: false,
      });
    }

    req.organizationId = organizationId;
    req.tenantId = organizationId; // For backward compatibility

    next();
  } catch (error) {
    res.status(500).json({
      message: "Failed to set organization context",
      success: false,
      error: error.message,
    });
  }
};

module.exports = orgContext;

/**
 * Tenant Scope Middleware
 * 
 * Injects tenantId into request based on user's role:
 * - Teacher: Uses their currentOrganization
 * - Admin/superadmin: Uses themselves as tenant (req.user.id)
 * - Student/other users: Uses their primary organization
 * 
 * Applied to routes that need tenant-scoped data access
 */

const { User } = require("../models");

const tenantScope = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Extract tenantId based on user role
    if (req.user.userType === "teacher") {
      // ✅ Teachers: Use their currentOrganization
      const teacher = await User.findById(req.user.id).select("currentOrganization");
      req.tenantId = teacher?.currentOrganization;
    } else if (req.user.userType === "admin" || req.user.userType === "superadmin") {
      // Admin/superadmin: They ARE the tenant (from Tenant table)
      req.tenantId = req.user.id;
    } else {
      // Student or other user: Use first organization if available
      const user = await User.findById(req.user.id).select("organizations");
      req.tenantId = user?.organizations?.[0];
    }

    if (!req.tenantId) {
      return res.status(403).json({
        message: "Tenant context not available. User not assigned to any organization.",
        success: false,
      });
    }

    // Log tenant context for debugging
    // console.log(`[TenantScope] User ${req.user.id} scoped to tenant ${req.tenantId}`);

    next();
  } catch (error) {
    res.status(500).json({
      message: "Failed to set tenant scope",
      success: false,
      error: error.message,
    });
  }
};

module.exports = tenantScope;

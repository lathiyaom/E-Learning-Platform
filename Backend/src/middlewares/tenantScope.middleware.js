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

    // Tenant-table accounts (organization owner / superadmin) are their own tenant context.
    if (req.user.role === "tenant") {
      req.tenantId = req.user.id;
    } else if (req.user.userType === "teacher") {
      // ✅ Teachers: prefer currentOrganization, fallback to primary tenant
      const teacher = await User.findById(req.user.id).select("currentOrganization tenant_id organizations");
      req.tenantId =
        teacher?.currentOrganization ||
        teacher?.tenant_id ||
        teacher?.organizations?.[0];
    } else {
      // Student/admin user accounts from User table: use current org, then organization list, then primary tenant_id
      const user = await User.findById(req.user.id).select("currentOrganization organizations tenant_id");
      req.tenantId =
        user?.currentOrganization ||
        user?.organizations?.[0] ||
        user?.tenant_id;
    }

    if (!req.tenantId) {
      // For teachers without organization, allow access but set tenantId to null
      if (req.user.userType === "teacher") {
        req.tenantId = null;
      } else {
        return res.status(403).json({
          message: "Tenant context not available. User not assigned to any organization.",
          success: false,
        });
      }
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

const superAdminService = require("../services/superAdminService");
const { Tenant } = require("../models");

/**
 * SuperAdmin Controller — Platform-level operations
 * All routes using this controller must be protected with:
 *   authenticate → isTenantOwner → authorize("superadmin")
 */

// GET /SuperAdmin/Tenants — List all tenants with filters & pagination
const getAllTenants = async (req, res) => {
  try {
    const { status, userType, page = 1, limit = 10, search } = req.query;
    const result = await superAdminService.getAllTenants({ status, userType, page, limit, search });

    return res.status(200).json({
      message: "All tenants retrieved",
      success: true,
      data: result.tenants,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("SuperAdmin - Get all tenants error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// GET /SuperAdmin/Tenant/:id — Get one tenant with its users
const getTenantWithUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await superAdminService.getTenantWithUsers(id);

    return res.status(200).json({
      message: "Tenant details with users retrieved",
      success: true,
      data,
    });
  } catch (error) {
    console.error("SuperAdmin - Get tenant error:", error.message);
    return res
      .status(error.message === "Tenant not found" ? 404 : 400)
      .json({ message: error.message, success: false });
  }
};

// PATCH /SuperAdmin/Promote/:id — Promote tenant to superadmin
const promoteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ SECURITY: Cannot promote self (already superadmin)
    if (id === req.user.id) {
      return res.status(400).json({
        message: "You are already a superadmin",
        success: false,
      });
    }

    // ✅ Verify target is an admin (not already superadmin)
    const targetTenant = await Tenant.findById(id);
    if (!targetTenant) {
      return res.status(404).json({
        message: "Tenant not found",
        success: false,
      });
    }

    if (targetTenant.userType !== "admin") {
      return res.status(400).json({
        message: "Only admins can be promoted to superadmin",
        success: false,
      });
    }

    const tenant = await superAdminService.promoteTenant(id);

    return res.status(200).json({
      message: `${tenant.name} has been promoted to SuperAdmin`,
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("SuperAdmin - Promote error:", error.message);
    return res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message, success: false });
  }
};

// PATCH /SuperAdmin/Demote/:id — Demote superadmin back to admin
const demoteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ SECURITY: Prevent self-demotion
    if (id === req.user.id) {
      return res.status(403).json({
        message: "You cannot demote yourself. Contact another superadmin.",
        success: false,
      });
    }

    // ✅ Verify target is a superadmin
    const targetTenant = await Tenant.findById(id);
    if (!targetTenant) {
      return res.status(404).json({
        message: "Tenant not found",
        success: false,
      });
    }

    if (targetTenant.userType !== "superadmin") {
      return res.status(400).json({
        message: "Target is not a superadmin",
        success: false,
      });
    }

    // ✅ SECURITY: Prevent demoting last superadmin
    const superadminCount = await Tenant.countDocuments({ userType: "superadmin" });
    if (superadminCount <= 1) {
      return res.status(400).json({
        message: "Cannot demote the last superadmin in the system",
        success: false,
      });
    }

    const tenant = await superAdminService.demoteTenant(id, req.user.id);

    return res.status(200).json({
      message: `${tenant.name} has been demoted to Admin`,
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("SuperAdmin - Demote error:", error.message);
    return res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message, success: false });
  }
};

// PATCH /SuperAdmin/Status/:id — Change tenant status (active/inactive/suspended)
const changeTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ SECURITY: Prevent suspending self
    if (id === req.user.id && status === "suspended") {
      return res.status(403).json({
        message: "You cannot suspend yourself",
        success: false,
      });
    }

    // ✅ Validate status value
    if (!status || !["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Status is required (active, inactive, or suspended)",
        success: false,
      });
    }

    const tenant = await superAdminService.changeTenantStatus(id, status, req.user.id);

    return res.status(200).json({
      message: `${tenant.name} status changed to ${status}`,
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("SuperAdmin - Status change error:", error.message);
    return res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message, success: false });
  }
};

// GET /SuperAdmin/Users — All users across all tenants
const getAllUsers = async (req, res) => {
  try {
    const users = await superAdminService.getAllUsersAcrossPlatform();

    return res.status(200).json({
      message: "All platform users retrieved",
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("SuperAdmin - Get all users error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// GET /SuperAdmin/Stats — Platform dashboard stats
const getPlatformStats = async (req, res) => {
  try {
    const stats = await superAdminService.getPlatformStats();

    return res.status(200).json({
      message: "Platform statistics retrieved",
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("SuperAdmin - Stats error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// DELETE /SuperAdmin/Tenant/:id — Delete tenant and cascade delete users
const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await superAdminService.deleteTenant(id, req.user.id);

    return res.status(200).json({
      message: result.message,
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("SuperAdmin - Delete tenant error:", error.message);
    return res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message, success: false });
  }
};

// GET /SuperAdmin/Logs — Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, actorType } = req.query;
    const result = await superAdminService.getActivityLogs({ page, limit, action, actorType });

    return res.status(200).json({
      message: "Activity logs retrieved",
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("SuperAdmin - Get logs error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  getAllTenants,
  getTenantWithUsers,
  promoteTenant,
  demoteTenant,
  changeTenantStatus,
  getAllUsers,
  getPlatformStats,
  deleteTenant,
  getActivityLogs,
};

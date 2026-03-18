const superAdminService = require("../services/superAdminService");
const logger = require("../utils/logger");
const { Tenant } = require("../models");
const User = require("../models/User.mongoose");
const crypto = require("crypto");
const { sendTeacherInvitationEmail } = require("../utils/emailService");

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

// GET /SuperAdmin/users — All users across all tenants (paginated/filtered)
const getPlatformUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, roleFilter, statusFilter } = req.query;
    const result = await superAdminService.getPlatformUsers({
      page,
      limit,
      search,
      roleFilter: roleFilter || 'all',
      statusFilter: statusFilter || 'all'
    });

    return res.status(200).json({
      message: "Platform users retrieved successfully",
      success: true,
      ...result
    });
  } catch (error) {
    console.error("SuperAdmin - Get platform users error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal server error",
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

// GET /SuperAdmin/Users — All users across platform (paginated/filtered) - BACKWARD COMPATIBLE
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, roleFilter, statusFilter } = req.query;
    
    logger.info("SuperAdmin getAllUsers called", {
      page, limit, hasSearch: !!search, roleFilter, statusFilter,
      userId: req.user?.id
    });

    const result = await superAdminService.getPlatformUsers({
      page,
      limit,
      search,
      roleFilter: roleFilter || 'all',
      statusFilter: statusFilter || 'all'
    });

    return res.status(200).json({
      message: "Platform users retrieved successfully",
      success: true,
      ...result
    });
  } catch (error) {
    logger.error("SuperAdmin - Get all users error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal server error",
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

// GET /SuperAdmin/Organizations — Per-org overview with teacher & student counts
const getOrganizationsOverview = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const result = await superAdminService.getOrganizationsOverview({ status, page, limit, search });

    return res.status(200).json({
      message: "Organizations overview retrieved",
      success: true,
      data: result.organizations,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("SuperAdmin - Organizations overview error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// GET /SuperAdmin/Teachers — All teachers across platform with org info
const getAllTeachers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20, assignedOnly, available } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { userType: "teacher" };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (available === "true") filter.available_for_org = true;
    if (assignedOnly === "true") filter["organizations.0"] = { $exists: true };

    const total = await User.countDocuments(filter);
    const teachers = await User.find(filter)
      .select("-password -token -refreshToken -sessions -passwordResetToken")
      .populate("organizations", "name code institutionName")
      .populate("tenant_id", "name institutionName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      message: "All teachers retrieved",
      success: true,
      data: teachers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    logger.error("SuperAdmin - Get all teachers error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// POST /SuperAdmin/InviteTeacher — Invite teacher to an organization (sends email)
const inviteTeacherToOrg = async (req, res) => {
  try {
    const { teacherId, organizationId } = req.body;

    if (!teacherId || !organizationId) {
      return res.status(400).json({ message: "teacherId and organizationId are required", success: false });
    }

    // Verify teacher exists
    const teacher = await User.findOne({ _id: teacherId, userType: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found", success: false });
    }

    // Verify organization exists
    const organization = await Tenant.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found", success: false });
    }

    // Check if teacher is already in this organization
    const alreadyAssigned = teacher.organizations.some(
      (orgId) => orgId.toString() === organizationId
    );
    if (alreadyAssigned) {
      return res.status(400).json({
        message: "Teacher is already assigned to this organization",
        success: false,
      });
    }

    // Get superadmin info
    const superAdmin = await Tenant.findById(req.user.id);

    // Generate secure invitation token (48h expiry)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Store invitation on teacher
    teacher.pendingOrgInvitation = {
      token: hashedToken,
      organizationId,
      invitedBy: req.user.id,
      expiresAt,
    };
    await teacher.save({ validateBeforeSave: false });

    // Build accept/reject links
    const frontendUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL_DEV || "http://localhost:3000";
    const acceptLink = `${frontendUrl}/teacher/invitation/${rawToken}/accept`;
    const rejectLink = `${frontendUrl}/teacher/invitation/${rawToken}/reject`;

    // Send invitation email
    await sendTeacherInvitationEmail({
      email: teacher.email,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      organizationName: organization.institutionName || organization.name,
      adminName: superAdmin?.name || "Super Admin",
      acceptLink,
      rejectLink,
    });

    logger.info("Teacher invitation sent", {
      teacherId,
      organizationId,
      invitedBy: req.user.id,
    });

    return res.status(200).json({
      message: `Invitation sent to ${teacher.email}`,
      success: true,
      data: { teacherId, organizationId, expiresAt },
    });
  } catch (error) {
    logger.error("SuperAdmin - Invite teacher error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// GET /SuperAdmin/TeacherInvitation/:token/accept — Teacher accepts invitation
const acceptTeacherInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const teacher = await User.findOne({
      "pendingOrgInvitation.token": hashedToken,
      "pendingOrgInvitation.expiresAt": { $gt: new Date() },
    });

    if (!teacher) {
      return res.status(400).json({
        message: "Invalid or expired invitation token",
        success: false,
      });
    }

    const { organizationId } = teacher.pendingOrgInvitation;
    const organization = await Tenant.findById(organizationId);

    // Assign teacher to organization (if not already)
    if (!teacher.organizations.includes(organizationId)) {
      teacher.organizations.push(organizationId);
      if (!teacher.currentOrganization) {
        teacher.currentOrganization = organizationId;
      }
    }
    teacher.available_for_org = false;

    // Clear invitation
    teacher.pendingOrgInvitation = { token: null, organizationId: null, invitedBy: null, expiresAt: null };
    await teacher.save({ validateBeforeSave: false });

    const orgName = organization?.institutionName || organization?.name || "the organization";

    // Redirect to frontend with success message
    const frontendUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL_DEV || "http://localhost:3000";
    return res.redirect(`${frontendUrl}/teacher/invitation-result?status=accepted&org=${encodeURIComponent(orgName)}`);
  } catch (error) {
    logger.error("Accept invitation error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// GET /SuperAdmin/TeacherInvitation/:token/reject — Teacher rejects invitation
const rejectTeacherInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const teacher = await User.findOne({
      "pendingOrgInvitation.token": hashedToken,
    });

    if (!teacher) {
      return res.status(400).json({ message: "Invalid invitation token", success: false });
    }

    // Clear invitation
    teacher.pendingOrgInvitation = { token: null, organizationId: null, invitedBy: null, expiresAt: null };
    await teacher.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL_DEV || "http://localhost:3000";
    return res.redirect(`${frontendUrl}/teacher/invitation-result?status=rejected`);
  } catch (error) {
    logger.error("Reject invitation error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
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
  getOrganizationsOverview,
  deleteTenant,
  getActivityLogs,
  getAllTeachers,
  inviteTeacherToOrg,
  acceptTeacherInvitation,
  rejectTeacherInvitation,
};

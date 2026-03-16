const { Tenant, User } = require("../models");

/**
 * SuperAdmin Service — Platform-level operations
 * Only superadmins (from tenants table with userType: "superadmin") can use these
 */

// Helper function to log activity
const logActivity = async (actorId, actorType, action, targetId, metadata = {}) => {
  try {
    const { ActivityLog } = require("../models");
    await ActivityLog.create({
      actorId,
      actorType,
      action,
      targetId,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};

// Get all tenants with filters & pagination
const getAllTenants = async (filters = {}) => {
  const { status, userType, page = 1, limit = 10, search } = filters;
  const query = {};

  if (status) query.status = status;
  if (userType) query.userType = userType;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { OrgOwnerName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Tenant.countDocuments(query);
  
  const tenants = await Tenant.find(query)
    .select("-password -token -refreshToken")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const tenantIds = tenants.map((tenant) => tenant._id);
  const userCounts = await User.aggregate([
    { $match: { tenant_id: { $in: tenantIds } } },
    { $group: { _id: "$tenant_id", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    userCounts.map((entry) => [entry._id.toString(), entry.count])
  );

  const tenantsWithCounts = tenants.map((tenant) => {
    const tenantObj = tenant.toObject();
    tenantObj.userCount = countMap.get(tenant._id.toString()) || 0;
    return tenantObj;
  });

  return {
    tenants: tenantsWithCounts,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

// Get tenant details with their users
const getTenantWithUsers = async (tenantId) => {
  if (!tenantId) throw new Error("Tenant ID is required");

  const tenant = await Tenant.findById(tenantId)
    .select("-password -token -refreshToken");
  if (!tenant) throw new Error("Tenant not found");

  const users = await User.find({ tenant_id: tenantId })
    .select("-password -token -refreshToken")
    .sort({ createdAt: -1 });

  return { tenant, users };
};

// Promote a tenant to superadmin
const promoteTenant = async (tenantId, actorId) => {
  if (!tenantId) throw new Error("Tenant ID is required");

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error("Tenant not found");

  if (tenant.userType === "superadmin") {
    throw new Error("This tenant is already a superadmin");
  }

  const oldType = tenant.userType;
  tenant.userType = "superadmin";
  await tenant.save();

  // Log activity
  await logActivity(actorId, "tenant", "promoted_tenant", tenantId, {
    from: oldType,
    to: "superadmin",
  });

  const tenantObj = tenant.toObject();
  delete tenantObj.password;
  delete tenantObj.token;
  delete tenantObj.refreshToken;

  return tenantObj;
};

// Demote a superadmin back to admin
const demoteTenant = async (tenantId, requesterId) => {
  if (!tenantId) throw new Error("Tenant ID is required");

  if (tenantId === requesterId) {
    throw new Error("You cannot demote yourself");
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error("Tenant not found");

  if (tenant.userType !== "superadmin") {
    throw new Error("This tenant is not a superadmin");
  }

  // Safety: ensure at least one superadmin remains
  const superadminCount = await Tenant.countDocuments({
    userType: "superadmin",
  });
  if (superadminCount <= 1) {
    throw new Error("Cannot demote the last superadmin. Platform needs at least one.");
  }

  tenant.userType = "admin";
  await tenant.save();

  // Log activity
  await logActivity(requesterId, "tenant", "demoted_tenant", tenantId, {
    from: "superadmin",
    to: "admin",
  });

  const tenantObj = tenant.toObject();
  delete tenantObj.password;
  delete tenantObj.token;
  delete tenantObj.refreshToken;

  return tenantObj;
};

// Change tenant status (activate / deactivate / suspend)
const changeTenantStatus = async (tenantId, status, requesterId) => {
  if (!tenantId) throw new Error("Tenant ID is required");
  if (!["active", "inactive", "suspended"].includes(status)) {
    throw new Error("Invalid status. Must be: active, inactive, or suspended");
  }

  if (tenantId === requesterId) {
    throw new Error("You cannot change your own status");
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error("Tenant not found");

  // Don't allow suspending another superadmin
  if (tenant.userType === "superadmin" && status !== "active") {
    throw new Error("Cannot suspend or deactivate another superadmin. Demote them first.");
  }

  const oldStatus = tenant.status;
  tenant.status = status;
  await tenant.save();

  // If suspended/deactivated, clear their tokens (force logout)
  if (status !== "active") {
    tenant.token = null;
    tenant.refreshToken = null;
    await tenant.save();
  }

  // Log activity
  await logActivity(requesterId, "tenant", "changed_tenant_status", tenantId, {
    from: oldStatus,
    to: status,
  });

  const tenantObj = tenant.toObject();
  delete tenantObj.password;
  delete tenantObj.token;
  delete tenantObj.refreshToken;

  return tenantObj;
};

// Get all users across all tenants (platform-wide view)
const getAllUsersAcrossPlatform = async () => {
  const users = await User.find()
    .select("-password -token -refreshToken")
    .sort({ createdAt: -1 });
  return users;
};

// Get platform dashboard stats
const getPlatformStats = async () => {
  const totalOrganizations = await Tenant.countDocuments({ userType: "admin" });
  const activeOrganizations = await Tenant.countDocuments({ userType: "admin", status: "active" });
  const suspendedOrganizations = await Tenant.countDocuments({ userType: "admin", status: "suspended" });
  const inactiveOrganizations = await Tenant.countDocuments({ userType: "admin", status: "inactive" });

  const totalUsers = await User.countDocuments();
  const studentCount = await User.countDocuments({ userType: "student" });
  const teacherCount = await User.countDocuments({ userType: "teacher" });

  let totalCourses = 0;
  try {
    const { Course } = require("../models");
    totalCourses = await Course.countDocuments();
  } catch (_) {}

  return {
    organizations: {
      total: totalOrganizations,
      active: activeOrganizations,
      suspended: suspendedOrganizations,
      inactive: inactiveOrganizations,
    },
    users: {
      total: totalUsers,
      students: studentCount,
      teachers: teacherCount,
    },
    courses: {
      total: totalCourses,
    },
  };
};

// Get per-organization overview: name, status, teacher count, student count
const getOrganizationsOverview = async (filters = {}) => {
  const { status, page = 1, limit = 10, search } = filters;

  const query = { userType: "admin" };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { OrgOwnerName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Tenant.countDocuments(query);

  const organizations = await Tenant.find(query)
    .select("name email OrgOwnerName OrgOwnerEmail phoneNo status createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const orgIds = organizations.map((o) => o._id);

  // Aggregate teacher and student counts per org in one query
  const userCounts = await User.aggregate([
    { $match: { tenant_id: { $in: orgIds } } },
    {
      $group: {
        _id: { tenant_id: "$tenant_id", userType: "$userType" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Build lookup map: orgId -> { teachers, students }
  const countMap = {};
  for (const entry of userCounts) {
    const id = entry._id.tenant_id.toString();
    if (!countMap[id]) countMap[id] = { teachers: 0, students: 0 };
    if (entry._id.userType === "teacher") countMap[id].teachers = entry.count;
    if (entry._id.userType === "student") countMap[id].students = entry.count;
  }

  const overview = organizations.map((org) => {
    const counts = countMap[org._id.toString()] || { teachers: 0, students: 0 };
    return {
      id: org._id,
      name: org.name,
      email: org.email,
      ownerName: org.OrgOwnerName,
      ownerEmail: org.OrgOwnerEmail,
      phone: org.phoneNo,
      status: org.status,
      teachers: counts.teachers,
      students: counts.students,
      totalUsers: counts.teachers + counts.students,
      joinedAt: org.createdAt,
    };
  });

  return {
    organizations: overview,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

// Delete tenant and cascade delete all users
const deleteTenant = async (tenantId, requesterId) => {
  if (!tenantId) throw new Error("Tenant ID is required");

  if (tenantId === requesterId) {
    throw new Error("You cannot delete yourself");
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error("Tenant not found");

  // Don't allow deleting a superadmin
  if (tenant.userType === "superadmin") {
    throw new Error("Cannot delete a superadmin. Demote them first.");
  }

  // Count users under this tenant
  const userCount = await User.countDocuments({ tenant_id: tenantId });

  // Delete all users under this tenant (cascade)
  await User.deleteMany({ tenant_id: tenantId });

  // Delete the tenant
  await Tenant.findByIdAndDelete(tenantId);

  // Log activity
  await logActivity(requesterId, "tenant", "deleted_tenant", tenantId, {
    tenantName: tenant.name,
    usersDeleted: userCount,
  });

  return {
    message: `Tenant ${tenant.name} and ${userCount} associated users deleted successfully`,
    deletedTenant: tenant.name,
    deletedUsers: userCount,
  };
};

// Get activity logs with pagination
const getActivityLogs = async (filters = {}) => {
  try {
    const { ActivityLog } = require("../models");
    const { page = 1, limit = 50, action, actorType } = filters;
    const query = {};

    if (action) query.action = action;
    if (actorType) query.actorType = actorType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ActivityLog.countDocuments(query);

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("actorId", "name email OrgOwnerName OrgOwnerEmail firstName lastName")
      .populate("targetId", "name email OrgOwnerName OrgOwnerEmail firstName lastName");

    return {
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  } catch (error) {
    // If ActivityLog model doesn't exist yet, return empty
    return {
      logs: [],
      pagination: { total: 0, page: 1, limit: 50, pages: 0 },
    };
  }
};

module.exports = {
  getAllTenants,
  getTenantWithUsers,
  promoteTenant,
  demoteTenant,
  changeTenantStatus,
  getAllUsersAcrossPlatform,
  getPlatformStats,
  getOrganizationsOverview,
  deleteTenant,
  getActivityLogs,
};

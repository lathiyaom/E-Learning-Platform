const userService = require("../services/userService");
const logger = require("../utils/logger");
const { Tenant } = require("../models");

const getPlatformTenant = async () => {
  const platformEmail = process.env.SUPERADMIN_EMAIL || "superadmin@gmail.com";
  const platformTenant = await Tenant.findOne({
    $or: [{ userType: "superadmin" }, { email: platformEmail }],
  });

  if (!platformTenant) {
    throw new Error("Platform owner account not initialized");
  }

  return platformTenant;
};
// Create user — public signup (students only)
const CreateUser = async (req, res) => {
  const startTime = Date.now();
  const { email, userType, organizationCode } = req.body;

  try {
    logger.info("User creation attempt", { email, userType, organizationCode });

    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("User creation failed: Empty request body", { email });
      return res.status(400).json({
        message: "Request body is empty or not properly parsed",
        success: false,
      });
    }

    const { userType: reqUserType, organizationCode: orgCode, ...otherData } = req.body;

    // SECURITY: Only allow students and teachers on public signup
    if (reqUserType && !["student", "teacher"].includes(reqUserType)) {
      logger.logSecurity("Unauthorized user type creation attempt", "medium", {
        email,
        attemptedUserType: reqUserType,
        ip: req.ip,
      });
      return res.status(403).json({
        message: "Invalid role. Only students and teachers can self-register. Admins must be created by authorized users.",
        success: false,
      });
    }

    // Students and teachers can either join by organization code
    // or register as platform-level individual users.
    let userData = {
      ...otherData,
      userType: reqUserType || "student",
    };

    if (orgCode) {
      const organization = await Tenant.findOne({
        $or: [{ code: orgCode }, { email: orgCode }],
      });

      if (!organization) {
        logger.warn("Registration failed: Invalid organization code", {
          email,
          organizationCode: orgCode,
        });
        return res.status(404).json({
          message: "Invalid organization code. Please contact your organization admin.",
          success: false,
        });
      }

      userData.tenant_id = organization._id;
      userData.organizations = [organization._id];
      userData.currentOrganization = organization._id;

      logger.debug("User assigned to organization", {
        email,
        organizationId: organization._id,
        organizationName: organization.name,
        userType: userData.userType,
      });
    } else {
      try {
        const platformTenant = await getPlatformTenant();
        userData.tenant_id = platformTenant._id;

        // Keep individual teachers unassigned so org admins can assign them.
        if (userData.userType === "teacher") {
          userData.organizations = [];
          userData.currentOrganization = null;
        } else {
          // Individual students live under platform tenant context.
          userData.organizations = [platformTenant._id];
          userData.currentOrganization = platformTenant._id;
        }

        logger.info("Assigned individual signup to platform tenant", {
          email,
          tenantId: platformTenant._id,
          tenantName: platformTenant.name,
          userType: userData.userType,
        });
      } catch (tenantError) {
        logger.error("Failed to resolve platform tenant for signup", tenantError, { email });
        return res.status(500).json({
          message: "Platform owner not initialized. Please contact support.",
          success: false,
          error: tenantError.message,
        });
      }
    }

    const newUser = await userService.createUser(userData);
    
    const duration = Date.now() - startTime;
    logger.logSuccess("User created", newUser.id, { 
      email: newUser.email,
      userType: newUser.userType,
      duration: `${duration}ms`
    });

    return res.status(201).json({
      message: "Account created successfully",
      success: true,
      user: newUser,
    });
  } catch (error) {
    logger.logFailure("User creation", email, error, { userType });
    return res.status(400).json({
      message: error.message || "Account creation failed",
      success: false,
    });
  }
};

const getuserDetails = async (req, res) => {
  try {
    const { email } = req.params;
    const requesterId = req.user?.id;

    logger.debug("Get user details request", { email, requesterId });

    if (!req.user) {
      logger.warn("Get user details failed: No authentication", { email });
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const requesterEmail = req.user.email?.toLowerCase();
    const requestedEmail = email?.toLowerCase();

    // Only allow self-lookup, except for platform superadmins
    if (req.user.userType !== "superadmin" && requesterEmail !== requestedEmail) {
      logger.logSecurity("Unauthorized user details access attempt", "medium", { 
        requesterId,
        requesterEmail,
        requestedEmail 
      });
      return res.status(403).json({
        message: "Access denied. You can only view your own details.",
        success: false,
      });
    }

    const user = await userService.getUserDetails(email);
    
    logger.logSuccess("User details retrieved", requesterId, { email });

    res.status(200).json({
      message: "User found",
      success: true,
      user,
    });
  } catch (error) {
    logger.logFailure("Get user details", req.user?.id, error, { email: req.params.email });
    return res.status(error.message === "User not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const tenantId = req.tenantId;

    logger.info("Get all users request", { requesterId, tenantId });

    // Pass tenantId for tenant-scoped queries
    const users = await userService.getAllUsers(tenantId);
    
    if (!users || users.length === 0) {
      logger.debug("No users found", { tenantId });
      return res.status(404).json({
        message: "No users found",
        success: false,
      });
    }

    logger.logSuccess("Users retrieved", requesterId, { 
      tenantId, 
      count: users.length 
    });

    res.status(200).json({
      message: "Users found",
      success: true,
      users,
    });
  } catch (error) {
    logger.logFailure("Get all users", req.user?.id, error, { tenantId: req.tenantId });
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const UpdateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;

    logger.info("User update attempt", { userId: id, requesterId });

    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("User update failed: Empty request body", { userId: id });
      return res.status(400).json({
        message: "You not send the data for Update",
        success: false,
      });
    }

    if (!req.user) {
      logger.warn("User update failed: No authentication", { userId: id });
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Allow users to update only their own profile,
    // tenant admins can update users within their tenant,
    // superadmins can update any user
    const isSelfUpdate = requesterId === id;
    const isSuperAdmin = req.user.userType === "superadmin";
    const isTenantAdmin = req.user.userType === "admin";

    // Get the user being updated to check tenant ownership
    const { User } = require("../models");
    const targetUser = await User.findById(id);
    
    if (!targetUser) {
      logger.warn("User update failed: User not found", { userId: id, requesterId });
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check tenant ownership for tenant admins
    const canUpdateTenantUser = isTenantAdmin && 
      req.user.tenantId && 
      targetUser.tenant_id && 
      req.user.tenantId.toString() === targetUser.tenant_id.toString();

    if (!isSelfUpdate && !isSuperAdmin && !canUpdateTenantUser) {
      logger.logSecurity("Unauthorized user update attempt", "high", { 
        requesterId,
        targetUserId: id,
        requesterType: req.user.userType 
      });
      return res.status(403).json({
        message: "Access denied. You can only update your own profile or users within your tenant.",
        success: false,
      });
    }

    // Block users from changing sensitive fields unless they are admin/superadmin
    const sensitiveFields = ['tenantId', 'tenant_id', 'userType'];
    const hasSensitiveFieldChange = sensitiveFields.some(field => req.body[field] !== undefined);
    
    if (hasSensitiveFieldChange && !isSuperAdmin && !isTenantAdmin) {
      logger.logSecurity("Attempt to modify sensitive fields", "high", { 
        requesterId,
        targetUserId: id,
        fields: Object.keys(req.body) 
      });
      return res.status(403).json({
        message: "Access denied. You cannot modify sensitive fields.",
        success: false,
      });
    }

    const updatedUser = await userService.updateUsers(id, req.body);

    logger.logSuccess("User updated", requesterId, { 
      targetUserId: id,
      updatedFields: Object.keys(req.body)
    });

    return res.status(200).json({
      message: "Your details have been successfully updated",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    logger.logFailure("User update", req.user?.id, error, { targetUserId: req.params.id });
    return res.status(error.message === "User not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const email = req.query?.email;
    const requesterId = req.user?.id;

    logger.info("User deletion attempt", { email, requesterId, tenantId: req.tenantId });

    if (!email) {
      logger.warn("User deletion failed: Missing email parameter", { requesterId });
      return res.status(400).json({
        message: "Email query parameter is required",
        success: false,
      });
    }

    const result = await userService.deleteUser(
      email,
      req.tenantId,
      req.user?.userType
    );

    logger.logSuccess("User deleted", requesterId, { 
      email,
      tenantId: req.tenantId 
    });

    return res.status(200).json({
      message: result.message,
      success: true,
    });
  } catch (error) {
    logger.logFailure("User deletion", req.user?.id, error, { 
      email: req.query?.email,
      tenantId: req.tenantId 
    });
    return res.status(error.message === "User not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  CreateUser,
  getuserDetails,
  getAllUsers,
  UpdateUsers,
  DeleteUser,
};


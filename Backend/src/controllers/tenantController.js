const tenantService = require("../services/tenantService");
const { Tenant } = require("../models");
const { generateTokens } = require("../utils/jwtHelper");
const logger = require("../utils/logger");

/**
 * Smart Registration:
 *  - If 0 tenants exist → public, creates superadmin (bootstrap)
 *  - If tenants exist → only accessible by superadmin (route-level middleware handles auth)
 */
const createTenant = async (req, res) => {
  const startTime = Date.now();
  const { email, name } = req.body;

  try {
    logger.info("Tenant registration attempt", { email, name });

    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("Tenant registration failed: Empty request body", { email });
      return res.status(400).json({
        message: "Request body is empty or not properly parsed",
        success: false,
      });
    }

    const tenantCount = await Tenant.countDocuments();
    const isFirstTenant = tenantCount === 0;

    logger.info(`Tenant registration mode: ${isFirstTenant ? "Bootstrap (first tenant)" : "Standard"}`, { 
      email,
      tenantCount 
    });

    const newTenant = await tenantService.createTenant(req.body);

    // Generate tokens so tenant is logged in after registration
    const tokens = generateTokens({
      id: newTenant.id,
      email: newTenant.email,
      userType: newTenant.userType,
      firstName: newTenant.name,
      lastName: "",
    });

    // Store tokens in DB (Mongoose)
    await Tenant.findByIdAndUpdate(newTenant._id, {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    // Set HTTP-only cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const isSuperAdmin = newTenant.userType === "superadmin";
    const duration = Date.now() - startTime;

    logger.logSuccess("Tenant registered", newTenant.id, { 
      email: newTenant.email,
      name: newTenant.name,
      userType: newTenant.userType,
      code: newTenant.code,
      isFirstTenant,
      duration: `${duration}ms`
    });

    return res.status(201).json({
      message: isSuperAdmin
        ? "Platform SuperAdmin created successfully. You are the platform owner."
        : `Organization registered successfully. Your organization code is: ${newTenant.code}. Share this code with students for registration.`,
      success: true,
      data: newTenant,
      organizationCode: newTenant.code, // ✅ Return code for student registration
      ...tokens,
    });
  } catch (error) {
    logger.logFailure("Tenant registration", email, error, { name });
    return res.status(400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

// Get tenant details by ID
const getTenantDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await tenantService.getTenantById(id);

    return res.status(200).json({
      message: "Tenant found",
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("Error fetching tenant:", error.message);
    return res.status(error.message === "Tenant not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

// Get all tenants
const getAllTenants = async (req, res) => {
  try {
    const tenants = await tenantService.getAllTenants();
    if (!tenants || tenants.length === 0) {
      return res.status(404).json({
        message: "No tenants found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Tenants found",
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error fetching tenants:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Update tenant
const updateTenant = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "No data sent for update",
        success: false,
      });
    }

    const { id } = req.params;
    const updatedTenant = await tenantService.updateTenant(id, req.body);

    return res.status(200).json({
      message: "Tenant updated successfully",
      success: true,
      data: updatedTenant,
    });
  } catch (error) {
    console.error("Error updating tenant:", error.message);
    return res.status(error.message === "Tenant not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

// PATCH /Tenant/AssignTeacher/:tenantId
const assignTeacherToTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { email, userId } = req.body || {};

    // Permission: allow superadmin or tenant owner
    const requesterIsSuperadmin = req.user?.userType === "superadmin";
    const requesterIsTenantOwner = req.user?.role === "tenant" && req.user?.id === tenantId;

    if (!requesterIsSuperadmin && !requesterIsTenantOwner) {
      return res.status(403).json({ message: "Access denied", success: false });
    }

    // Resolve user by email or userId
    const { User } = require("../models");
    let user = null;
    if (userId) user = await User.findById(userId);
    else if (email) user = await User.findOne({ email });
    else return res.status(400).json({ message: "userId or email is required", success: false });

    if (!user) return res.status(404).json({ message: "User not found", success: false });

    // Prevent reassigning across tenants unless superadmin
    if (user.tenant_id && user.tenant_id.toString() !== tenantId && !requesterIsSuperadmin) {
      return res.status(400).json({ message: "User already belongs to another tenant", success: false });
    }

    // Use service to perform assignment
    const tenantService = require("../services/tenantService");
    const updatedUser = await tenantService.assignTeacher(tenantId, user._id);

    return res.status(200).json({ message: "Teacher assigned to organization", success: true, data: updatedUser });
  } catch (error) {
    console.error("Assign teacher error:", error.message);
    return res.status(400).json({ message: error.message || "Internal server error", success: false });
  }
};

module.exports = {
  createTenant,
  getTenantDetails,
  updateTenant,
  assignTeacherToTenant,
};

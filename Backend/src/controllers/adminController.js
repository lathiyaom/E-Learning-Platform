const { User } = require("../models");
const userService = require("../services/userService");
const logger = require("../utils/logger");

// Get all users within the tenant's scope
const getMyUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      userType = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const tenantId = req.tenantId;
    const requesterId = req.user?.id;

    logger.info("Get tenant users request", { 
      requesterId, 
      tenantId, 
      page, 
      limit, 
      search, 
      status, 
      userType 
    });

    // Build filter criteria
    const filter = { tenant_id: tenantId };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (userType) {
      filter.userType = userType;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const safeSortFields = new Set(["firstName", "lastName", "email", "userType", "status", "createdAt"]);
    const normalizedSortBy = safeSortFields.has(String(sortBy)) ? String(sortBy) : "createdAt";
    const normalizedSortOrder = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
    
    const users = await User.find(filter)
      .select("-password -token -refreshToken")
      .sort({ [normalizedSortBy]: normalizedSortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("organizations", "name code");

    const total = await User.countDocuments(filter);

    logger.logSuccess("Tenant users retrieved", requesterId, { 
      tenantId, 
      count: users.length,
      total 
    });

    res.status(200).json({
      message: "Users retrieved successfully",
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalUsers: total,
          hasNext: Number(page) * Number(limit) < total,
          hasPrev: Number(page) > 1,
          pageSize: Number(limit),
          sortBy: normalizedSortBy,
          sortOrder: normalizedSortOrder === 1 ? "asc" : "desc",
        }
      }
    });
  } catch (error) {
    logger.logFailure("Get tenant users", req.user?.id, error, { tenantId: req.tenantId });
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get a specific user by ID (within tenant scope)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const user = await User.findOne({ _id: id, tenant_id: tenantId })
      .select("-password -token -refreshToken")
      .populate("organizations", "name code");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User retrieved successfully",
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Update a user (within tenant scope)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const updateData = req.body;

    // Find the user within tenant scope
    const user = await User.findOne({ _id: id, tenant_id: tenantId });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Block sensitive field modifications unless superadmin
    const sensitiveFields = ['tenant_id', 'userType'];
    const hasSensitiveFieldChange = sensitiveFields.some(field => updateData[field] !== undefined);
    
    if (hasSensitiveFieldChange && req.user.userType !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. You cannot modify sensitive fields.",
        success: false,
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-password -token -refreshToken");

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Suspend a user (within tenant scope)
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const user = await User.findOne({ _id: id, tenant_id: tenantId });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Prevent suspending other admins (only superadmin can do that)
    if (user.userType === "admin" && req.user.userType !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. You cannot suspend other admins.",
        success: false,
      });
    }

    // Prevent self-suspension
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        message: "Access denied. You cannot suspend yourself.",
        success: false,
      });
    }

    // Clear tokens to force logout
    user.token = null;
    user.refreshToken = null;
    user.status = "suspended";
    await user.save();

    res.status(200).json({
      message: "User suspended successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error suspending user:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Activate a user (within tenant scope)
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const user = await User.findOne({ _id: id, tenant_id: tenantId });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    user.status = "active";
    await user.save();

    res.status(200).json({
      message: "User activated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error activating user:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Delete a user (within tenant scope)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const user = await User.findOne({ _id: id, tenant_id: tenantId });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Prevent deleting other admins (only superadmin can do that)
    if (user.userType === "admin" && req.user.userType !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. You cannot delete other admins.",
        success: false,
      });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        message: "Access denied. You cannot delete yourself.",
        success: false,
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Create a new user (admin only)
const createUser = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userData = {
      ...req.body,
      tenant_id: tenantId,
    };

    // Ensure organizations array includes the tenant
    if (!userData.organizations) {
      userData.organizations = [tenantId];
    }
    userData.currentOrganization = tenantId;

    const newUser = await userService.createUser(userData);

    res.status(201).json({
      message: "User created successfully",
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(400).json({
      message: error.message || "User creation failed",
      success: false,
    });
  }
};

module.exports = {
  getMyUsers,
  getUserById,
  updateUser,
  suspendUser,
  activateUser,
  deleteUser,
  createUser,
};

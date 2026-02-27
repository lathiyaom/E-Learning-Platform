const userService = require("../services/userService");

// Create user — public signup (students only)
const CreateUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Request body is empty or not properly parsed",
        success: false,
      });
    }

    const { userType, organizationCode, ...otherData } = req.body;

    // ✅ SECURITY: Only allow students and teachers on public signup
    if (userType && !["student", "teacher"].includes(userType)) {
      return res.status(403).json({
        message: "Invalid role. Only students and teachers can self-register. Admins must be created by authorized users.",
        success: false,
      });
    }

    // ✅ For students, require organization code
    let userData = {
      ...otherData,
      userType: userType || "student",
    };

    // ✅ If student, assign to organization using code
    if (userData.userType === "student") {
      if (!organizationCode) {
        return res.status(400).json({
          message: "Organization code is required for student registration",
          success: false,
        });
      }

      // Find organization by code (you'll need to add 'code' field to Tenant model)
      const { Tenant } = require("../models");
      const organization = await Tenant.findOne({ 
        $or: [
          { code: organizationCode },
          { email: organizationCode } // Allow email as fallback
        ]
      });

      if (!organization) {
        return res.status(404).json({
          message: "Invalid organization code. Please contact your organization admin.",
          success: false,
        });
      }

      // Assign student to organization
      userData.organizations = [organization._id];
      userData.currentOrganization = organization._id;
    }

    const newUser = await userService.createUser(userData);

    return res.status(201).json({
      message: "Account created successfully",
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(400).json({
      message: error.message || "Account creation failed",
      success: false,
    });
  }
};

const getuserDetails = async (req, res) => {
  try {
    const { email } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const requesterEmail = req.user.email?.toLowerCase();
    const requestedEmail = email?.toLowerCase();

    // Only allow self-lookup, except for platform superadmins
    if (req.user.userType !== "superadmin" && requesterEmail !== requestedEmail) {
      return res.status(403).json({
        message: "Access denied. You can only view your own details.",
        success: false,
      });
    }

    const user = await userService.getUserDetails(email);

    res.status(200).json({
      message: "User found",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    return res.status(error.message === "User not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Pass tenantId for tenant-scoped queries
    const users = await userService.getAllUsers(req.tenantId);
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Users found",
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const UpdateUsers = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "You not send the data for Update",
        success: false,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const { id } = req.params;

    // Allow users to update only their own profile,
    // admins/superadmins can update any user profile (non-privileged fields only)
    const isSelfUpdate = req.user.id === id;
    const isAdminLike =
      req.user.userType === "admin" || req.user.userType === "superadmin";

    if (!isSelfUpdate && !isAdminLike) {
      return res.status(403).json({
        message: "Access denied. You cannot update other users.",
        success: false,
      });
    }

    const updatedUser = await userService.updateUsers(id, req.body);

    return res.status(200).json({
      message: "Your details have been successfully updated",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res.status(error.message === "User not found" ? 404 : 400).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const email = req.query?.email;
    if (!email) {
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

    return res.status(200).json({
      message: result.message,
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
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

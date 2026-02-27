const authService = require("../services/authService");
const { User, Tenant } = require("../models");
const bcrypt = require("bcryptjs");
const { generateTokens, verifyRefreshToken, generateAccessToken } = require("../utils/jwtHelper");

/**
 * Unified Login - Handles both Tenant (admin/superadmin) and User (student/teacher/admin)
 */
const CreateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    // Try Tenant first (org admin/superadmin)
    let account = await Tenant.findOne({ email });
    let isTenant = !!account;

    if (!account) {
      account = await User.findOne({ email });
    }

    if (!account) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Verify password
    const isValid = await account.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // ✅ SECURITY: Prevent double login (single session per user)
    if (account.token) {
      return res.status(403).json({
        message: "User already logged in. Please logout first.",
        success: false,
      });
    }

    // Generate tokens
    const tokenPayload = isTenant
      ? { id: account.id, email: account.email, userType: account.userType, firstName: account.name, lastName: "" }
      : { id: account.id, email: account.email, userType: account.userType, firstName: account.firstName, lastName: account.lastName };

    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    // Store tokens in database for validation
    account.token = accessToken;
    account.refreshToken = refreshToken;
    await account.save();

    // Set HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      data: {
        user: {
          id: account.id,
          email: account.email,
          userType: account.userType,
          firstName: isTenant ? account.name : account.firstName,
          lastName: isTenant ? "" : account.lastName,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "An error occurred during login",
      success: false,
    });
  }
};

const LogOutController = async (req, res) => {
  try {
    // ✅ SECURITY: Only authenticated user can logout
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required to logout",
        success: false,
      });
    }

    // Find account and clear tokens
    let account = await Tenant.findById(req.user.id);
    if (!account) {
      account = await User.findById(req.user.id);
    }

    if (account) {
      account.token = null;
      account.refreshToken = null;
      await account.save();
    }

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      message: "Logout failed",
      success: false,
    });
  }
};

const RefreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Refresh token required",
        success: false,
      });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
        success: false,
      });
    }

    // Find account and verify token matches database
    let account = await Tenant.findById(decoded.id);
    if (!account) {
      account = await User.findById(decoded.id);
    }

    if (!account || account.refreshToken !== token) {
      return res.status(401).json({
        message: "Token revoked. Please login again.",
        success: false,
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: account.id,
      email: account.email,
      userType: account.userType,
      firstName: account.firstName || account.name,
      lastName: account.lastName || "",
    });

    // Update database
    account.token = newAccessToken;
    await account.save();

    // Update cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(401).json({
      message: "Token refresh failed",
      success: false,
    });
  }
};

const GetMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.status(200).json({
      message: "Current user retrieved successfully",
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(404).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  CreateLogin,
  LogOutController,
  RefreshToken,
  GetMe,
};

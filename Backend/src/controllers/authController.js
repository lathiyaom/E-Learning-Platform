const authService = require("../services/authService");
const { User, Tenant } = require("../models");
const bcrypt = require("bcryptjs");
const { generateTokens, verifyRefreshToken, generateAccessToken } = require("../utils/jwtHelper");
const logger = require("../utils/logger");

/**
 * Unified Login - Handles both Tenant (admin/superadmin) and User (student/teacher/admin)
 */
const CreateLogin = async (req, res) => {
  const startTime = Date.now();
  const { email, password } = req.body;
  const ip = req.ip || req.connection?.remoteAddress;

  try {
    logger.info("Login attempt", { email, ip });

    if (!email || !password) {
      logger.warn("Login failed: Missing credentials", { email, ip });
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    // Try Tenant first (org admin/superadmin)
    let account = await Tenant.findOne({ email });
    let isTenant = !!account;
    let accountType = "tenant";

    if (!account) {
      account = await User.findOne({ email });
      accountType = "user";
    }

    if (!account) {
      logger.logAuth("login", email, false, { reason: "Account not found", ip });
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Check account status
    if (account.status === "suspended") {
      logger.logSecurity("Login attempt on suspended account", "high", { 
        email, 
        accountId: account.id, 
        ip 
      });
      return res.status(403).json({
        message: "Account suspended. Please contact support.",
        success: false,
      });
    }

    // Verify password
    const isValid = await account.comparePassword(password);
    if (!isValid) {
      logger.logAuth("login", email, false, { reason: "Invalid password", ip });
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // ✅ Allow multiple sessions for better UX
    // Clear existing tokens if present
    if (account.token) {
      logger.info("Clearing existing session for new login", { 
        email, 
        accountId: account.id, 
        ip 
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

    const duration = Date.now() - startTime;
    logger.logAuth("login", account.id, true, { 
      email, 
      userType: account.userType, 
      accountType,
      ip,
      duration: `${duration}ms`
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
    logger.logFailure("login", email, error, { ip });
    return res.status(500).json({
      message: "An error occurred during login",
      success: false,
    });
  }
};

const LogOutController = async (req, res) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  try {
    logger.info("Logout attempt", { userId, email });

    // ✅ SECURITY: Only authenticated user can logout
    if (!userId) {
      logger.warn("Logout failed: No authentication", { ip: req.ip });
      return res.status(401).json({
        message: "Authentication required to logout",
        success: false,
      });
    }

    // Find account and clear tokens
    let account = await Tenant.findById(userId);
    if (!account) {
      account = await User.findById(userId);
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

    logger.logAuth("logout", userId, true, { email });

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    logger.logFailure("logout", userId, error, { email });
    res.status(500).json({
      message: "Logout failed",
      success: false,
    });
  }
};

const RefreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const ip = req.ip || req.connection?.remoteAddress;

    logger.info("Token refresh attempt", { ip });

    if (!token) {
      logger.warn("Token refresh failed: No token provided", { ip });
      return res.status(401).json({
        message: "Refresh token required",
        success: false,
      });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      logger.warn("Token refresh failed: Invalid token", { ip });
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
      logger.logSecurity("Token refresh with revoked token", "medium", { 
        userId: decoded.id, 
        ip 
      });
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

    logger.logSuccess("Token refreshed", account.id, { 
      email: account.email,
      userType: account.userType 
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error("Token refresh error", error, { ip: req.ip });
    res.status(401).json({
      message: "Token refresh failed",
      success: false,
    });
  }
};

const GetMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    logger.debug("GetMe request", { userId });

    const user = await authService.getUserById(userId);
    
    logger.logSuccess("GetMe", userId, { email: user.email });

    res.status(200).json({
      message: "Current user retrieved successfully",
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    logger.logFailure("GetMe", req.user?.id, error);
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

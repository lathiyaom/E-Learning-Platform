const crypto = require("crypto");
const authService = require("../services/authService");
const { User, Tenant } = require("../models");
const { generateTokens, verifyRefreshToken, generateAccessToken } = require("../utils/jwtHelper");
const logger = require("../utils/logger");

const MAX_ACTIVE_SESSIONS = 10;

const buildUserPayload = (account, isTenant) => ({
  id: account.id,
  email: account.email,
  userType: account.userType,
  firstName: isTenant ? account.name : account.firstName,
  lastName: isTenant ? "" : account.lastName,
});

const addOrUpdateSession = (account, sid, accessToken, refreshToken = null) => {
  if (!Array.isArray(account.sessions)) {
    account.sessions = [];
  }

  const existing = account.sessions.find((session) => session.sid === sid);
  if (existing) {
    existing.accessToken = accessToken;
    if (refreshToken) existing.refreshToken = refreshToken;
    existing.lastUsedAt = new Date();
    existing.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  } else {
    account.sessions.push({
      sid,
      accessToken,
      refreshToken,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
    });
  }

  account.sessions = account.sessions
    .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))
    .slice(0, MAX_ACTIVE_SESSIONS);
};

const CreateLogin = async (req, res) => {
  const startTime = Date.now();
  const { email, password } = req.body;
  const ip = req.ip || req.connection?.remoteAddress;

  try {
    logger.info("Login attempt", { email, ip });

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    let account = await Tenant.findOne({ email });
    const isTenant = !!account;
    if (!account) {
      account = await User.findOne({ email });
    }

    if (!account) {
      logger.logAuth("login", email, false, { reason: "Account not found", ip });
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (account.status === "suspended") {
      return res.status(403).json({
        message: "Account suspended. Please contact support.",
        success: false,
      });
    }

    const isValid = await account.comparePassword(password);
    if (!isValid) {
      logger.logAuth("login", email, false, { reason: "Invalid password", ip });
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const sid = crypto.randomUUID();
    const tokenPayload = buildUserPayload(account, isTenant);
    const { accessToken, refreshToken } = generateTokens(tokenPayload, sid);

    // Keep legacy fields for backward compatibility while enabling multi-session auth.
    account.token = accessToken;
    account.refreshToken = refreshToken;
    addOrUpdateSession(account, sid, accessToken, refreshToken);
    await account.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.logAuth("login", account.id, true, {
      email,
      userType: account.userType,
      duration: `${Date.now() - startTime}ms`,
      sid,
    });

    return res.status(200).json({
      message: "Login successful",
      success: true,
      data: {
        user: tokenPayload,
        accessToken,
        refreshToken,
        sessionId: sid,
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
  const sid = req.user?.sessionId;

  try {
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required to logout",
        success: false,
      });
    }

    let account = await Tenant.findById(userId);
    if (!account) {
      account = await User.findById(userId);
    }

    if (account) {
      if (sid && Array.isArray(account.sessions)) {
        account.sessions = account.sessions.filter((session) => session.sid !== sid);
      } else {
        // Legacy fallback path
        account.sessions = [];
      }

      account.token = null;
      account.refreshToken = null;
      await account.save();
    }

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

    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    logger.logFailure("logout", userId, error, { sid });
    return res.status(500).json({
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

    let account = await Tenant.findById(decoded.id);
    if (!account) {
      account = await User.findById(decoded.id);
    }

    if (!account) {
      return res.status(401).json({
        message: "Token revoked. Please login again.",
        success: false,
      });
    }

    const sid = decoded.sid;
    const matchingSession =
      Array.isArray(account.sessions) &&
      sid &&
      account.sessions.find((session) => session.sid === sid && session.refreshToken === token);

    const legacyValid = account.refreshToken === token;

    if (!matchingSession && !legacyValid) {
      return res.status(401).json({
        message: "Token revoked. Please login again.",
        success: false,
      });
    }

    const newAccessToken = generateAccessToken({
      id: account.id,
      email: account.email,
      userType: account.userType,
      firstName: account.firstName || account.name,
      lastName: account.lastName || "",
      sid: sid || undefined,
    });

    account.token = newAccessToken;
    if (sid) {
      addOrUpdateSession(account, sid, newAccessToken, token);
    }
    await account.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error("Token refresh error", error, { ip: req.ip });
    return res.status(401).json({
      message: "Token refresh failed",
      success: false,
    });
  }
};

const GetMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user?.id);
    return res.status(200).json({
      message: "Current user retrieved successfully",
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(404).json({
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

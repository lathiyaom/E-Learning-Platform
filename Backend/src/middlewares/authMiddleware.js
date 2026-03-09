const { verifyAccessToken } = require("../utils/jwtHelper");
const { User, Tenant } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
        success: false,
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired token. Please login again.",
        success: false,
      });
    }

    // Try to find account in Tenant table first, then User table
    let account = await Tenant.findById(decoded.id).select("-password");
    let role = "tenant";

    if (!account) {
      account = await User.findById(decoded.id).select("-password");
      role = "user";
    }

    if (!account) {
      return res.status(401).json({
        message: "Session expired or token revoked. Please login again.",
        success: false,
      });
    }

    const sessionId = decoded.sid;
    const hasSessionToken =
      Array.isArray(account.sessions) &&
      sessionId &&
      account.sessions.some((session) => session.sid === sessionId && session.accessToken === token);

    // Check if session is expired
    let sessionExpired = false;
    if (hasSessionToken && sessionId) {
      const activeSession = account.sessions.find((session) => session.sid === sessionId);
      if (activeSession && activeSession.expiresAt <= new Date()) {
        sessionExpired = true;
        // Remove expired session
        account.sessions = account.sessions.filter((session) => session.sid !== sessionId);
        await account.save();
      }
    }

    const hasLegacyToken = account.token === token;

    // SECURITY: token must match an active session (or legacy token for backward compatibility)
    if ((!hasSessionToken || sessionExpired) && !hasLegacyToken) {
      return res.status(401).json({
        message: "Session expired or token revoked. Please login again.",
        success: false,
      });
    }

    if (hasSessionToken && !sessionExpired && sessionId) {
      const activeSession = account.sessions.find((session) => session.sid === sessionId);
      if (activeSession) {
        activeSession.lastUsedAt = new Date();
        await account.save();
      }
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      sessionId,
      role,
      ...(role === "user" && { tenantId: account.tenant_id }),
      ...(role === "tenant" && { tenantId: account.id }),
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Authentication failed",
      success: false,
    });
  }
};

/**
 * Role-based Authorization Middleware
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Convert to uppercase for case-insensitive comparison
    const userRole = req.user.userType?.toUpperCase();
    const allowed = allowedRoles.map((role) => role.toUpperCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to perform this action.",
        success: false,
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't block if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          userType: decoded.userType,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user data
    next();
  }
};

/**
 * Tenant Owner Middleware
 * Only allows accounts from the tenants table (not user-level admins)
 * Use this for actions like creating users under a tenant
 */
const isTenantOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }

  // role is set by authenticate middleware — "tenant" = from tenants table
  if (req.user.role !== "tenant") {
    return res.status(403).json({
      message: "Only organization owners can perform this action.",
      success: false,
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  isTenantOwner,
};

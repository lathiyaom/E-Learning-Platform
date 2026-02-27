/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 * Uses Double Submit Cookie pattern
 */

const crypto = require("crypto");

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // Generate token for subsequent requests
    const token = generateCSRFToken();
    res.locals.csrfToken = token;
    
    // Set token in cookie
    res.cookie("XSRF-TOKEN", token, {
      httpOnly: false, // JavaScript can read for form submission
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return next();
  }

  // For POST, PUT, DELETE, PATCH - validate token
  const tokenFromHeader = req.headers["x-csrf-token"];
  const tokenFromBody = req.body?._csrf;
  const tokenFromCookie = req.cookies["XSRF-TOKEN"];

  const token = tokenFromHeader || tokenFromBody;

  if (!token || !tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing",
      code: "CSRF_TOKEN_MISSING",
    });
  }

  // Verify token matches cookie
  if (token !== tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
      code: "CSRF_TOKEN_INVALID",
    });
  }

  next();
};

/**
 * Middleware to refresh CSRF token
 * Call this after successful operations to invalidate old token
 */
const refreshCSRFToken = (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    const newToken = generateCSRFToken();
    res.cookie("XSRF-TOKEN", newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.locals.csrfToken = newToken;
  }
  next();
};

module.exports = {
  csrfProtection,
  refreshCSRFToken,
  generateCSRFToken,
};

const jwt = require("jsonwebtoken");

// ✅ SECURITY: Fail fast if secrets not configured - NO DEFAULTS
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error("❌ FATAL: JWT secrets missing from environment variables");
  console.error("Set JWT_SECRET and JWT_REFRESH_SECRET (minimum 32 characters each)");
  process.exit(1);
}

if (JWT_SECRET.length < 32 || JWT_REFRESH_SECRET.length < 32) {
  console.error("❌ FATAL: JWT secrets must be at least 32 characters");
  process.exit(1);
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour (increased from 15 minutes)
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

/**
 * @param {Object} payload -
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * @param {Object} payload -
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Generate both tokens
 * @param {Object} user - User object from database
 * @param {string} [sessionId] - Unique session identifier for multi-session support
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user, sessionId = null) => {
  const sid = sessionId || `${user.id}-${Date.now()}`;
  const payload = {
    id: user.id,
    email: user.email,
    userType: user.userType,
    firstName: user.firstName,
    lastName: user.lastName,
    sid,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ id: user.id, email: user.email, sid }),
  };
};

/**
 * Verify Access Token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification (useful for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
};

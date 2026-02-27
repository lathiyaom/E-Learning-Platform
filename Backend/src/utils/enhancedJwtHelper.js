/**
 * Enhanced JWT Token Helper
 * Implements token rotation, blacklisting, and refresh logic
 * Security features:
 * - Token rotation on every refresh
 * - Token blacklist to invalidate old tokens
 * - Expiration tracking
 * - Secure token generation
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// In-memory token blacklist (Replace with Redis in production)
const tokenBlacklist = new Set();

/**
 * Generate JWT token with secure payload
 * @param {Object} payload - Data to encode
 * @param {string} secret - Secret key
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256", // Use HS256 for security
  });
};

/**
 * Generate unique token ID for rotation tracking
 * @returns {string} Unique token ID
 */
const generateTokenId = () => {
  return crypto.randomBytes(16).toString("hex");
};

/**
 * Create access and refresh token pair
 * @param {string} userId - User ID
 * @param {string} userType - User role
 * @param {number} tokenId - Token ID for rotation
 * @returns {Object} { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires }
 */
const createTokenPair = (userId, userType, tokenId = generateTokenId()) => {
  const accessTokenExpires = 3 * 24 * 60 * 60; // 3 days in seconds
  const refreshTokenExpires = 7 * 24 * 60 * 60; // 7 days in seconds

  const accessPayload = {
    id: userId,
    userType,
    type: "access",
    tokenId, // Include token ID for rotation tracking
    iat: Math.floor(Date.now() / 1000),
  };

  const refreshPayload = {
    id: userId,
    userType,
    type: "refresh",
    tokenId, // Same tokenId links access and refresh tokens
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = generateToken(
    accessPayload,
    process.env.JWT_SECRET,
    accessTokenExpires
  );

  const refreshToken = generateToken(
    refreshPayload,
    process.env.JWT_REFRESH_SECRET,
    refreshTokenExpires
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpires: Date.now() + accessTokenExpires * 1000,
    refreshTokenExpires: Date.now() + refreshTokenExpires * 1000,
    tokenId,
  };
};

/**
 * Rotate tokens (issue new pair, invalidate old pair)
 * @param {string} oldTokenId - Previous token ID
 * @param {string} userId - User ID
 * @param {string} userType - User role
 * @returns {Object} New token pair
 */
const rotateTokens = (oldTokenId, userId, userType) => {
  // Blacklist old tokens
  tokenBlacklist.add(oldTokenId);

  // Create new token pair with fresh tokenId
  return createTokenPair(userId, userType);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} secret - Secret key
 * @returns {Object|null} Decoded payload or null
 */
const verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);

    // Check if token is blacklisted
    if (tokenBlacklist.has(decoded.tokenId)) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification (use carefully)
 * @param {string} token - JWT token
 * @returns {Object|null}
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {Object} decoded - Decoded token
 * @returns {boolean}
 */
const isTokenExpired = (decoded) => {
  if (!decoded || !decoded.exp) return true;
  return Date.now() / 1000 > decoded.exp;
};

/**
 * Get seconds until token expiration
 * @param {Object} decoded - Decoded token
 * @returns {number} Seconds until expiration (or -1 if expired)
 */
const getTokenTTL = (decoded) => {
  if (!decoded || !decoded.exp) return -1;
  const secondsLeft = Math.floor(decoded.exp - Date.now() / 1000);
  return Math.max(-1, secondsLeft);
};

/**
 * Blacklist a token immediately
 * @param {string} tokenId - Token ID to blacklist
 */
const blacklistToken = (tokenId) => {
  tokenBlacklist.add(tokenId);
};

/**
 * Clear old blacklist entries (run periodically)
 * @param {number} maxAge - Max age in milliseconds
 */
const cleanupBlacklist = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  // In production with Redis, use EXPIREAT
  // For now, we keep all for safety
  console.log(`[Token Cleanup] Blacklist size: ${tokenBlacklist.size}`);
};

/**
 * Validate refresh token request
 * @param {string} refreshToken - Refresh token
 * @param {string} userId - Expected user ID
 * @returns {Object|null} Decoded data or null if invalid
 */
const validateRefreshToken = (refreshToken, userId) => {
  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded) {
      return null;
    }

    // Verify token type and user
    if (decoded.type !== "refresh" || decoded.id !== userId) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
};

module.exports = {
  generateToken,
  generateTokenId,
  createTokenPair,
  rotateTokens,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenTTL,
  blacklistToken,
  cleanupBlacklist,
  validateRefreshToken,
  extractTokenFromHeader,
};

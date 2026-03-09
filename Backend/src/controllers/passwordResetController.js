const passwordResetService = require("../services/passwordResetService");
const logger = require("../utils/logger");

/**
 * Request Password Reset
 * POST /auth/forgot-password
 * Body: { email }
 */
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const ip = req.ip || req.connection?.remoteAddress;

  try {
    logger.info("Password reset request initiated", { email, ip });

    // Validate email
    if (!email || email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get base URL from request or environment
    const baseUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL_DEV || "http://localhost:3000";

    // Call service
    const result = await passwordResetService.requestPasswordReset(email, baseUrl);

    // Return generic success message (don't reveal if email exists for security)
    res.status(200).json({
      success: result.success,
      message: result.message,
    });

    logger.info("Password reset request completed", { email, success: result.success });
  } catch (error) {
    logger.error("Password reset request failed", { email, error: error.message, ip });
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request. Please try again later.",
    });
  }
};

/**
 * Verify Reset Token
 * POST /auth/verify-reset-token
 * Body: { email, token }
 */
const verifyResetToken = async (req, res) => {
  const { email, token } = req.body;
  const ip = req.ip || req.connection?.remoteAddress;

  try {
    logger.info("Reset token verification initiated", { email, ip });

    // Validate input
    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: "Email and token are required",
      });
    }

    // Verify token
    const result = await passwordResetService.verifyResetToken(email, token);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      accountType: result.accountType,
    });

    logger.info("Reset token verified", { email, accountType: result.accountType });
  } catch (error) {
    logger.error("Token verification failed", { email, error: error.message, ip });
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the token",
    });
  }
};

/**
 * Reset Password
 * POST /auth/reset-password
 * Body: { email, token, newPassword, confirmPassword }
 */
const resetPassword = async (req, res) => {
  const { email, token, newPassword, confirmPassword } = req.body;
  const ip = req.ip || req.connection?.remoteAddress;

  try {
    logger.info("Password reset initiated", { email, ip });

    // Validate input
    if (!email || !token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Get base URL from request or environment
    const baseUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL_DEV || "http://localhost:3000";

    // Call service to reset password
    const result = await passwordResetService.resetPassword(
      email,
      token,
      newPassword,
      confirmPassword,
      baseUrl
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });

    logger.info("Password reset successful", { email });
  } catch (error) {
    logger.error("Password reset failed", { email, error: error.message, ip });
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password. Please try again.",
    });
  }
};

/**
 * Check Reset Token Validity
 * GET /auth/check-reset-token
 * Query: { email, token }
 */
const checkTokenValidity = async (req, res) => {
  const { email, token } = req.query;
  const ip = req.ip || req.connection?.remoteAddress;

  try {
    logger.info("Token validity check initiated", { email, ip });

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: "Email and token are required",
      });
    }

    const result = await passwordResetService.checkResetTokenValidity(email, token);

    res.status(200).json({
      success: result.valid,
      message: result.message,
      valid: result.valid,
    });

    logger.info("Token validity checked", { email, valid: result.valid });
  } catch (error) {
    logger.error("Token validity check failed", { email, error: error.message, ip });
    res.status(500).json({
      success: false,
      message: "An error occurred while checking the token",
      valid: false,
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  checkTokenValidity,
};
const crypto = require("crypto");
const { User, Tenant } = require("../models");
const {
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
} = require("../utils/emailService");
const logger = require("../utils/logger");

/**
 * Generate password reset token
 */
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  return { resetToken, hashedToken };
};

/**
 * Request password reset - Supports both Tenant (admin/superadmin) and User (student/teacher/admin)
 */
const requestPasswordReset = async (email, baseUrl) => {
  try {
    logger.info("Password reset requested", { email });

    // Try to find in Tenant first (for admin/superadmin)
    let account = await Tenant.findOne({ email: email.toLowerCase() });
    let accountType = "tenant";

    // If not found in Tenant, try User table
    if (!account) {
      account = await User.findOne({ email: email.toLowerCase() });
      accountType = "user";
    }

    if (!account) {
      logger.warn("Password reset requested for non-existent email", { email });
      // Don't reveal if email exists (security best practice)
      return {
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions.",
      };
    }

    // Check if account is suspended
    if (account.status === "suspended") {
      logger.warn("Password reset requested for suspended account", { email });
      return {
        success: false,
        message: "This account is suspended. Please contact support.",
      };
    }

    // Generate reset token
    const { resetToken, hashedToken } = generateResetToken();

    // Set token and expiry (1 hour)
    account.passwordResetToken = hashedToken;
    account.passwordResetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await account.save();

    // Prepare reset link
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Get user name for email
    const firstName = accountType === "tenant" ? account.name : account.firstName;

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, firstName, resetToken, resetLink);
    } catch (emailError) {
      logger.error("Failed to send password reset email", {
        email,
        error: emailError.message,
      });
      // Continue anyway - token is still valid in database
      // User can try again or use another method
    }

    logger.info("Password reset token generated and email sent", {
      email,
      accountType,
    });

    return {
      success: true,
      message:
        "Password reset instructions have been sent to your email. The link will expire in 1 hour.",
    };
  } catch (error) {
    logger.error("Password reset request failed", { email, error: error.message });
    throw error;
  }
};

/**
 * Verify reset token - Check if token is valid and not expired
 */
const verifyResetToken = async (email, token) => {
  try {
    logger.info("Verifying reset token", { email });

    if (!email || !token) {
      return {
        valid: false,
        message: "Email and token are required",
      };
    }

    // Hash the provided token to match the stored one
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Try to find in Tenant first
    let account = await Tenant.findOne({ email: email.toLowerCase() });
    let accountType = "tenant";

    if (!account) {
      account = await User.findOne({ email: email.toLowerCase() });
      accountType = "user";
    }

    if (!account) {
      logger.warn("Token verification failed: account not found", { email });
      return {
        valid: false,
        message: "Account not found",
      };
    }

    // Check if token matches and hasn't expired
    if (
      account.passwordResetToken !== hashedToken ||
      !account.passwordResetTokenExpiry ||
      account.passwordResetTokenExpiry < new Date()
    ) {
      logger.warn("Token verification failed: invalid or expired token", {
        email,
        tokenExists: !!account.passwordResetToken,
        tokenMatches: account.passwordResetToken === hashedToken,
        isExpired: account.passwordResetTokenExpiry < new Date(),
      });

      return {
        valid: false,
        message: "Invalid or expired reset token",
      };
    }

    logger.info("Token verification successful", { email, accountType });

    return {
      valid: true,
      accountType,
      message: "Token is valid",
    };
  } catch (error) {
    logger.error("Token verification failed", { email, error: error.message });
    throw error;
  }
};

/**
 * Reset password - Update password with valid reset token
 */
const resetPassword = async (email, token, newPassword, confirmPassword, baseUrl) => {
  try {
    logger.info("Reset password requested", { email });

    // Validate input
    if (!email || !token || !newPassword || !confirmPassword) {
      return {
        success: false,
        message: "All fields are required",
      };
    }

    // Check password match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match",
      };
    }

    // Validate password strength (at least 6 characters)
    if (newPassword.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters long",
      };
    }

    // Verify token first
    const tokenVerification = await verifyResetToken(email, token);
    if (!tokenVerification.valid) {
      return {
        success: false,
        message: tokenVerification.message,
      };
    }

    // Hash the provided token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find and update account
    let account;
    let accountType = tokenVerification.accountType;

    if (accountType === "tenant") {
      account = await Tenant.findOne({ email: email.toLowerCase() });
    } else {
      account = await User.findOne({ email: email.toLowerCase() });
    }

    if (!account || account.passwordResetToken !== hashedToken) {
      logger.warn("Password reset failed: account or token mismatch", { email });
      return {
        success: false,
        message: "Invalid reset token",
      };
    }

    // Set raw password; model pre-save hook hashes it exactly once.
    account.password = newPassword;
    account.passwordResetToken = null;
    account.passwordResetTokenExpiry = null;

    // Clear existing sessions (force re-login)
    account.token = null;
    account.refreshToken = null;

    await account.save();

    // Prepare login link
    const loginLink = `${baseUrl}/login`;

    // Get user name for email
    const firstName = accountType === "tenant" ? account.name : account.firstName;

    // Send password reset confirmation email
    try {
      await sendPasswordResetConfirmationEmail(email, firstName, loginLink);
    } catch (emailError) {
      logger.error("Failed to send password reset confirmation email", {
        email,
        error: emailError.message,
      });
      // Continue anyway - password is already updated
    }

    logger.info("Password reset successful", { email, accountType });

    return {
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    };
  } catch (error) {
    logger.error("Password reset failed", { email, error: error.message });
    throw error;
  }
};

/**
 * Check password reset token validity
 */
const checkResetTokenValidity = async (email, token) => {
  try {
    return await verifyResetToken(email, token);
  } catch (error) {
    logger.error("Check reset token validity failed", { email, error: error.message });
    return {
      valid: false,
      message: "Token verification failed",
    };
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  checkResetTokenValidity,
  generateResetToken,
};
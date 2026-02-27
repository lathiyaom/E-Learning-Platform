const { User, Tenant } = require("../models");

/**
 * Logout Controller - Clears JWT tokens and logs out user
 * ✅ SECURITY: Requires authentication - user can only logout themselves
 */
const LogOutController = async (req, res) => {
  try {
    // ✅ SECURITY: Only authenticated user can logout
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required to logout",
        success: false,
      });
    }

    // Find account (try Tenant first, then User)
    let account = await Tenant.findById(req.user.id);
    if (!account) {
      account = await User.findById(req.user.id);
    }

    if (!account) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Clear tokens in database
    account.token = null;
    account.refreshToken = null;
    await account.save();

    // Clear HTTP-only cookies
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
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = { LogOutController };

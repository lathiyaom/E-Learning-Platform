const bcrypt = require("bcryptjs");
const {
  generateTokens,
  verifyRefreshToken,
  generateAccessToken,
} = require("../utils/jwtHelper");

const { User } = require("../models");

/**
 * Login Controller - Authenticates user and issues JWT tokens
 * NOTE: This is legacy - use authController.CreateLogin for unified login
 */
const CreateLogin = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Request body is empty or not properly parsed",
      success: false,
    });
  }

  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Validate email format
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailFormat.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email",
        success: false,
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // ✅ SECURITY: Prevent double login
    if (user.token) {
      return res.status(403).json({
        message: "User already logged in. Please logout first.",
        success: false,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Store tokens in database
    user.token = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    // Set HTTP-only cookies for security
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

    // Send response with tokens
    return res.status(200).json({
      message: "Login successful",
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }\n};

/**
 * Refresh Token Controller - Issues new access token using refresh token
 */
const RefreshToken = async (req, res) => {
  try {
    // Get refresh token from cookies or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not provided",
        success: false,
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired refresh token. Please login again.",
        success: false,
      });
    }

    // Check if refresh token matches the one in database
    const user = await User.findOne({
      _id: decoded.id,
      token: refreshToken,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid refresh token. Please login again.",
        success: false,
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Set new access token cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/**
 * Get Current User - Returns authenticated user's data
 */
const GetCurrentUser = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    const user = await User.findById(req.user.id).select("-password -token");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = { CreateLogin, RefreshToken, GetCurrentUser };

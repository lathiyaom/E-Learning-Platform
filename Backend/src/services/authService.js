const { User, Tenant } = require("../models");
const bcrypt = require("bcryptjs");

/**
 * Unified login — checks Tenant table first, then User table.
 * This way both org admins and regular users use the same /Auth/Login endpoint.
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const { generateTokens } = require("../utils/jwtHelper");

  // 1) Try to find as Tenant (org admin / superadmin)
  const tenant = await Tenant.findOne({ email });
  if (tenant) {
    const isMatch = await tenant.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    if (tenant.status !== "active") {
      throw new Error("Your account has been suspended or deactivated. Contact support.");
    }

    const tokens = generateTokens({
      id: tenant.id,
      email: tenant.email,
      userType: tenant.userType,
      firstName: tenant.name,
      lastName: "",
    });

    tenant.token = tokens.accessToken;
    tenant.refreshToken = tokens.refreshToken;
    await tenant.save();

    return {
      ...tokens,
      user: {
        id: tenant.id,
        email: tenant.email,
        name: tenant.name,
        userType: tenant.userType,
        role: "tenant",
        isSuperAdmin: tenant.userType === "superadmin",
      },
    };
  }

  // 2) Try to find as User (student / teacher / admin)
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Account Not Found Please Create Account");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const tokens = generateTokens(user);

  user.token = tokens.accessToken;
  user.refreshToken = tokens.refreshToken;
  await user.save();

  // ✅ For teachers, populate organizations
  let userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    role: "user",
  };

  // If teacher, include organizations and current organization
  if (user.userType === "teacher") {
    await user.populate("organizations", "name email status");
    await user.populate("currentOrganization", "name email status");
    userData.organizations = user.organizations || [];
    userData.currentOrganization = user.currentOrganization;
  }

  return {
    ...tokens,
    user: userData,
  };
};

const logout = async (email) => {
  if (!email) throw new Error("something went wrong, Please Retry");

  // Try tenant first, then user
  const tenant = await Tenant.findOne({ email });
  if (tenant) {
    tenant.token = null;
    tenant.refreshToken = null;
    await tenant.save();
    return { success: true };
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("Account Not Found");

  user.token = null;
  user.refreshToken = null;
  await user.save();
  return { success: true };
};

const refreshToken = async (token) => {
  if (!token) throw new Error("Refresh token is required");

  const { verifyRefreshToken, generateTokens } = require("../utils/jwtHelper");
  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new Error("Invalid or expired refresh token");

  // Try tenant first, then user
  let account = await Tenant.findById(decoded.id);
  let isTenant = !!account;

  if (!account) {
    account = await User.findById(decoded.id);
  }

  if (!account || account.refreshToken !== token) {
    throw new Error("Invalid or revoked refresh token");
  }

  const tokenPayload = isTenant
    ? { id: account.id, email: account.email, userType: account.userType, firstName: account.name, lastName: "" }
    : account;

  const tokens = generateTokens(tokenPayload);

  account.token = tokens.accessToken;
  account.refreshToken = tokens.refreshToken;
  await account.save();

  return tokens;
};

const getUserById = async (id) => {
  // Try tenant first, then user
  let account = await Tenant.findById(id).select("-password");

  if (!account) {
    account = await User.findById(id).select("-password");
  }

  if (!account) throw new Error("Account not found");
  return account;
};

module.exports = {
  login,
  logout,
  refreshToken,
  getUserById,
};

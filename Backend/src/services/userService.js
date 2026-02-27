const { User } = require("../models");
const validators = require("../utils/validators");

const createUser = async (userData) => {
  const {
    userType,
    firstName,
    lastName,
    age,
    gender,
    phoneNo,
    email,
    password,
    confirmPassword,
    agreeTerms,
  } = userData;

  // Validate all required fields
  if (!userType || !firstName || !lastName || !age || !gender || !phoneNo || !email || !password || !confirmPassword) {
    throw new Error("All fields are required");
  }

  // Validate individual fields
  const emailValidation = validators.validateEmail(email);
  if (!emailValidation.valid) throw new Error(emailValidation.error);

  const phoneValidation = validators.validatePhone(phoneNo);
  if (!phoneValidation.valid) throw new Error(phoneValidation.error);

  const firstNameValidation = validators.validateName(firstName, "First name");
  if (!firstNameValidation.valid) throw new Error(firstNameValidation.error);

  const lastNameValidation = validators.validateName(lastName, "Last name");
  if (!lastNameValidation.valid) throw new Error(lastNameValidation.error);

  const ageValidation = validators.validateAge(age);
  if (!ageValidation.valid) throw new Error(ageValidation.error);

  // Validate password strength
  const passwordValidation = validators.validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(`${passwordValidation.error}: ${passwordValidation.errors.join("; ")}`);
  }

  const passwordMatchValidation = validators.validatePasswordMatch(password, confirmPassword);
  if (!passwordMatchValidation.valid) throw new Error(passwordMatchValidation.error);

  if (!agreeTerms) {
    throw new Error("Please accept the terms and conditions");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const newUser = await User.create({
    userType,
    firstName,
    lastName,
    age,
    gender,
    phoneNo,
    email,
    password,
    agreeTerms,
  });

  // Return user without password
  const userJSON = newUser.toObject();
  delete userJSON.password;

  return userJSON;
};

const getUserDetails = async (email) => {
  if (!email) throw new Error("Email parameter is required");

  // Return user without sensitive fields
  const user = await User.findOne({ email }).select("-password -refreshToken -token");
  if (!user) throw new Error("User not found");

  return user;
};

const getAllUsers = async (tenantId) => {
  if (!tenantId) throw new Error("Tenant ID required for user query");

  // Users are associated to organizations (tenants) via the organizations array
  const users = await User.find({ organizations: tenantId }).select("-password -refreshToken -token");
  return users;
};

const updateUsers = async (id, updateData) => {
  if (!id) throw new Error("User ID is required");

  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  const { firstName, lastName, age, gender, phoneNo, about } = updateData;

  if (about && about.length < 20) {
    throw new Error("Please Enter More Than 20 Characters In About");
  }

  if (phoneNo && !/^\d{10}$/.test(phoneNo)) {
    throw new Error("Phone number must be 10 digits");
  }

  if (firstName && firstName.length < 2) {
    throw new Error("First name must be at least 2 characters");
  }

  if (lastName && lastName.length < 2) {
    throw new Error("Last name must be at least 2 characters");
  }

  if (age && age < 15) {
    throw new Error("Age must be greater than 15");
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (age) user.age = age;
  if (gender) user.gender = gender;
  if (phoneNo) user.phoneNo = phoneNo;
  if (about) user.about = about;

  await user.save();

  const userJSON = user.toObject();
  delete userJSON.password;
  delete userJSON.refreshToken;
  delete userJSON.token;

  return userJSON;
};

/**
 * Delete user by email. For admin: only users in same tenant. For superadmin: any user.
 */
const deleteUser = async (email, requesterTenantId, requesterUserType) => {
  if (!email) throw new Error("Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // Superadmin can delete any user from User collection (not tenant accounts)
  if (requesterUserType === "superadmin") {
    await User.findByIdAndDelete(user._id);
    return { message: "User deleted successfully" };
  }

  // Admin can only delete users that belong to their organization
  const userOrgIds = (user.organizations || []).map((oid) => oid.toString());
  if (!requesterTenantId || !userOrgIds.includes(requesterTenantId.toString())) {
    throw new Error("You can only delete users from your organization");
  }

  await User.findByIdAndDelete(user._id);
  return { message: "User deleted successfully" };
};

module.exports = {
  createUser,
  getUserDetails,
  getAllUsers,
  updateUsers,
  deleteUser,
};

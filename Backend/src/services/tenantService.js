const { Tenant } = require("../models");

const createTenant = async (tenantData) => {
  const {
    name,
    phoneNo,
    OrgOwnerName,
    OrgOwnerEmail,
    OrgOwnerPhone,
    email,
    password,
    ConformPassword,
    agreeTerms,
    about,
  } = tenantData;

  // Required fields check
  if (
    !name ||
    !phoneNo ||
    !OrgOwnerName ||
    !OrgOwnerEmail ||
    !OrgOwnerPhone ||
    !email ||
    !password ||
    !ConformPassword
  ) {
    throw new Error("All fields are required");
  }

  // Check if tenant email already exists
  const existingTenant = await Tenant.findOne({ email });
  if (existingTenant) {
    throw new Error("Organization with this email already exists");
  }

  // Password validation
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  if (password !== ConformPassword) {
    throw new Error("Passwords do not match");
  }

  // Phone validation
  if (!/^\d{10}$/.test(phoneNo)) {
    throw new Error("Phone number must be 10 digits");
  }

  if (!/^\d{10}$/.test(OrgOwnerPhone)) {
    throw new Error("Owner phone number must be 10 digits");
  }

  // Email validation
  if (!email.includes("@") || !email.includes(".")) {
    throw new Error("Invalid email format");
  }

  if (!OrgOwnerEmail.includes("@") || !OrgOwnerEmail.includes(".")) {
    throw new Error("Invalid owner email format");
  }

  if (!agreeTerms) {
    throw new Error("Please accept the terms and conditions");
  }

  // Password hashing is handled by the model's beforeCreate hook
  // Do NOT hash here — the Tenant model hook does it automatically

  // Determine userType:
  // - If no tenants exist yet → first tenant becomes "superadmin" (bootstrap)
  // - If called by superadmin → create as "admin"
  // - Can be overridden via tenantData.userType for superadmin actions
  let assignedUserType = tenantData.userType || "admin";

  const tenantCount = await Tenant.countDocuments();
  if (tenantCount === 0) {
    assignedUserType = "superadmin"; // First ever tenant = platform owner
  }

  const newTenant = await Tenant.create({
    name,
    phoneNo,
    OrgOwnerName,
    OrgOwnerEmail,
    OrgOwnerPhone,
    email,
    password, // plain text — model hook hashes it
    userType: assignedUserType,
    agreeTerms,
    about: about || "",
  });

  // Return tenant without password
  const tenantJSON = newTenant.toObject();
  delete tenantJSON.password;

  return tenantJSON;
};

const getTenantById = async (id) => {
  if (!id) throw new Error("Tenant ID is required");

  const tenant = await Tenant.findById(id).select("-password");
  if (!tenant) throw new Error("Tenant not found");

  return tenant;
};

const getTenantByEmail = async (email) => {
  if (!email) throw new Error("Email is required");

  const tenant = await Tenant.findOne({ email }).select("-password");
  if (!tenant) throw new Error("Tenant not found");

  return tenant;
};

const getAllTenants = async () => {
  const tenants = await Tenant.find().select("-password");
  return tenants;
};

const updateTenant = async (id, updateData) => {
  if (!id) throw new Error("Tenant ID is required");

  const tenant = await Tenant.findById(id);
  if (!tenant) throw new Error("Tenant not found");

  const { name, phoneNo, OrgOwnerName, OrgOwnerEmail, OrgOwnerPhone, about } =
    updateData;

  if (about && about.length < 20) {
    throw new Error("Please enter more than 20 characters in About");
  }

  if (phoneNo && !/^\d{10}$/.test(phoneNo)) {
    throw new Error("Phone number must be 10 digits");
  }

  if (OrgOwnerPhone && !/^\d{10}$/.test(OrgOwnerPhone)) {
    throw new Error("Owner phone number must be 10 digits");
  }

  // Update fields
  if (name) tenant.name = name;
  if (phoneNo) tenant.phoneNo = phoneNo;
  if (OrgOwnerName) tenant.OrgOwnerName = OrgOwnerName;
  if (OrgOwnerEmail) tenant.OrgOwnerEmail = OrgOwnerEmail;
  if (OrgOwnerPhone) tenant.OrgOwnerPhone = OrgOwnerPhone;
  if (about) tenant.about = about;

  await tenant.save();

  const tenantJSON = tenant.toObject();
  delete tenantJSON.password;

  return tenantJSON;
};

const assignTeacher = async (tenantId, userId) => {
  const { User, Tenant } = require("../models");

  if (!tenantId) throw new Error("Tenant ID is required");
  if (!userId) throw new Error("User ID is required");

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error("Tenant not found");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Prevent assigning users already belonging to another tenant
  if (user.tenant_id && user.tenant_id.toString() !== tenantId)
    throw new Error("User already assigned to another organization");

  user.tenant_id = tenantId;
  user.organizations = Array.isArray(user.organizations)
    ? Array.from(new Set([...user.organizations.map((id) => id.toString()), tenantId]))
    : [tenantId];
  user.currentOrganization = tenantId;
  user.available_for_org = false;
  user.userType = "teacher";
  await user.save();

  const userJSON = user.toObject();
  delete userJSON.password;
  return userJSON;
};

module.exports = {
  createTenant,
  getTenantById,
  getTenantByEmail,
  getAllTenants,
  updateTenant,
  assignTeacher,
};

/**
 * Input Validation Utilities
 * Comprehensive validation functions for all data types
 */

const validator = require("validator");

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: "Email is required", error: "Email is required" };
  }
  if (!validator.isEmail(email)) {
    return { valid: false, message: "Invalid email format", error: "Invalid email format" };
  }
  return { valid: true };
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  const errors = [];
  if (!password) {
    return { valid: false, message: "Password is required", error: "Password is required", errors: ["Password is required"] };
  }
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (errors.length > 0) {
    return { valid: false, message: errors[0], error: errors.join("; "), errors };
  }
  return { valid: true };
};

/**
 * Validate name (first name, last name) - 2 to 50 chars
 */
const validateName = (value, fieldName) => {
  const r = validateLength(value, fieldName, 2, 50);
  return r.valid ? r : { ...r, error: r.message };
};

/**
 * Validate age (15-120)
 */
const validateAge = (age) => {
  const r = validateRange(age, "Age", 15, 120);
  return r.valid ? r : { ...r, error: r.message };
};

/**
 * Validate password match (password === confirmPassword)
 */
const validatePasswordMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return { valid: false, message: "Password and confirm password are required", error: "Password and confirm password are required" };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match", error: "Passwords do not match" };
  }
  return { valid: true };
};

/**
 * Validate phone number (flexible: 10 digits or E.164)
 */
const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: "Phone number is required", error: "Phone number is required" };
  }
  const cleanPhone = String(phone).replace(/[\s\-()]/g, "");
  if (/^\d{10}$/.test(cleanPhone)) return { valid: true };
  if (/^\+?[1-9]\d{9,14}$/.test(cleanPhone)) return { valid: true };
  return { valid: false, message: "Invalid phone number format (10 digits expected)", error: "Invalid phone number format" };
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (id) => {
  if (!id) {
    return { valid: false, message: "ID is required" };
  }
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return { valid: false, message: "Invalid ID format" };
  }
  return { valid: true };
};

/**
 * Validate required string field
 */
const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

/**
 * Validate string length
 */
const validateLength = (value, fieldName, min, max) => {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (value.length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  }
  if (max && value.length > max) {
    return { valid: false, message: `${fieldName} must not exceed ${max} characters` };
  }
  return { valid: true };
};

/**
 * Validate text length (value, min, max, fieldName) - alias for validateLength with error key
 */
const validateTextLength = (value, min, max, fieldName) => {
  const r = validateLength(value, fieldName, min, max);
  return r.valid ? r : { ...r, error: r.message };
};

/**
 * Validate number range
 */
const validateRange = (value, fieldName, min, max) => {
  if (value === undefined || value === null) {
    return { valid: false, message: `${fieldName} is required` };
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number` };
  }
  if (num < min) {
    return { valid: false, message: `${fieldName} must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { valid: false, message: `${fieldName} must not exceed ${max}` };
  }
  return { valid: true };
};

/**
 * Validate enum value
 */
const validateEnum = (value, fieldName, allowedValues) => {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (!allowedValues.includes(value)) {
    return { valid: false, message: `${fieldName} must be one of: ${allowedValues.join(", ")}` };
  }
  return { valid: true };
};

/**
 * Validate date format
 */
const validateDate = (date, fieldName) => {
  if (!date) {
    return { valid: false, message: `${fieldName} is required` };
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: `${fieldName} must be a valid date` };
  }
  return { valid: true };
};

/**
 * Validate time format (HH:MM)
 */
const validateTime = (time, fieldName) => {
  if (!time) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return { valid: false, message: `${fieldName} must be in HH:MM format` };
  }
  return { valid: true };
};

/**
 * Validate URL
 */
const validateURL = (url, fieldName) => {
  if (!url) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (!validator.isURL(url, { protocols: ["http", "https"], require_protocol: true })) {
    return { valid: false, message: `${fieldName} must be a valid URL` };
  }
  return { valid: true };
};

/**
 * Sanitize string input (prevent XSS)
 */
const sanitizeString = (str) => {
  if (!str) return str;
  return validator.escape(str.trim());
};

/**
 * Validate user registration data
 */
const validateUserRegistration = (data) => {
  const errors = [];

  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) errors.push(emailCheck.message);

  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) errors.push(passwordCheck.message);

  const firstNameCheck = validateLength(data.firstName, "First name", 2, 50);
  if (!firstNameCheck.valid) errors.push(firstNameCheck.message);

  const lastNameCheck = validateLength(data.lastName, "Last name", 2, 50);
  if (!lastNameCheck.valid) errors.push(lastNameCheck.message);

  const phoneCheck = validatePhone(data.phoneNo);
  if (!phoneCheck.valid) errors.push(phoneCheck.message);

  const userTypeCheck = validateEnum(data.userType, "User type", ["student", "teacher", "admin"]);
  if (!userTypeCheck.valid) errors.push(userTypeCheck.message);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate tenant registration data
 */
const validateTenantRegistration = (data) => {
  const errors = [];

  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) errors.push(emailCheck.message);

  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) errors.push(passwordCheck.message);

  const nameCheck = validateLength(data.name, "Organization name", 2, 100);
  if (!nameCheck.valid) errors.push(nameCheck.message);

  const phoneCheck = validatePhone(data.phoneNo);
  if (!phoneCheck.valid) errors.push(phoneCheck.message);

  const ownerNameCheck = validateLength(data.OrgOwnerName, "Owner name", 2, 100);
  if (!ownerNameCheck.valid) errors.push(ownerNameCheck.message);

  const ownerEmailCheck = validateEmail(data.OrgOwnerEmail);
  if (!ownerEmailCheck.valid) errors.push(ownerEmailCheck.message);

  const ownerPhoneCheck = validatePhone(data.OrgOwnerPhone);
  if (!ownerPhoneCheck.valid) errors.push(ownerPhoneCheck.message);

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate course creation data
 */
const validateCourseCreation = (data) => {
  const errors = [];

  const titleCheck = validateLength(data.title, "Title", 3, 200);
  if (!titleCheck.valid) errors.push(titleCheck.message);

  const descriptionCheck = validateLength(data.description, "Description", 10, 2000);
  if (!descriptionCheck.valid) errors.push(descriptionCheck.message);

  const categoryCheck = validateRequired(data.category, "Category");
  if (!categoryCheck.valid) errors.push(categoryCheck.message);

  if (data.videoUrl) {
    const urlCheck = validateURL(data.videoUrl, "Video URL");
    if (!urlCheck.valid) errors.push(urlCheck.message);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validation middleware factory
 */
const validate = (validationFn) => {
  return (req, res, next) => {
    const result = validationFn(req.body);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.errors,
      });
    }
    next();
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateAge,
  validatePasswordMatch,
  validateObjectId,
  validateRequired,
  validateLength,
  validateTextLength,
  validateRange,
  validateEnum,
  validateDate,
  validateTime,
  validateURL,
  sanitizeString,
  validateUserRegistration,
  validateTenantRegistration,
  validateCourseCreation,
  validate,
};

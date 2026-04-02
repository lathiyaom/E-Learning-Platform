const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      success: false,
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserSignup = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phoneNo')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('userType')
    .optional()
    .isIn(['student', 'teacher'])
    .withMessage('User type must be either student or teacher'),
  
  body('organizationCode')
    .optional()
    .trim(),
  
  handleValidationErrors
];

const validateAdminUserCreate = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('userType')
    .notEmpty()
    .withMessage('User type is required')
    .isIn(['student', 'teacher'])
    .withMessage('User type must be either student or teacher'),

  body('age')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be a valid number between 1 and 120'),

  body('gender')
    .optional({ nullable: true })
    .isIn(['male', 'female'])
    .withMessage('Gender must be either male or female'),

  body('phoneNo')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters'),

  body('about')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 250 })
    .withMessage('About section cannot exceed 250 characters'),

  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// User update validation
const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phoneNo')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('about')
    .optional()
    .isLength({ max: 500 })
    .withMessage('About section cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Tenant registration validation
const validateTenantRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  
  body('phoneNo')
    .trim()
    .notEmpty()
    .withMessage('Organization phone number is required')
    .matches(/^\d{10}$/)
    .withMessage('Organization phone number must be exactly 10 digits'),
  
  body('OrgOwnerName')
    .trim()
    .notEmpty()
    .withMessage('Organization owner name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Owner name must be between 2 and 100 characters'),
  
  body('OrgOwnerEmail')
    .trim()
    .notEmpty()
    .withMessage('Organization owner email is required')
    .isEmail()
    .withMessage('Owner email must be a valid email address'),
  
  body('OrgOwnerPhone')
    .trim()
    .notEmpty()
    .withMessage('Organization owner phone is required')
    .matches(/^\d{10}$/)
    .withMessage('Owner phone number must be exactly 10 digits'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Login email is required')
    .isEmail()
    .withMessage('Login email must be a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  
  body('ConformPassword')
    .trim()
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('agreeTerms')
    .isBoolean()
    .withMessage('You must agree to the terms and conditions')
    .custom((value) => {
      if (value !== true) {
        throw new Error('You must agree to the terms and conditions');
      }
      return true;
    }),
  
  body('about')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('About section cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// Course creation validation
const validateCourseCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Course description must be between 10 and 2000 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Course category is required'),
  
  body('pricing')
    .optional()
    .isIn(['free', 'paid'])
    .withMessage('Pricing must be either free or paid'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  handleValidationErrors
];

// Contact form validation
const validateContactForm = [
  body('fullname')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  handleValidationErrors
];

// ID parameter validation
const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Valid ID is required'),
  
  handleValidationErrors
];

// Email parameter validation
const validateEmailParam = [
  param('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  handleValidationErrors
];

module.exports = {
  validateUserSignup,
  validateAdminUserCreate,
  validateUserLogin,
  validateUserUpdate,
  validateTenantRegistration,
  validateCourseCreation,
  validateContactForm,
  validateIdParam,
  validateEmailParam,
  handleValidationErrors
};

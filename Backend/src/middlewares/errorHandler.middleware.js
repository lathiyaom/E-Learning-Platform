/**
 * Global Error Handler Middleware
 * Standardizes all error responses
 */

const logger = require("../utils/logger");

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error handler middleware (must be last)
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error in ${req.method} ${req.path}`, err, {
    userId: req.user?.id || "anonymous",
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = {};
  let code = err.code || "INTERNAL_ERROR";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    code = "VALIDATION_ERROR";
    errors = err.errors || {};
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "JWT_ERROR";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = "Resource already exists";
    code = "DUPLICATE_ENTRY";
    errors = err.errors?.map((e) => ({
      field: e.path,
      message: `${e.path} already exists`,
    })) || [];
  }

  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = "Validation failed";
    code = "VALIDATION_ERROR";
    errors = err.errors?.map((e) => ({
      field: e.path,
      message: e.message,
    })) || [];
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Invalid reference";
    code = "FOREIGN_KEY_ERROR";
  }

  if (err.name === "MulterError") {
    statusCode = 400;
    code = "UPLOAD_ERROR";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Uploaded file is too large";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected upload field";
    } else {
      message = err.message || "Upload failed";
    }
  }

  // Response format
  const response = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    ...(statusCode === 500 && { requestId: req.id }), // For debugging in production
    ...(Object.keys(errors).length > 0 && { errors }),
  };

  // Don't expose full error details in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    response.message = "An internal error occurred. Please try again later.";
  }

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper
 * Wraps route handlers to catch async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: "NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
};

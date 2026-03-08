const logger = require("../utils/logger");

/**
 * Request logging middleware
 * Logs all incoming requests and outgoing responses
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.info(`→ ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get("user-agent"),
    userId: req.user?.id || "anonymous",
    userType: req.user?.userType || "anonymous",
    tenantId: req.tenantId || req.user?.tenantId || null,
  });

  // Capture the original res.json to log responses
  const originalJson = res.json.bind(res);
  
  res.json = function (body) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Determine log level based on status code
    const logLevel = statusCode >= 500 ? "error" : 
                     statusCode >= 400 ? "warn" : 
                     "info";
    
    // Log response
    logger[logLevel](`← ${req.method} ${req.path} ${statusCode} (${duration}ms)`, {
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || "anonymous",
      success: body?.success !== undefined ? body.success : statusCode < 400,
    });
    
    return originalJson(body);
  };
  
  next();
};

/**
 * Error logging middleware
 * Logs unhandled errors
 */
const errorLogger = (err, req, res, next) => {
  logger.error(`Error in ${req.method} ${req.path}`, err, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    userId: req.user?.id || "anonymous",
    ip: req.ip || req.connection?.remoteAddress,
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger,
};

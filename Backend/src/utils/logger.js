/**
 * Logger utility
 * Provides structured logging for development and production
 */

const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
    this.logFile = path.join(logsDir, `${new Date().toISOString().split("T")[0]}.log`);
  }

  /**
   * Get formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    return {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...(Object.keys(meta).length > 0 && { meta }),
    };
  }

  /**
   * Write to file
   */
  writeToFile(level, message, meta = {}) {
    const logEntry = this.formatMessage(level, message, meta);
    const logString = JSON.stringify(logEntry) + "\n";

    fs.appendFileSync(this.logFile, logString);
  }

  /**
   * Console output (development only)
   */
  consoleOutput(level, message, meta = {}) {
    if (!this.isDevelopment) return;

    const colors = {
      ERROR: "\x1b[31m", // Red
      WARN: "\x1b[33m", // Yellow
      INFO: "\x1b[36m", // Cyan
      DEBUG: "\x1b[35m", // Magenta
      RESET: "\x1b[0m",
    };

    const color = colors[level] || colors.RESET;
    const timestamp = this.getTimestamp();
    console.log(
      `${color}[${timestamp}] [${level}]${colors.RESET} ${message}`,
      Object.keys(meta).length > 0 ? meta : ""
    );
  }

  /**
   * Error logging
   */
  error(message, error = null, meta = {}) {
    const errorMeta = error
      ? {
          ...meta,
          errorMessage: error.message,
          errorStack: error.stack,
          errorCode: error.code,
        }
      : meta;

    this.writeToFile(LOG_LEVELS.ERROR, message, errorMeta);
    this.consoleOutput(LOG_LEVELS.ERROR, message, errorMeta);
  }

  /**
   * Warning logging
   */
  warn(message, meta = {}) {
    this.writeToFile(LOG_LEVELS.WARN, message, meta);
    this.consoleOutput(LOG_LEVELS.WARN, message, meta);
  }

  /**
   * Info logging
   */
  info(message, meta = {}) {
    this.writeToFile(LOG_LEVELS.INFO, message, meta);
    this.consoleOutput(LOG_LEVELS.INFO, message, meta);
  }

  /**
   * Debug logging (development only)
   */
  debug(message, meta = {}) {
    if (!this.isDevelopment) return;
    this.writeToFile(LOG_LEVELS.DEBUG, message, meta);
    this.consoleOutput(LOG_LEVELS.DEBUG, message, meta);
  }

  /**
   * Log API request
   */
  logRequest(req, meta = {}) {
    this.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip || req.connection?.remoteAddress,
      userId: req.user?.id || "anonymous",
      userType: req.user?.userType || "anonymous",
      tenantId: req.tenantId || req.user?.tenantId || null,
      ...meta,
    });
  }

  /**
   * Log successful operation
   */
  logSuccess(operation, userId, meta = {}) {
    this.info(`✅ ${operation}`, {
      operation,
      userId,
      status: "success",
      ...meta,
    });
  }

  /**
   * Log failed operation
   */
  logFailure(operation, userId, error, meta = {}) {
    this.error(`❌ ${operation}`, error, {
      operation,
      userId,
      status: "failure",
      ...meta,
    });
  }

  /**
   * Log authentication events
   */
  logAuth(event, userId, success, meta = {}) {
    const message = `${success ? "✅" : "❌"} Auth: ${event}`;
    if (success) {
      this.info(message, { event, userId, success, ...meta });
    } else {
      this.warn(message, { event, userId, success, ...meta });
    }
  }

  /**
   * Log security events
   */
  logSecurity(event, severity, meta = {}) {
    const message = `🔒 Security: ${event}`;
    if (severity === "high") {
      this.error(message, null, { event, severity, ...meta });
    } else {
      this.warn(message, { event, severity, ...meta });
    }
  }

  /**
   * Log API response
   */
  logResponse(req, statusCode, meta = {}) {
    const level = statusCode >= 500 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    this.writeToFile(level, `${req.method} ${req.path} - ${statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode,
      userId: req.user?.id || "anonymous",
      ...meta,
    });
  }

  /**
   * Log database query
   */
  logQuery(query, duration, meta = {}) {
    if (!this.isDevelopment) return;
    this.debug(`DB Query (${duration}ms)`, {
      query,
      duration,
      ...meta,
    });
  }
}

module.exports = new Logger();

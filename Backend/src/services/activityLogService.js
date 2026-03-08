const { ActivityLog } = require("../models");

/**
 * Create an activity log entry
 * @param {Object} logData - The log data
 * @param {String} logData.actor_id - ID of the user performing the action
 * @param {String} logData.actor_type - Type of actor (admin, teacher, student, etc.)
 * @param {String} logData.tenant_id - ID of the tenant
 * @param {String} logData.action - Action performed
 * @param {String} logData.description - Human-readable description
 * @param {String} [logData.target_id] - ID of the target (if applicable)
 * @param {String} [logData.target_type] - Type of target (if applicable)
 * @param {Object} [logData.metadata] - Additional metadata
 * @param {String} [logData.ip_address] - IP address
 * @param {String} [logData.user_agent] - User agent
 * @param {String} [logData.status] - Status of the action (success, failure, warning)
 */
const createActivityLog = async (logData) => {
  try {
    const log = new ActivityLog({
      ...logData,
      createdAt: new Date(),
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating activity log:", error.message);
    // Don't throw error to avoid breaking main functionality
    return null;
  }
};

/**
 * Get activity logs with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Query options
 */
const getActivityLogs = async (filters = {}, options = {}) => {
  try {
    const {
      tenant_id,
      actor_id,
      action,
      target_type,
      status,
      startDate,
      endDate,
      search,
    } = filters;

    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Build query
    const query = {};

    if (tenant_id) query.tenant_id = tenant_id;
    if (actor_id) query.actor_id = actor_id;
    if (action) query.action = action;
    if (target_type) query.target_type = target_type;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const logs = await ActivityLog.find(query)
      .populate("actor_id", "firstName lastName email userType")
      .populate("tenant_id", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    return {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching activity logs:", error.message);
    throw error;
  }
};

/**
 * Get activity statistics
 * @param {String} tenant_id - Tenant ID for scoping
 * @param {Object} options - Additional options
 */
const getActivityStats = async (tenant_id, options = {}) => {
  try {
    const { startDate, endDate } = options;

    const matchStage = {};
    if (tenant_id) matchStage.tenant_id = tenant_id;
    
    // Date range
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await ActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          failure: {
            $sum: { $cond: [{ $eq: ["$status", "failure"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalLogs = await ActivityLog.countDocuments(matchStage);

    return {
      totalLogs,
      actionStats: stats,
    };
  } catch (error) {
    console.error("Error fetching activity stats:", error.message);
    throw error;
  }
};

/**
 * Delete old activity logs (for cleanup)
 * @param {Number} daysOld - Delete logs older than this many days
 */
const cleanupOldLogs = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`Cleaned up ${result.deletedCount} old activity logs`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up old logs:", error.message);
    throw error;
  }
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  getActivityStats,
  cleanupOldLogs,
};

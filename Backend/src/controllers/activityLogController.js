const activityLogService = require("../services/activityLogService");

// Get activity logs (SuperAdmin only)
const getActivityLogs = async (req, res) => {
  try {
    const filters = {
      ...req.query,
      tenant_id: req.user.userType === "superadmin" ? req.query.tenant_id : req.tenantId,
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 50,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await activityLogService.getActivityLogs(filters, options);

    res.status(200).json({
      message: "Activity logs retrieved successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get activity statistics
const getActivityStats = async (req, res) => {
  try {
    const tenantId = req.user.userType === "superadmin" ? req.query.tenant_id : req.tenantId;
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await activityLogService.getActivityStats(tenantId, options);

    res.status(200).json({
      message: "Activity statistics retrieved successfully",
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Export logs (SuperAdmin only)
const exportLogs = async (req, res) => {
  try {
    const filters = {
      ...req.query,
      tenant_id: req.query.tenant_id || null,
    };

    const options = {
      limit: 10000, // Large limit for export
    };

    const result = await activityLogService.getActivityLogs(filters, options);

    // Convert to CSV format
    const csvHeaders = [
      "Date",
      "Actor",
      "Actor Type",
      "Tenant",
      "Action",
      "Target Type",
      "Status",
      "Description",
      "IP Address",
    ];

    const csvRows = result.logs.map((log) => [
      log.createdAt.toISOString(),
      log.actor_id ? `${log.actor_id.firstName} ${log.actor_id.lastName}` : "System",
      log.actor_type,
      log.tenant_id ? log.tenant_id.name : "N/A",
      log.action,
      log.target_type || "N/A",
      log.status,
      log.description,
      log.ip_address || "N/A",
    ]);

    const csvContent = [csvHeaders.join(","), ...csvRows.map(row => row.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=activity-logs-${new Date().toISOString().split("T")[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting logs:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  getActivityLogs,
  getActivityStats,
  exportLogs,
};

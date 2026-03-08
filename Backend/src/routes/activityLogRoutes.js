const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// SuperAdmin routes for viewing all system logs
router.get(
  "/Logs",
  authenticate,
  authorize("superadmin"),
  activityLogController.getActivityLogs
);

router.get(
  "/Stats",
  authenticate,
  authorize("admin", "superadmin"),
  activityLogController.getActivityStats
);

router.get(
  "/Export",
  authenticate,
  authorize("superadmin"),
  activityLogController.exportLogs
);

module.exports = router;

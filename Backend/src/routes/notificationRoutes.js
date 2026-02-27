const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");
const notificationController = require("../controllers/notificationController");

// Send notification (admin only)
router.post(
  "/send",
  authenticate,
  tenantScope,
  authorize("admin", "superadmin"),
  notificationController.sendNotification
);

// Send bulk notifications (admin only)
router.post(
  "/send-bulk",
  authenticate,
  tenantScope,
  authorize("admin", "superadmin"),
  notificationController.sendBulkNotifications
);

// Get user notifications
router.get(
  "/",
  authenticate,
  tenantScope,
  notificationController.getUserNotifications
);

// Get unread count
router.get(
  "/unread-count",
  authenticate,
  tenantScope,
  notificationController.getUnreadCount
);

// Mark as read
router.patch(
  "/read/:id",
  authenticate,
  tenantScope,
  notificationController.markAsRead
);

// Mark all as read
router.patch(
  "/read-all",
  authenticate,
  tenantScope,
  notificationController.markAllAsRead
);

// Delete notification
router.delete(
  "/:id",
  authenticate,
  tenantScope,
  notificationController.deleteNotification
);

module.exports = router;

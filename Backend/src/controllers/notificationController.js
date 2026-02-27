const notificationService = require("../services/notificationService");

const sendNotification = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      senderId: req.user.id,
    };

    const notification = await notificationService.sendNotification(
      req.tenantId,
      notificationData
    );

    return res.status(201).json({
      message: "Notification sent successfully",
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const sendBulkNotifications = async (req, res) => {
  try {
    const { recipientIds, ...notificationData } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({
        message: "recipientIds array is required",
        success: false,
      });
    }

    const notifications = await notificationService.sendBulkNotifications(
      req.tenantId,
      recipientIds,
      {
        ...notificationData,
        senderId: req.user.id,
      }
    );

    return res.status(201).json({
      message: `${notifications.length} notifications sent successfully`,
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const filters = {
      isRead: req.query.isRead === "true" ? true : req.query.isRead === "false" ? false : undefined,
      type: req.query.type,
      limit: parseInt(req.query.limit) || 50,
    };

    const notifications = await notificationService.getUserNotifications(
      req.tenantId,
      req.user.id,
      filters
    );

    return res.status(200).json({
      message: "Notifications retrieved successfully",
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, req.tenantId);

    return res.status(200).json({
      message: "Notification marked as read",
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.tenantId, req.user.id);

    return res.status(200).json({
      message: "All notifications marked as read",
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.deleteNotification(id, req.tenantId);

    return res.status(200).json({
      message: "Notification deleted successfully",
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.tenantId, req.user.id);

    return res.status(200).json({
      message: "Unread count retrieved successfully",
      success: true,
      data: { count },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  sendNotification,
  sendBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};

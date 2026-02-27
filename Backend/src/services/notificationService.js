const Notification = require("../models/Notification.mongoose");

const sendNotification = async (tenantId, notificationData) => {
  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  const { recipientId, senderId, title, message, type, link, priority } = notificationData;

  if (!recipientId || !title || !message) {
    throw new Error("Recipient ID, Title, and Message are required");
  }

  const notification = await Notification.create({
    tenantId,
    recipientId,
    senderId,
    title,
    message,
    type: type || "system",
    link,
    priority: priority || "medium",
  });

  return notification;
};

const sendBulkNotifications = async (tenantId, recipientIds, notificationData) => {
  if (!tenantId || !recipientIds || recipientIds.length === 0) {
    throw new Error("Tenant ID and Recipient IDs are required");
  }

  const { senderId, title, message, type, link, priority } = notificationData;

  if (!title || !message) {
    throw new Error("Title and Message are required");
  }

  const notifications = recipientIds.map(recipientId => ({
    tenantId,
    recipientId,
    senderId,
    title,
    message,
    type: type || "system",
    link,
    priority: priority || "medium",
  }));

  const created = await Notification.insertMany(notifications);
  return created;
};

const getUserNotifications = async (tenantId, userId, filters = {}) => {
  if (!tenantId || !userId) {
    throw new Error("Tenant ID and User ID are required");
  }

  const query = { tenantId, recipientId: userId };

  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  const notifications = await Notification.find(query)
    .populate("senderId", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);

  return notifications;
};

const markAsRead = async (notificationId, tenantId) => {
  if (!notificationId || !tenantId) {
    throw new Error("Notification ID and Tenant ID are required");
  }

  const notification = await Notification.findOne({ _id: notificationId, tenantId });
  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

const markAllAsRead = async (tenantId, userId) => {
  if (!tenantId || !userId) {
    throw new Error("Tenant ID and User ID are required");
  }

  const result = await Notification.updateMany(
    { tenantId, recipientId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return result;
};

const deleteNotification = async (notificationId, tenantId) => {
  if (!notificationId || !tenantId) {
    throw new Error("Notification ID and Tenant ID are required");
  }

  const notification = await Notification.findOne({ _id: notificationId, tenantId });
  if (!notification) {
    throw new Error("Notification not found");
  }

  await notification.deleteOne();
  return notification;
};

const getUnreadCount = async (tenantId, userId) => {
  if (!tenantId || !userId) {
    throw new Error("Tenant ID and User ID are required");
  }

  const count = await Notification.countDocuments({
    tenantId,
    recipientId: userId,
    isRead: false,
  });

  return count;
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

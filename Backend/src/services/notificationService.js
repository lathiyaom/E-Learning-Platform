const Notification = require("../models/Notification.mongoose");
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  newCourse: {
    subject: 'New Course Published: {{courseTitle}}',
    html: `
      <h2>New Course Available!</h2>
      <p>A new course has been published in your organization:</p>
      <h3>{{courseTitle}}</h3>
      <p>{{courseDescription}}</p>
      <p>By: {{teacherName}}</p>
      <a href="{{courseLink}}">View Course</a>
    `
  },
  newLecture: {
    subject: 'New Lecture Added: {{lectureTitle}}',
    html: `
      <h2>New Lecture Available!</h2>
      <p>A new lecture has been added to your course:</p>
      <h3>{{lectureTitle}}</h3>
      <p>Course: {{courseTitle}}</p>
      <a href="{{lectureLink}}">View Lecture</a>
    `
  },
  eventCreated: {
    subject: 'New Event: {{eventTitle}}',
    html: `
      <h2>{{eventTitle}}</h2>
      <p>{{eventDescription}}</p>
      <p>Date: {{eventDate}}</p>
      <p>Location: {{eventLocation}}</p>
      <a href="{{eventLink}}">View Details</a>
    `
  },
  holidayAnnounced: {
    subject: 'Holiday: {{holidayTitle}}',
    html: `
      <h2>Holiday Announcement</h2>
      <p>{{holidayTitle}}</p>
      <p>Date: {{holidayDate}}</p>
      <p>{{holidayDescription}}</p>
    `
  }
};

// Send email notification
const sendEmailNotification = async (to, template, data, attachments = []) => {
  try {
    const transporter = createTransporter();
    const templateData = emailTemplates[template];
    
    if (!templateData) {
      throw new Error(`Email template ${template} not found`);
    }

    // Replace template variables
    let html = templateData.html;
    let subject = templateData.subject;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
      subject = subject.replace(regex, data[key]);
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      attachments
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, template });
    return result;
  } catch (error) {
    logger.error('Email sending failed', { error: error.message, to, template });
    throw error;
  }
};

// Send bulk email notifications
const sendBulkEmailNotifications = async (recipients, template, data) => {
  const results = [];
  const batchSize = 10; // Send in batches to avoid rate limiting
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const promises = batch.map(recipient => 
      sendEmailNotification(recipient.email, template, { ...data, userName: recipient.firstName })
    );
    
    try {
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    } catch (error) {
      logger.error('Batch email sending failed', { error: error.message, batch: i / batchSize });
    }
  }
  
  return results;
};

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
  sendEmailNotification,
  sendBulkEmailNotifications,
  emailTemplates
};

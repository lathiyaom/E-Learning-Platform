// MongoDB Models (Mongoose)
const User = require("./User.mongoose");
const Course = require("./Course.mongoose");
const ContactUs = require("./ContactUs.mongoose");
const Tenant = require("./Tenant.mongoose");
const Bookmark = require("./Bookmark.mongoose");
const Newsletter = require("./Newsletter.mongoose");

// New Feature Models
const Attendance = require("./Attendance.mongoose");
const Assignment = require("./Assignment.mongoose");
const AssignmentSubmission = require("./AssignmentSubmission.mongoose");
const CourseMaterial = require("./CourseMaterial.mongoose");

const Enrollment = require("./Enrollment.mongoose");
const Feedback = require("./Feedback.mongoose");
const Notification = require("./Notification.mongoose");

// Additional Feature Models
const Event = require("./Event.mongoose");
const Holiday = require("./Holiday.mongoose");
const Lecture = require("./Lecture.mongoose");
const Rating = require("./Rating.mongoose");

// System Models
const ActivityLog = require("./ActivityLog.mongoose");
const Conversation = require("./Conversation.mongoose");
const Message = require("./Message.mongoose");


module.exports = {
  User,
  Course,
  ContactUs,
  Tenant,
  Bookmark,
  Newsletter,
  Attendance,
  Assignment,
  AssignmentSubmission,
  CourseMaterial,

  Enrollment,
  Feedback,
  Notification,
  Event,
  Holiday,
  Lecture,
  Rating,
  ActivityLog,
  Conversation,
  Message,
};

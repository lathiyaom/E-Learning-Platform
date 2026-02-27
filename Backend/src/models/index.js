// MongoDB Models (Mongoose)
const User = require("./User.mongoose");
const Course = require("./Course.mongoose");
const ContactUs = require("./ContactUs.mongoose");
const Tenant = require("./Tenant.mongoose");
const Bookmark = require("./Bookmark.mongoose");
const Newsletter = require("./Newsletter.mongoose");

// New Feature Models
const Attendance = require("./Attendance.mongoose");
const Exam = require("./Exam.mongoose");
const ExamSubmission = require("./ExamSubmission.mongoose");
const Enrollment = require("./Enrollment.mongoose");
const Feedback = require("./Feedback.mongoose");
const Notification = require("./Notification.mongoose");

// Additional Feature Models
const Event = require("./Event.mongoose");
const Holiday = require("./Holiday.mongoose");
const Lecture = require("./Lecture.mongoose");
const Timetable = require("./Timetable.mongoose");
const Rating = require("./Rating.mongoose");

// Sequelize Models (COMMENTED OUT)
// const User = require("./User");
// const Course = require("./Course");
// const ContactUs = require("./ContactUs");
// const Tenant = require("./tenants");
// const Bookmark = require("./Bookmark");
// const Newsletter = require("./Newsletter");

// Sequelize relationships (COMMENTED OUT - MongoDB uses refs in schemas)
// User.hasMany(Bookmark, { foreignKey: "userId", onDelete: "CASCADE" });
// Bookmark.belongsTo(User);
// Course.hasMany(Bookmark, { foreignKey: "courseId", onDelete: "CASCADE" });
// Bookmark.belongsTo(Course);
// Tenant.hasMany(User, { foreignKey: "tenantId", onDelete: "CASCADE" });
// User.belongsTo(Tenant);
// User.hasMany(ContactUs, { foreignKey: "userId", onDelete: "SET NULL" });
// ContactUs.belongsTo(User);

module.exports = {
  User,
  Course,
  ContactUs,
  Tenant,
  Bookmark,
  Newsletter,
  Attendance,
  Exam,
  ExamSubmission,
  Enrollment,
  Feedback,
  Notification,
  Event,
  Holiday,
  Lecture,
  Timetable,
  Rating,
};

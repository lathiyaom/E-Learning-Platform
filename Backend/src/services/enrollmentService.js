const Enrollment = require("../models/Enrollment.mongoose");
const { Course, User } = require("../models");

const enrollStudent = async (tenantId, courseId, studentId) => {
  if (!tenantId || !courseId || !studentId) {
    throw new Error("Tenant ID, Course ID, and Student ID are required");
  }

  // Verify course exists in tenant
  const course = await Course.findOne({ _id: courseId, tenantId });
  if (!course) {
    throw new Error("Course not found");
  }

  // Verify student exists in tenant
  const student = await User.findOne({ _id: studentId, tenantId });
  if (!student) {
    throw new Error("Student not found");
  }

  // Check if already enrolled
  const existing = await Enrollment.findOne({ tenantId, courseId, studentId });
  if (existing) {
    throw new Error("Student already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    tenantId,
    courseId,
    studentId,
  });

  return enrollment;
};

const getStudentEnrollments = async (tenantId, studentId) => {
  if (!tenantId || !studentId) {
    throw new Error("Tenant ID and Student ID are required");
  }

  const enrollments = await Enrollment.find({ tenantId, studentId })
    .populate("courseId")
    .sort({ enrolledAt: -1 });

  return enrollments;
};

const getCourseEnrollments = async (tenantId, courseId) => {
  if (!tenantId || !courseId) {
    throw new Error("Tenant ID and Course ID are required");
  }

  const enrollments = await Enrollment.find({ tenantId, courseId })
    .populate("studentId", "firstName lastName email")
    .sort({ enrolledAt: -1 });

  return enrollments;
};

const updateProgress = async (enrollmentId, tenantId, progressPercent) => {
  if (!enrollmentId || !tenantId) {
    throw new Error("Enrollment ID and Tenant ID are required");
  }

  const enrollment = await Enrollment.findOne({ _id: enrollmentId, tenantId });
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  enrollment.progressPercent = progressPercent;
  enrollment.lastAccessedAt = new Date();

  if (progressPercent >= 100) {
    enrollment.status = "completed";
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  return enrollment;
};

const dropCourse = async (enrollmentId, tenantId) => {
  if (!enrollmentId || !tenantId) {
    throw new Error("Enrollment ID and Tenant ID are required");
  }

  const enrollment = await Enrollment.findOne({ _id: enrollmentId, tenantId });
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  enrollment.status = "dropped";
  await enrollment.save();

  return enrollment;
};

const deleteEnrollment = async (enrollmentId, tenantId) => {
  if (!enrollmentId || !tenantId) {
    throw new Error("Enrollment ID and Tenant ID are required");
  }

  const enrollment = await Enrollment.findOne({ _id: enrollmentId, tenantId });
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  await enrollment.deleteOne();
  return enrollment;
};

module.exports = {
  enrollStudent,
  getStudentEnrollments,
  getCourseEnrollments,
  updateProgress,
  dropCourse,
  deleteEnrollment,
};

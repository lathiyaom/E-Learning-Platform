const Enrollment = require("../models/Enrollment.mongoose");
const { Course, User } = require("../models");

const resolveCourseOrganizationId = (course) => course.tenantId || course.organization_id;

const COURSE_SELECT_FIELDS =
  "title description category image lessons video_url videoUrl createdAt teacher_id createdBy";
const INSTRUCTOR_SELECT_FIELDS = "firstName lastName avatar";

const coursePopulateConfig = [
  {
    path: "courseId",
    select: COURSE_SELECT_FIELDS,
    populate: [
      { path: "teacher_id", select: INSTRUCTOR_SELECT_FIELDS },
      { path: "createdBy", select: INSTRUCTOR_SELECT_FIELDS },
    ],
  },
  {
    path: "course_id",
    select: COURSE_SELECT_FIELDS,
    populate: [
      { path: "teacher_id", select: INSTRUCTOR_SELECT_FIELDS },
      { path: "createdBy", select: INSTRUCTOR_SELECT_FIELDS },
    ],
  },
];

const enrollStudent = async (tenantId, courseId, studentId) => {
  if (!tenantId || !courseId || !studentId) {
    throw new Error("Tenant ID, Course ID, and Student ID are required");
  }

  // Verify course exists in tenant
  const course = await Course.findOne({
    _id: courseId,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
  if (!course) {
    throw new Error("Course not found");
  }

  // Verify student exists in tenant
  const student = await User.findOne({ _id: studentId });
  if (!student) {
    throw new Error("Student not found");
  }

  // Check if already enrolled
  const existing = await Enrollment.findOne({
    $or: [
      { tenantId, courseId, studentId },
      { organization_id: tenantId, course_id: courseId, student_id: studentId },
    ],
  });
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

const enrollStudentAcrossPlatform = async (courseId, studentId) => {
  if (!courseId || !studentId) {
    throw new Error("Course ID and Student ID are required");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const organizationId = resolveCourseOrganizationId(course);
  if (!organizationId) {
    throw new Error("Course organization context is missing");
  }

  const student = await User.findById(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const existing = await Enrollment.findOne({
    $or: [
      { studentId, courseId },
      { student_id: studentId, course_id: courseId },
    ],
  });
  if (existing) {
    throw new Error("Student already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    tenantId: organizationId,
    organization_id: organizationId,
    courseId,
    course_id: courseId,
    studentId,
    student_id: studentId,
    enrolledAt: new Date(),
    enrolled_at: new Date(),
    progressPercent: 0,
    progress: 0,
    status: "active",
  });

  return enrollment;
};

const getStudentEnrollments = async (tenantId, studentId) => {
  if (!tenantId || !studentId) {
    throw new Error("Tenant ID and Student ID are required");
  }

  const enrollments = await Enrollment.find({
    $or: [
      { tenantId, studentId },
      { organization_id: tenantId, student_id: studentId },
    ],
  })
    .populate(coursePopulateConfig)
    .sort({ enrolledAt: -1 });

  return enrollments;
};

const getStudentEnrollmentsAcrossPlatform = async (studentId) => {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  const enrollments = await Enrollment.find({
    $or: [{ studentId }, { student_id: studentId }],
  })
    .populate(coursePopulateConfig)
    .sort({ enrolledAt: -1, enrolled_at: -1 });

  return enrollments;
};

const getCourseEnrollments = async (tenantId, courseId) => {
  if (!tenantId || !courseId) {
    throw new Error("Tenant ID and Course ID are required");
  }

  const enrollments = await Enrollment.find({
    $or: [
      { tenantId, courseId },
      { organization_id: tenantId, course_id: courseId },
    ],
  })
    .populate("studentId", "firstName lastName email")
    .populate("student_id", "firstName lastName email")
    .sort({ enrolledAt: -1 });

  return enrollments;
};

const updateProgress = async (enrollmentId, tenantId, progressPercent) => {
  if (!enrollmentId || !tenantId) {
    throw new Error("Enrollment ID and Tenant ID are required");
  }

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  enrollment.progressPercent = progressPercent;
  enrollment.progress = progressPercent;
  enrollment.lastAccessedAt = new Date();
  enrollment.last_accessed_at = new Date();

  if (progressPercent >= 100) {
    enrollment.status = "completed";
    enrollment.completedAt = new Date();
    enrollment.completed_at = new Date();
  }

  await enrollment.save();
  return enrollment;
};

const dropCourse = async (enrollmentId, tenantId) => {
  if (!enrollmentId || !tenantId) {
    throw new Error("Enrollment ID and Tenant ID are required");
  }

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
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

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  await enrollment.deleteOne();
  return enrollment;
};

module.exports = {
  enrollStudent,
  enrollStudentAcrossPlatform,
  getStudentEnrollments,
  getStudentEnrollmentsAcrossPlatform,
  getCourseEnrollments,
  updateProgress,
  dropCourse,
  deleteEnrollment,
};

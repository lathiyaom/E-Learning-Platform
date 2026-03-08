const enrollmentService = require("../services/enrollmentService");

const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        message: "courseId is required",
        success: false,
      });
    }

    // Students enroll themselves, or admin can enroll a student
    const studentId = req.body.studentId || req.user.id;

    let enrollment;
    if (req.user.userType === "student") {
      enrollment = await enrollmentService.enrollStudentAcrossPlatform(
        courseId,
        studentId
      );
    } else {
      const tenantId = req.tenantId || req.user.id;
      enrollment = await enrollmentService.enrollStudent(
        tenantId,
        courseId,
        studentId
      );
    }

    return res.status(201).json({
      message: "Enrolled successfully",
      success: true,
      data: enrollment,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    // Get current user's enrollments
    const studentId = req.user.id;

    const enrollments = await enrollmentService.getStudentEnrollmentsAcrossPlatform(
      studentId
    );

    return res.status(200).json({
      message: "Your enrollments retrieved successfully",
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getStudentEnrollments = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Students can only view their own enrollments
    if (req.user.userType === "student" && req.user.id !== studentId) {
      return res.status(403).json({
        message: "You can only view your own enrollments",
        success: false,
      });
    }

    const enrollments = await enrollmentService.getStudentEnrollments(
      req.tenantId,
      studentId
    );

    return res.status(200).json({
      message: "Enrollments retrieved successfully",
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await enrollmentService.getCourseEnrollments(
      req.tenantId,
      courseId
    );

    return res.status(200).json({
      message: "Course enrollments retrieved successfully",
      success: true,
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressPercent } = req.body;

    if (progressPercent === undefined || progressPercent < 0 || progressPercent > 100) {
      return res.status(400).json({
        message: "progressPercent must be between 0 and 100",
        success: false,
      });
    }

    const enrollment = await enrollmentService.updateProgress(
      id,
      req.tenantId,
      progressPercent
    );

    return res.status(200).json({
      message: "Progress updated successfully",
      success: true,
      data: enrollment,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const dropCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await enrollmentService.dropCourse(id, req.tenantId);

    return res.status(200).json({
      message: "Course dropped successfully",
      success: true,
      data: enrollment,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await enrollmentService.deleteEnrollment(id, req.tenantId);

    return res.status(200).json({
      message: "Enrollment deleted successfully",
      success: true,
      data: enrollment,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  enrollStudent,
  getMyEnrollments,
  getStudentEnrollments,
  getCourseEnrollments,
  updateProgress,
  dropCourse,
  deleteEnrollment,
};

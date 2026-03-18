const attendanceService = require("../services/attendanceService");

const markAttendance = async (req, res) => {
  try {
    const { courseId, classDate, attendanceRecords } = req.body;

    if (!courseId || !classDate || !attendanceRecords) {
      return res.status(400).json({
        message: "courseId, classDate, and attendanceRecords required",
        success: false,
      });
    }

    const attendance = await attendanceService.markAttendance(
      req.tenantId,
      courseId,
      new Date(classDate),
      attendanceRecords,
      req.user.id,
    );

    return res.status(201).json({
      message: "Attendance marked successfully",
      success: true,
      data: attendance,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceRecords } = req.body;

    if (!attendanceRecords) {
      return res.status(400).json({
        message: "attendanceRecords required",
        success: false,
      });
    }

    const attendance = await attendanceService.updateAttendance(
      id,
      req.tenantId,
      attendanceRecords,
    );

    return res.status(200).json({
      message: "Attendance updated successfully",
      success: true,
      data: attendance,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const { courseId } = req.params;

    const report = await attendanceService.getAttendanceReport(
      req.tenantId,
      courseId,
    );

    return res.status(200).json({
      message: "Attendance report retrieved",
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Students can only view their own attendance
    if (req.user.userType === "student" && req.user.id !== studentId) {
      return res.status(403).json({
        message: "You can only view your own attendance",
        success: false,
      });
    }

    const attendance = await attendanceService.getStudentAttendance(
      req.tenantId,
      studentId,
      courseId,
      req.user.userType,
    );

    return res.status(200).json({
      message: "Student attendance retrieved",
      success: true,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await attendanceService.deleteAttendance(
      id,
      req.tenantId,
    );

    return res.status(200).json({
      message: "Attendance deleted successfully",
      success: true,
      data: attendance,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  markAttendance,
  updateAttendance,
  getAttendanceReport,
  getStudentAttendance,
  deleteAttendance,
};

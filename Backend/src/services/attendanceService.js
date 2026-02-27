const Attendance = require("../models/Attendance.mongoose");
const { User } = require("../models");

const markAttendance = async (tenantId, courseId, classDate, attendanceRecords, markedBy) => {
  if (!courseId || !classDate || !attendanceRecords || attendanceRecords.length === 0) {
    throw new Error("Missing required fields");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  // Validate all student IDs exist in the tenant
  const studentIds = attendanceRecords.map(r => r.studentId);
  const students = await User.find({ _id: { $in: studentIds }, tenantId });
  
  if (students.length !== studentIds.length) {
    throw new Error("Some students not found in tenant");
  }

  // Check for duplicate attendance for same date
  const existing = await Attendance.findOne({ courseId, classDate, tenantId });
  if (existing) {
    throw new Error("Attendance already marked for this date");
  }

  const attendance = await Attendance.create({
    tenantId,
    courseId,
    classDate,
    attendanceRecords,
    markedBy,
  });

  return attendance;
};

const updateAttendance = async (attendanceId, tenantId, attendanceRecords) => {
  if (!attendanceId || !tenantId) {
    throw new Error("Attendance ID and Tenant ID are required");
  }

  const attendance = await Attendance.findOne({ _id: attendanceId, tenantId });
  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  attendance.attendanceRecords = attendanceRecords;
  await attendance.save();

  return attendance;
};

const getAttendanceReport = async (tenantId, courseId) => {
  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  const query = { tenantId };
  if (courseId) query.courseId = courseId;

  const records = await Attendance.find(query)
    .populate("courseId", "title")
    .populate("attendanceRecords.studentId", "firstName lastName email")
    .populate("markedBy", "firstName lastName")
    .sort({ classDate: -1 });
  
  return records;
};

const getStudentAttendance = async (tenantId, studentId, courseId) => {
  if (!tenantId || !studentId) {
    throw new Error("Tenant ID and Student ID are required");
  }

  const query = { tenantId, "attendanceRecords.studentId": studentId };
  if (courseId) query.courseId = courseId;
  
  const records = await Attendance.find(query)
    .populate("courseId", "title")
    .sort({ classDate: -1 });
  
  // Calculate attendance percentage
  const totalClasses = records.length;
  const presentDays = records.reduce((acc, rec) => {
    const studentRec = rec.attendanceRecords.find(r => r.studentId.toString() === studentId);
    return acc + (studentRec?.status === "present" ? 1 : 0);
  }, 0);
  
  return {
    records,
    totalClasses,
    presentDays,
    attendancePercentage: totalClasses > 0 ? ((presentDays / totalClasses) * 100).toFixed(2) : 0,
  };
};

const deleteAttendance = async (attendanceId, tenantId) => {
  if (!attendanceId || !tenantId) {
    throw new Error("Attendance ID and Tenant ID are required");
  }

  const attendance = await Attendance.findOne({ _id: attendanceId, tenantId });
  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  await attendance.deleteOne();
  return attendance;
};

module.exports = {
  markAttendance,
  updateAttendance,
  getAttendanceReport,
  getStudentAttendance,
  deleteAttendance,
};

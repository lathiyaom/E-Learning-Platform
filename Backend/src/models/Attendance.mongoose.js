const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    classDate: {
      type: Date,
      required: true,
      index: true,
    },
    attendanceRecords: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["present", "absent", "late"],
          required: true,
        },
        markedAt: {
          type: Date,
          default: Date.now,
        },
        remarks: String,
      },
    ],
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: String,
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
attendanceSchema.index({ tenantId: 1, courseId: 1, classDate: 1 });
attendanceSchema.index({ tenantId: 1, classDate: 1 });
attendanceSchema.index({ "attendanceRecords.studentId": 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;

const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    lectureDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    room: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["theory", "practical", "lab", "tutorial", "seminar"],
      default: "theory",
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    materials: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["pdf", "doc", "ppt", "video", "link", "other"],
          default: "other",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    attendanceMarked: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes
lectureSchema.index({ tenantId: 1, courseId: 1 });
lectureSchema.index({ tenantId: 1, lectureDate: 1 });
lectureSchema.index({ tenantId: 1, conductedBy: 1 });
lectureSchema.index({ tenantId: 1, status: 1, lectureDate: 1 });

// Virtual for attendance records
lectureSchema.virtual("attendance", {
  ref: "Attendance",
  localField: "_id",
  foreignField: "lectureId",
});

const Lecture = mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;

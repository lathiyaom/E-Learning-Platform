const mongoose = require("mongoose");

const lectureProgressSchema = new mongoose.Schema(
  {
    lecture_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseMaterial",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    watch_time: {
      type: Number, // in seconds
      default: 0,
    },
    total_duration: {
      type: Number, // in seconds
      default: 0,
    },
    last_position: {
      type: Number, // last watched position in seconds
      default: 0,
    },
    completion_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    bookmark_time: {
      type: Number, // bookmark position in seconds
      default: null,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "skipped"],
      default: "not_started",
    }
  },
  {
    timestamps: true,
  }
);

// Ensure unique progress per student per lecture
lectureProgressSchema.index({ student_id: 1, lecture_id: 1 }, { unique: true });
lectureProgressSchema.index({ course_id: 1, student_id: 1 });
lectureProgressSchema.index({ organization_id: 1 });
lectureProgressSchema.index({ completed: 1 });
lectureProgressSchema.index({ status: 1 });

const LectureProgress = mongoose.model("LectureProgress", lectureProgressSchema);

module.exports = LectureProgress;

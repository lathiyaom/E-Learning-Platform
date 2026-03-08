const mongoose = require("mongoose");

const courseMaterialSchema = new mongoose.Schema(
  {
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
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "pdf", "document"],
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number, // in bytes
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // for videos in seconds
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    is_downloadable: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0, // for ordering materials within a course
    },
    status: {
      type: String,
      enum: ["active", "inactive", "processing"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
courseMaterialSchema.index({ course_id: 1, order: 1 });
courseMaterialSchema.index({ organization_id: 1 });
courseMaterialSchema.index({ teacher_id: 1 });
courseMaterialSchema.index({ type: 1 });

const CourseMaterial = mongoose.model("CourseMaterial", courseMaterialSchema);

module.exports = CourseMaterial;

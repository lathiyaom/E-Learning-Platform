const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
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
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolled_at: {
      type: Date,
      default: Date.now,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    last_accessed_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped", "suspended"],
      default: "active",
    },
    certificate_issued: {
      type: Boolean,
      default: false,
    },
    certificate_url: {
      type: String,
      default: null,
    },
    // Track completion of specific materials
    completed_materials: [{
      material_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseMaterial"
      },
      completed_at: {
        type: Date,
        default: Date.now
      }
    }],
    // Rating and review for the course
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      default: "",
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
    // Legacy fields for backward compatibility
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    enrolledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound indexes
enrollmentSchema.index({ organization_id: 1, student_id: 1 });
enrollmentSchema.index({ organization_id: 1, course_id: 1 });
enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });
enrollmentSchema.index({ student_id: 1 });
enrollmentSchema.index({ course_id: 1 });
enrollmentSchema.index({ status: 1 });
// Legacy indexes for backward compatibility
enrollmentSchema.index({ tenantId: 1, studentId: 1 });
enrollmentSchema.index({ tenantId: 1, courseId: 1 });
enrollmentSchema.index({ tenantId: 1, studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;

const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    // Actor who performed the action
    actor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor_type: {
      type: String,
      enum: ["superadmin", "admin", "teacher", "student"],
      required: true,
    },
    
    // Tenant context
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    
    // Action performed
    action: {
      type: String,
      required: true,
      enum: [
        "tenant_created",
        "tenant_updated",
        "tenant_deleted",
        "tenant_suspended",
        "tenant_activated",
        "user_created",
        "user_updated",
        "user_deleted",
        "user_suspended",
        "user_activated",
        "course_created",
        "course_updated",
        "course_deleted",
        "enrollment_created",
        "enrollment_completed",
        "attendance_marked",
        "exam_created",
        "exam_submitted",
        "login_success",
        "login_failed",
        "logout",
        "password_changed",
        "profile_updated",
      ],
    },
    
    // Target of the action (if applicable)
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    target_type: {
      type: String,
      enum: ["User", "Tenant", "Course", "Enrollment", "Exam", "Attendance"],
    },
    
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // IP address and user agent
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
    },
    
    // Status of the action
    status: {
      type: String,
      enum: ["success", "failure", "warning"],
      default: "success",
    },
    
    // Description (human-readable)
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
activityLogSchema.index({ tenant_id: 1, createdAt: -1 });
activityLogSchema.index({ actor_id: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ tenant_id: 1, action: 1, createdAt: -1 });

// Text index for search functionality
activityLogSchema.index({ description: "text", "metadata.email": "text" });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;

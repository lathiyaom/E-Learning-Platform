const mongoose = require("mongoose");

const teacherOrganizationSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "invited", "joined", "left"],
      default: "pending",
    },
    application_type: {
      type: String,
      enum: ["application", "invitation"],
      required: true,
    },
    applied_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejected_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    application_message: {
      type: String,
      maxlength: 1000,
    },
    invitation_message: {
      type: String,
      maxlength: 1000,
    },
    rejection_reason: {
      type: String,
      maxlength: 500,
    },
    applied_at: {
      type: Date,
      default: Date.now,
    },
    invited_at: {
      type: Date,
    },
    approved_at: {
      type: Date,
    },
    rejected_at: {
      type: Date,
    },
    joined_at: {
      type: Date,
    },
    left_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
teacherOrganizationSchema.index({ teacher_id: 1, organization_id: 1 }, { unique: true });
teacherOrganizationSchema.index({ organization_id: 1, status: 1 });
teacherOrganizationSchema.index({ status: 1, application_type: 1 });
teacherOrganizationSchema.index({ teacher_id: 1, status: "joined" });
teacherOrganizationSchema.index({ organization_id: 1, status: "pending" });

const TeacherOrganization = mongoose.model("TeacherOrganization", teacherOrganizationSchema);

module.exports = TeacherOrganization;

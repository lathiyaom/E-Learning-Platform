const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    // Basic assignment info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    instructions: {
      type: String,
      maxlength: 5000,
    },

    // Course and teacher relationship
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Assignment details
    assignmentType: {
      type: String,
      enum: [
        "homework",
        "project",
        "quiz",
        "essay",
        "presentation",
        "lab",
        "other",
      ],
      default: "homework",
    },
    maxPoints: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },

    // Timing
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenaltyPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Submission settings
    submissionType: {
      type: String,
      enum: ["text", "file", "link", "multiple"],
      default: "text",
    },
    allowedFileTypes: [
      {
        type: String,
        enum: [
          "pdf",
          "doc",
          "docx",
          "txt",
          "jpg",
          "jpeg",
          "png",
          "zip",
          "ppt",
          "pptx",
        ],
      },
    ],
    maxFileSize: {
      type: Number, // in MB
      default: 10,
    },
    maxFiles: {
      type: Number,
      default: 1,
    },

    // Visibility and access
    isVisible: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
    },

    // Grading settings
    gradingRubric: [
      {
        criteria: String,
        description: String,
        maxPoints: Number,
      },
    ],
    autoGrade: {
      type: Boolean,
      default: false,
    },

    // Metadata
    tags: [String],
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    estimatedTime: {
      type: Number, // in minutes
      min: 1,
    },

    // Multi-tenant support
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
assignmentSchema.index({ courseId: 1, dueDate: 1 });
assignmentSchema.index({ teacherId: 1, assignedDate: -1 });
assignmentSchema.index({ tenantId: 1, isVisible: 1 });
assignmentSchema.index({ dueDate: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual("isOverdue").get(function () {
  return new Date() > this.dueDate;
});

// Virtual for checking if late submission is allowed
assignmentSchema.virtual("allowsLateSubmission").get(function () {
  return this.allowLateSubmission && this.latePenaltyPercent > 0;
});

// Pre-save middleware
assignmentSchema.pre("save", function () {
  if (this.isVisible && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model("Assignment", assignmentSchema);

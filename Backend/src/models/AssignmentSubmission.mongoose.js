const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    // Relationship
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    
    // Submission content
    submissionType: {
      type: String,
      enum: ["text", "file", "link", "multiple"],
      required: true,
    },
    textContent: {
      type: String,
      maxlength: 10000,
    },
    fileSubmissions: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number, // in bytes
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    linkSubmissions: [{
      url: String,
      title: String,
      description: String,
    }],
    
    // Submission timing
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    latePenaltyApplied: {
      type: Number,
      default: 0,
    },
    
    // Grading
    grade: {
      type: Number,
      min: 0,
    },
    maxGrade: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    letterGrade: {
      type: String,
      enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "I", "W"],
    },
    
    // Feedback
    teacherFeedback: {
      type: String,
      maxlength: 2000,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
    
    // Rubric grading
    rubricScores: [{
      criteria: String,
      score: Number,
      maxPoints: Number,
      feedback: String,
    }],
    
    // Status
    status: {
      type: String,
      enum: ["draft", "submitted", "graded", "returned", "resubmitted"],
      default: "draft",
    },
    
    // Academic integrity
    plagiarismScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    plagiarismReport: {
      type: String,
    },
    
    // Student notes
    studentNotes: {
      type: String,
      maxlength: 1000,
    },
    
    // Submission attempts
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxAttempts: {
      type: Number,
      default: 1,
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
  }
);

// Indexes for better performance
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 });
assignmentSubmissionSchema.index({ studentId: 1, submittedAt: -1 });
assignmentSubmissionSchema.index({ courseId: 1, status: 1 });
assignmentSubmissionSchema.index({ teacherId: 1, gradedAt: -1 });
assignmentSubmissionSchema.index({ tenantId: 1, status: 1 });

// Virtual for checking if submission is graded
assignmentSubmissionSchema.virtual("isGraded").get(function() {
  return this.grade !== null && this.grade !== undefined;
});

// Virtual for checking if submission can be resubmitted
assignmentSubmissionSchema.virtual("canResubmit").get(function() {
  return this.attemptNumber < this.maxAttempts && this.status !== "graded";
});

// Pre-save middleware to calculate percentage and letter grade
assignmentSubmissionSchema.pre("save", function(next) {
  if (this.grade !== null && this.grade !== undefined && this.maxGrade) {
    this.percentage = (this.grade / this.maxGrade) * 100;
    
    // Calculate letter grade
    const percentage = this.percentage;
    if (percentage >= 97) this.letterGrade = "A+";
    else if (percentage >= 93) this.letterGrade = "A";
    else if (percentage >= 90) this.letterGrade = "A-";
    else if (percentage >= 87) this.letterGrade = "B+";
    else if (percentage >= 83) this.letterGrade = "B";
    else if (percentage >= 80) this.letterGrade = "B-";
    else if (percentage >= 77) this.letterGrade = "C+";
    else if (percentage >= 73) this.letterGrade = "C";
    else if (percentage >= 70) this.letterGrade = "C-";
    else if (percentage >= 67) this.letterGrade = "D+";
    else if (percentage >= 60) this.letterGrade = "D";
    else this.letterGrade = "F";
  }
  next();
});

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);

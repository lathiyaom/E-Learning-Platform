const mongoose = require("mongoose");

const examSubmissionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        answer: mongoose.Schema.Types.Mixed, // String or Array for MCQ
        isCorrect: Boolean,
        marksAwarded: Number,
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    feedback: String,
    status: {
      type: String,
      enum: ["submitted", "graded", "pending_review"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

// Compound indexes
examSubmissionSchema.index({ tenantId: 1, examId: 1, studentId: 1 }, { unique: true });
examSubmissionSchema.index({ tenantId: 1, studentId: 1 });

const ExamSubmission = mongoose.model("ExamSubmission", examSubmissionSchema);

module.exports = ExamSubmission;

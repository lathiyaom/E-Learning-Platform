const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
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
    },
    description: String,
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number, // minutes
      required: true,
      min: 1,
    },
    questions: [
      {
        text: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["mcq", "short", "essay"],
          required: true,
        },
        options: [String], // For MCQ
        correctAnswer: String, // For MCQ and short answer
        marks: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
examSchema.index({ tenantId: 1, courseId: 1 });
examSchema.index({ tenantId: 1, status: 1 });
examSchema.index({ startDate: 1, endDate: 1 });

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
